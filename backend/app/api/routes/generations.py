from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.db.models import GeneratedDocument, Project
from app.schemas.schemas import ChatMessageRequest, ChatResponse, GeneratedDocumentResponse, GeneratedDocumentUpdate
from app.services.chat_service import ChatService

router = APIRouter()

@router.post("/project/{project_id}/generate_mvp", response_model=ChatResponse)
async def generate_mvp(
    project_id: int,
    request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """Generate MVP document based on uploaded documents"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    chat_service = ChatService()
    result = await chat_service.generate_mvp(project_id, request.message)
    
    return ChatResponse(response="MVP document generated successfully", sources=[])

@router.post("/project/{project_id}/generate_prd", response_model=ChatResponse)
async def generate_prd(
    project_id: int,
    request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """Generate PRD document based on uploaded documents"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    chat_service = ChatService()
    result = await chat_service.generate_prd(project_id, request.message)
    
    return ChatResponse(response="PRD document generated successfully", sources=[])

@router.post("/project/{project_id}/generate_rfp", response_model=ChatResponse)
async def generate_rfp(
    project_id: int,
    request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """Generate RFP document based on uploaded documents"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    chat_service = ChatService()
    result = await chat_service.generate_rfp(project_id, request.message)
    
    return ChatResponse(response="RFP document generated successfully", sources=[])

@router.post("/project/{project_id}/generate_design", response_model=ChatResponse)
async def generate_design(
    project_id: int,
    request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """Generate system design document"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    chat_service = ChatService()
    result = await chat_service.generate_design(project_id, request.message)
    
    return ChatResponse(response="System design document generated successfully", sources=[])

@router.get("/project/{project_id}/generated_documents", response_model=List[GeneratedDocumentResponse])
def get_generated_documents(
    project_id: int,
    document_type: str = None,
    db: Session = Depends(get_db)
):
    """Get all generated documents for a project"""
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
    return {"message": "Document deleted successfully"}

@router.post("/project/{project_id}/generate_from_chat", response_model=ChatResponse)
async def generate_documents_from_chat(
    project_id: int,
    chat_request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """Generate MVP, PRD, RFP documents from chat instructions"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    chat_service = ChatService()
    instruction = chat_request.message
    
    try:
        # Generate all documents
        await chat_service.generate_mvp(project_id, instruction)
        await chat_service.generate_prd(project_id, instruction) 
        await chat_service.generate_rfp(project_id, instruction)
        
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
    result = await chat_service.generate_mvp(project_id, chat_request.message)
    
    return ChatResponse(response="MVP document generated successfully from your instructions", sources=[])