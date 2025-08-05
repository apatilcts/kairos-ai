from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Project schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Document schemas
class DocumentBase(BaseModel):
    filename: str
    original_filename: str
    file_size: int
    file_type: str

class DocumentResponse(DocumentBase):
    id: int
    project_id: int
    processed: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Chat schemas
class ChatMessageRequest(BaseModel):
    message: str
    project_id: int

class ChatMessageResponse(BaseModel):
    id: int
    message: str
    response: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

# File upload schema
class FileUploadResponse(BaseModel):
    message: str
    document: DocumentResponse

# Chat response with sources
class ChatResponse(BaseModel):
    response: str
    sources: List[dict] = []
    
# Project with documents
class ProjectWithDocuments(ProjectResponse):
    documents: List[DocumentResponse] = []
    
    class Config:
        from_attributes = True

# Generated Document schemas
class GeneratedDocumentBase(BaseModel):
    title: str
    document_type: str
    content: str

class GeneratedDocumentCreate(GeneratedDocumentBase):
    project_id: int

class GeneratedDocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class GeneratedDocumentResponse(GeneratedDocumentBase):
    id: int
    project_id: int
    version: int
    is_latest: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Document Factory schemas
class GenerateRequest(BaseModel):
    project_id: int
    user_prompt: str
    context_documents: Optional[List[str]] = None
    user_preferences: Optional[dict] = None

class GenerateResponse(BaseModel):
    success: bool
    document_id: int
    title: str
    content: str
    audience_versions: Optional[dict] = {}
    metadata: dict
    processing_info: dict 