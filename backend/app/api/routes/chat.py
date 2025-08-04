from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import io

from app.db.database import get_db
from app.db.models import ChatMessage, Project, GeneratedDocument
from app.schemas.schemas import ChatMessageRequest, ChatMessageResponse, ChatResponse, GeneratedDocumentResponse, GeneratedDocumentCreate, GeneratedDocumentUpdate
from app.services.chat_service import ChatService
from app.services.export_service import DocumentExportService

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat_with_project(
    chat_request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """Send a message and get AI response based on project documents"""
    
    # Validate project exists
    project = db.query(Project).filter(Project.id == chat_request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get recent chat history for context
    recent_messages = db.query(ChatMessage).filter(
        ChatMessage.project_id == chat_request.project_id
    ).order_by(ChatMessage.timestamp.desc()).limit(5).all()
    
    # Format chat history
    chat_history = []
    for msg in reversed(recent_messages):  # Reverse to get chronological order
        chat_history.append({
            "message": msg.message,
            "response": msg.response
        })
    
    # Get AI response
    chat_service = ChatService()
    response_data = await chat_service.chat_with_documents(
        query=chat_request.message,
        project_id=chat_request.project_id,
        chat_history=chat_history
    )
    
    # Save chat message to database
    db_message = ChatMessage(
        project_id=chat_request.project_id,
        message=chat_request.message,
        response=response_data["response"]
    )
    db.add(db_message)
    db.commit()
    
    return ChatResponse(
        response=response_data["response"],
        sources=response_data["sources"]
    )

@router.get("/project/{project_id}/history", response_model=List[ChatMessageResponse])
def get_chat_history(
    project_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get chat history for a project"""
    
    # Validate project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    messages = db.query(ChatMessage).filter(
        ChatMessage.project_id == project_id
    ).order_by(ChatMessage.timestamp.desc()).offset(skip).limit(limit).all()
    
    return messages

@router.delete("/project/{project_id}/history")
def clear_chat_history(project_id: int, db: Session = Depends(get_db)):
    """Clear all chat history for a project"""
    
    # Validate project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Delete all chat messages for the project
    deleted_count = db.query(ChatMessage).filter(
        ChatMessage.project_id == project_id
    ).delete()
    
    db.commit()
    
    return {"message": f"Deleted {deleted_count} chat messages"}

@router.post("/project/{project_id}/summary")
async def generate_project_summary(
    project_id: int,
    summary_type: str = "general",
    db: Session = Depends(get_db)
):
    """Generate a summary of all documents in the project"""
    
    # Validate project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    chat_service = ChatService()
    summary = await chat_service.generate_summary(project_id, summary_type)
    
    return {"summary": summary, "summary_type": summary_type}

@router.get("/message/{message_id}", response_model=ChatMessageResponse)
def get_chat_message(message_id: int, db: Session = Depends(get_db)):
    """Get a specific chat message by ID"""
    message = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message

# NEW GENERATION ENDPOINTS

@router.post("/project/{project_id}/generate_mvp")
async def generate_mvp(
    project_id: int,
    request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """Generate an MVP plan based on project documents"""
    
    # Validate project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    chat_service = ChatService()
    response = await chat_service.generate_mvp(project_id, request.message)
    return ChatResponse(response=response, sources=[])

@router.post("/project/{project_id}/generate_prd")
async def generate_prd(
    project_id: int,
    request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """Generate a Product Requirements Document based on project documents"""
    
    # Validate project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    chat_service = ChatService()
    response = await chat_service.generate_prd(project_id, request.message)
    return ChatResponse(response=response, sources=[])

@router.post("/project/{project_id}/generate_rfp")
async def generate_rfp(
    project_id: int,
    request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """Generate a Request for Proposal based on project documents"""
    
    # Validate project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    chat_service = ChatService()
    response = await chat_service.generate_rfp(project_id, request.message)
    return ChatResponse(response=response, sources=[])

@router.post("/project/{project_id}/generate_design")
async def generate_design(
    project_id: int,
    request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """Generate a System Design Document based on previously generated documents"""
    
    # Validate project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    chat_service = ChatService()
    # The request.message should contain the context from previous generations
    response = await chat_service.generate_design(project_id, request.message)
    return ChatResponse(response=response, sources=[])

# GENERATED DOCUMENTS MANAGEMENT ENDPOINTS

@router.get("/project/{project_id}/generated_documents", response_model=List[GeneratedDocumentResponse])
def get_generated_documents(
    project_id: int,
    document_type: str = None,
    db: Session = Depends(get_db)
):
    """Get all generated documents for a project, optionally filtered by type"""
    
    # Validate project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    query = db.query(GeneratedDocument).filter(
        GeneratedDocument.project_id == project_id,
        GeneratedDocument.is_latest == True
    )
    
    if document_type:
        query = query.filter(GeneratedDocument.document_type == document_type)
    
    documents = query.order_by(GeneratedDocument.created_at.desc()).all()
    return documents

@router.get("/generated_document/{document_id}", response_model=GeneratedDocumentResponse)
def get_generated_document(document_id: int, db: Session = Depends(get_db)):
    """Get a specific generated document by ID"""
    document = db.query(GeneratedDocument).filter(GeneratedDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Generated document not found")
    return document

@router.put("/generated_document/{document_id}", response_model=GeneratedDocumentResponse)
def update_generated_document(
    document_id: int,
    update_data: GeneratedDocumentUpdate,
    db: Session = Depends(get_db)
):
    """Update a generated document"""
    document = db.query(GeneratedDocument).filter(GeneratedDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Generated document not found")
    
    # Update fields if provided
    if update_data.title is not None:
        document.title = update_data.title
    if update_data.content is not None:
        document.content = update_data.content
    
    db.commit()
    db.refresh(document)
    return document

@router.delete("/generated_document/{document_id}")
def delete_generated_document(document_id: int, db: Session = Depends(get_db)):
    """Delete a generated document"""
    document = db.query(GeneratedDocument).filter(GeneratedDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Generated document not found")
    
    db.delete(document)
    db.commit()
    return {"message": "Generated document deleted successfully"}

# EXPORT ENDPOINTS
@router.get("/generated_document/{document_id}/export/pdf")
def export_document_to_pdf(document_id: int, db: Session = Depends(get_db)):
    """Export a generated document to PDF"""
    document = db.query(GeneratedDocument).filter(GeneratedDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Generated document not found")
    
    export_service = DocumentExportService()
    pdf_buffer = export_service.export_to_pdf(document)
    filename = export_service.get_filename(document, 'pdf')
    
    return StreamingResponse(
        io.BytesIO(pdf_buffer.read()),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/generated_document/{document_id}/export/word")
def export_document_to_word(document_id: int, db: Session = Depends(get_db)):
    """Export a generated document to Word"""
    document = db.query(GeneratedDocument).filter(GeneratedDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Generated document not found")
    
    export_service = DocumentExportService()
    word_buffer = export_service.export_to_word(document)
    filename = export_service.get_filename(document, 'word')
    
    return StreamingResponse(
        io.BytesIO(word_buffer.read()),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# CHAT-BASED GENERATION ENDPOINTS (without requiring uploaded documents)
@router.post("/project/{project_id}/generate_from_chat", response_model=ChatResponse)
async def generate_documents_from_chat(
    project_id: int,
    chat_request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """Generate MVP, PRD, RFP documents from chat instructions (no uploaded documents required)"""
    
    # Validate project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    chat_service = ChatService()
    
    # Use the chat message as instruction for document generation
    instruction = chat_request.message
    
    try:
        # Generate all documents based on chat instruction
        mvp_result = await chat_service.generate_mvp(project_id, instruction)
        prd_result = await chat_service.generate_prd(project_id, instruction) 
        rfp_result = await chat_service.generate_rfp(project_id, instruction)
        
        return ChatResponse(
            response=f"Successfully generated MVP, PRD, and RFP documents based on your instructions: '{instruction}'. Check the AI Generations tab to view and download them.",
            sources=[]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate documents: {str(e)}")

@router.post("/project/{project_id}/generate_mvp_from_chat", response_model=ChatResponse)
async def generate_mvp_from_chat(
    project_id: int,
    chat_request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """Generate MVP document from chat instructions"""
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    chat_service = ChatService()
    
    try:
        result = await chat_service.generate_mvp(project_id, chat_request.message)
        return ChatResponse(
            response=f"MVP Plan generated based on your instructions. {result}",
            sources=[]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate MVP: {str(e)}")

@router.post("/project/{project_id}/generate_prd_from_chat", response_model=ChatResponse)
async def generate_prd_from_chat(
    project_id: int,
    chat_request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """Generate PRD document from chat instructions"""
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    chat_service = ChatService()
    
    try:
        result = await chat_service.generate_prd(project_id, chat_request.message)
        return ChatResponse(
            response=f"Product Requirements Document generated based on your instructions. {result}",
            sources=[]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PRD: {str(e)}")

@router.post("/project/{project_id}/generate_rfp_from_chat", response_model=ChatResponse)
async def generate_rfp_from_chat(
    project_id: int,
    chat_request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """Generate RFP document from chat instructions"""
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    chat_service = ChatService()
    
    try:
        result = await chat_service.generate_rfp(project_id, chat_request.message)
        return ChatResponse(
            response=f"Request for Proposal generated based on your instructions. {result}",
            sources=[]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate RFP: {str(e)}")

# NEW DOCUMENT GENERATION ENDPOINTS

@router.post("/project/{project_id}/generate_business_case")
async def generate_business_case(project_id: int, request: ChatMessageRequest):
    """Generate business case document"""
    chat_service = ChatService()
    response = await chat_service.generate_business_case(project_id, request.message)
    return ChatResponse(response=response, sources=[])

@router.post("/project/{project_id}/generate_user_personas")
async def generate_user_personas(project_id: int, request: ChatMessageRequest):
    """Generate user personas document"""
    chat_service = ChatService()
    response = await chat_service.generate_user_personas(project_id, request.message)
    return ChatResponse(response=response, sources=[])

@router.post("/project/{project_id}/generate_gtm_strategy")
async def generate_gtm_strategy(project_id: int, request: ChatMessageRequest):
    """Generate go-to-market strategy document"""
    chat_service = ChatService()
    response = await chat_service.generate_gtm_strategy(project_id, request.message)
    return ChatResponse(response=response, sources=[]) 