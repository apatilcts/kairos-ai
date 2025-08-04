from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import os
import json

from app.db.database import get_db
from app.db.models import Document, DocumentChunk, Project
from app.schemas.schemas import DocumentResponse, FileUploadResponse
from app.services.document_processor import DocumentProcessor
from app.services.vector_store import VectorStore
from app.core.config import settings

router = APIRouter()

def process_document_background(document_id: int, file_path: str, file_type: str, project_id: int):
    """Background task to process uploaded document"""
    try:
        # Initialize services
        doc_processor = DocumentProcessor()
        vector_store = VectorStore()
        
        # Process document
        chunks = doc_processor.process_document(file_path, file_type, document_id)
        
        # Store chunks in database
        from app.db.database import SessionLocal
        db = SessionLocal()
        
        try:
            for chunk_data in chunks:
                db_chunk = DocumentChunk(
                    document_id=chunk_data["document_id"],
                    chunk_text=chunk_data["chunk_text"],
                    chunk_index=chunk_data["chunk_index"],
                    chunk_metadata=json.dumps(chunk_data["chunk_metadata"])
                )
                db.add(db_chunk)
            
            # Mark document as processed
            document = db.query(Document).filter(Document.id == document_id).first()
            if document:
                document.processed = True
                
            db.commit()
            
            # Add to vector store
            vector_store.add_document_chunks(chunks, project_id)
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"Error processing document {document_id}: {str(e)}")
        # Mark document as failed (you might want to add a status field)
        from app.db.database import SessionLocal
        db = SessionLocal()
        try:
            document = db.query(Document).filter(Document.id == document_id).first()
            if document:
                document.processed = False  # or add a 'failed' status
            db.commit()
        finally:
            db.close()

@router.post("/upload", response_model=FileUploadResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    project_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and process a document"""
    
    # Validate project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Validate file type
    file_extension = file.filename.split('.')[-1].lower()
    if file_extension not in settings.allowed_file_types:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Supported types: {', '.join(settings.allowed_file_types)}"
        )
    
    # Validate file size
    content = await file.read()
    if len(content) > settings.max_file_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.max_file_size // (1024*1024)}MB"
        )
    
    try:
        # Save file
        doc_processor = DocumentProcessor()
        file_path = doc_processor.save_uploaded_file(content, file.filename)
        
        # Create document record
        db_document = Document(
            filename=os.path.basename(file_path),
            original_filename=file.filename,
            file_path=file_path,
            file_size=len(content),
            file_type=file_extension,
            project_id=project_id,
            processed=False
        )
        
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        
        # Process document in background
        background_tasks.add_task(
            process_document_background,
            db_document.id,
            file_path,
            file_extension,
            project_id
        )
        
        return FileUploadResponse(
            message="File uploaded successfully. Processing in background.",
            document=db_document
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@router.get("/project/{project_id}", response_model=List[DocumentResponse])
def list_project_documents(project_id: int, db: Session = Depends(get_db)):
    """List all documents for a project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    documents = db.query(Document).filter(Document.project_id == project_id).all()
    return documents

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: int, db: Session = Depends(get_db)):
    """Get document by ID"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    """Delete document and all associated data"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete from vector store
    vector_store = VectorStore()
    vector_store.delete_document(document_id)
    
    # Delete file from disk
    try:
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
    except Exception as e:
        print(f"Warning: Could not delete file {document.file_path}: {str(e)}")
    
    # Delete from database (cascades to chunks)
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}

@router.get("/{document_id}/status")
def get_document_status(document_id: int, db: Session = Depends(get_db)):
    """Get document processing status"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    vector_store = VectorStore()
    stats = vector_store.get_document_stats(document_id)
    
    return {
        "document_id": document_id,
        "filename": document.original_filename,
        "processed": document.processed,
        "total_chunks": stats["total_chunks"],
        "file_size": document.file_size,
        "created_at": document.created_at
    } 