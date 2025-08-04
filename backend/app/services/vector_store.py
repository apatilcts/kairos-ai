import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
import json
import os
from app.core.config import settings

class CustomEmbeddingFunction(embedding_functions.EmbeddingFunction):
    def __init__(self, model_name: str):
        self.model = SentenceTransformer(model_name)
    
    def __call__(self, input: list) -> list:
        return self.model.encode(input).tolist()

class VectorStore:
    def __init__(self):
        # Initialize ChromaDB client
        os.makedirs(settings.vector_db_path, exist_ok=True)
        self.client = chromadb.PersistentClient(
            path=settings.vector_db_path,
            settings=Settings(anonymized_telemetry=False)
        )
        
        # Create custom embedding function
        self.embedding_function = CustomEmbeddingFunction(settings.embedding_model)
        
        # Create or get collection with proper error handling
        try:
            self.collection = self.client.get_collection(
                name=settings.vector_db_collection_name,
                embedding_function=self.embedding_function
            )
        except Exception:
            # Collection doesn't exist, create it
            try:
                self.collection = self.client.create_collection(
                    name=settings.vector_db_collection_name,
                    metadata={"hnsw:space": "cosine"},
                    embedding_function=self.embedding_function
                )
            except Exception:
                # Collection might already exist, try to get it again
                self.collection = self.client.get_collection(
                    name=settings.vector_db_collection_name,
                    embedding_function=self.embedding_function
                )
    
    def add_document_chunks(self, chunks: List[Dict], project_id: int):
        """Add document chunks to the vector store"""
        texts = []
        metadatas = []
        ids = []
        
        for chunk in chunks:
            texts.append(chunk['chunk_text'])
            
            # Prepare metadata
            metadata = {
                'document_id': chunk['document_id'],
                'project_id': project_id,
                'chunk_index': chunk['chunk_index'],
                'chunk_length': len(chunk['chunk_text'])
            }
            
            # Add any additional metadata
            if 'chunk_metadata' in chunk and chunk['chunk_metadata']:
                if isinstance(chunk['chunk_metadata'], str):
                    # If metadata is a JSON string, parse it
                    try:
                        additional_metadata = json.loads(chunk['chunk_metadata'])
                        metadata.update(additional_metadata)
                    except:
                        pass
                elif isinstance(chunk['chunk_metadata'], dict):
                    metadata.update(chunk['chunk_metadata'])
            
            metadatas.append(metadata)
            ids.append(f"doc_{chunk['document_id']}_chunk_{chunk['chunk_index']}")
        
        # Add to ChromaDB (embeddings will be generated automatically by our custom function)
        self.collection.add(
            documents=texts,
            metadatas=metadatas,
            ids=ids
        )
    
    def search_similar_chunks(self, query: str, project_id: int, n_results: int = 5) -> List[Dict]:
        """Search for similar chunks based on query"""
        # Search in ChromaDB (query embedding will be generated automatically)
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where={"project_id": project_id}
        )
        
        # Format results
        formatted_results = []
        if results['documents'] and results['documents'][0]:
            for i, doc in enumerate(results['documents'][0]):
                result = {
                    'content': doc,
                    'metadata': results['metadatas'][0][i],
                    'distance': results['distances'][0][i] if results['distances'] else None,
                    'id': results['ids'][0][i]
                }
                formatted_results.append(result)
        
        return formatted_results
    
    def delete_document(self, document_id: int):
        """Delete all chunks for a specific document"""
        # Get all chunks for this document
        results = self.collection.get(
            where={"document_id": document_id}
        )
        
        if results['ids']:
            self.collection.delete(ids=results['ids'])
    
    def delete_project(self, project_id: int):
        """Delete all chunks for a specific project"""
        # Get all chunks for this project
        results = self.collection.get(
            where={"project_id": project_id}
        )
        
        if results['ids']:
            self.collection.delete(ids=results['ids'])
    
    def get_document_stats(self, document_id: int) -> Dict:
        """Get statistics for a document"""
        results = self.collection.get(
            where={"document_id": document_id}
        )
        
        return {
            "total_chunks": len(results['ids']) if results['ids'] else 0,
            "document_id": document_id
        }
    
    def get_project_stats(self, project_id: int) -> Dict:
        """Get statistics for a project"""
        results = self.collection.get(
            where={"project_id": project_id}
        )
        
        # Count documents
        document_ids = set()
        if results['metadatas']:
            for metadata in results['metadatas']:
                document_ids.add(metadata['document_id'])
        
        return {
            "total_chunks": len(results['ids']) if results['ids'] else 0,
            "total_documents": len(document_ids),
            "project_id": project_id
        } 