from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.db.models import GeneratedDocument, Project
from app.schemas.schemas import ChatMessageRequest, ChatResponse, GeneratedDocumentResponse, GeneratedDocumentUpdate, GenerateRequest, GenerateResponse
from app.services.chat_service import ChatService
from app.services.document_factory import document_factory

router = APIRouter()

# NEW DOCUMENT FACTORY ENDPOINTS (Structured approach)
@router.post("/factory/generate/{document_type}", response_model=GenerateResponse)
async def generate_document_factory(
    document_type: str, 
    request: GenerateRequest,
    db: Session = Depends(get_db)
):
    """
    Generate a document using the AI Document Factory
    
    The Document Factory transforms raw inputs into structured, professional documents
    using master prompts and intelligent processing.
    
    Supported types: prd, rfp, business_case, mvp, user_personas, gtm_strategy
    """
    
    # Validate document type
    supported_types = ["prd", "rfp", "business_case", "mvp", "user_personas", "gtm_strategy"]
    if document_type not in supported_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Document type '{document_type}' not supported. Available types: {', '.join(supported_types)}"
        )
    
    # Verify project exists
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        # Use the Document Factory to process the request
        result = await document_factory.process_document_request(
            project_id=request.project_id,
            document_type=document_type,
            raw_brief=request.user_prompt,
            context_documents=request.context_documents,
            user_preferences=request.user_preferences
        )
        
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["message"])
        
        # Return structured response
        return GenerateResponse(
            success=True,
            document_id=result["document_id"],
            title=result["title"],
            content=result["content"],
            audience_versions=result.get("audience_versions", {}),
            metadata=result["metadata"],
            processing_info=result["processing_info"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document generation failed: {str(e)}")

# EXISTING ENDPOINTS (Legacy support)

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
    print("=" * 80)
    print(f"� FUNCTION CALLED: get_generated_documents(project_id={project_id})")
    print("=" * 80)
    print(f"�🔍 DEBUG: Fetching documents for project {project_id}")
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        print(f"❌ DEBUG: Project {project_id} not found")
        raise HTTPException(status_code=404, detail="Project not found")
    
    print(f"✅ DEBUG: Project {project_id} found: {project.name}")
    
    # First check all documents for this project
    all_docs = db.query(GeneratedDocument).filter(GeneratedDocument.project_id == project_id).all()
    print(f"📊 DEBUG: Total documents for project {project_id}: {len(all_docs)}")
    
    query = db.query(GeneratedDocument).filter(
        GeneratedDocument.project_id == project_id,
        GeneratedDocument.is_latest == True
    )
    
    if document_type:
        query = query.filter(GeneratedDocument.document_type == document_type)
        print(f"🔍 DEBUG: Filtering by document_type: {document_type}")
    
    documents = query.order_by(GeneratedDocument.created_at.desc()).all()
    print(f"📋 DEBUG: Latest documents found: {len(documents)}")
    
    for doc in documents:
        print(f"  - {doc.document_type}: {doc.title} (ID: {doc.id})")
    
    print("=" * 80)
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