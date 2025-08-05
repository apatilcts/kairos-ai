"""
AI Document Factory - The core intelligence system
This service transforms raw inputs into structured, multi-audience documents
using master prompts and intelligent processing.
"""

from typing import Dict, List, Optional, Any
import json
import re
from app.core.config import settings
from app.services.chat_service import ChatService
from app.templates.master_prompts import MasterPrompts
from app.db.database import SessionLocal
from app.db.models import GeneratedDocument
import asyncio

class DocumentFactoryService:
    """
    The AI Document Factory - transforms structured inputs into tailored outputs
    
    Core Workflow: Structured Input -> AI Processing (with Templates) -> Tailored Output -> Human Review
    """
    
    def __init__(self):
        self.chat_service = ChatService()
        self.master_prompts = MasterPrompts()
        
    async def process_document_request(self, 
                                     project_id: int,
                                     document_type: str, 
                                     raw_brief: str,
                                     context_documents: Optional[List[str]] = None,
                                     user_preferences: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Main factory method - processes raw input through the AI Document Factory
        
        Args:
            project_id: Project to associate document with
            document_type: Type of document to generate (prd, rfp, business_case, mvp, user_personas, gtm_strategy)
            raw_brief: Unstructured input from user (meeting notes, ideas, requirements)
            context_documents: Optional list of existing documents for context
            user_preferences: Optional preferences for output style, length, etc.
            
        Returns:
            Dict with generated document, metadata, and audience-specific versions
        """
        
        if not self.chat_service.model_type:
            return {
                "status": "error",
                "message": "AI Document Factory not configured. Please check AI service configuration.",
                "document": None
            }
        
        try:
            # Step 1: Prepare context from existing documents
            enhanced_context = await self._prepare_context(project_id, context_documents)
            
            # Step 2: Get the appropriate master prompt
            master_prompt = self._get_master_prompt(document_type)
            if not master_prompt:
                return {
                    "status": "error", 
                    "message": f"Document type '{document_type}' not supported",
                    "document": None
                }
            
            # Step 3: Enhance the raw brief with context
            enhanced_brief = self._enhance_brief_with_context(raw_brief, enhanced_context)
            
            # Step 4: Process through AI with master prompt
            formatted_prompt = master_prompt.format(raw_brief=enhanced_brief)
            
            # Step 5: Generate the document
            generated_content = await self._generate_with_ai(formatted_prompt, document_type)
            
            # Step 6: Post-process and structure the output
            structured_output = self._structure_output(generated_content, document_type)
            
            # Step 7: Save to database
            document_id = self._save_generated_document(
                project_id, 
                document_type, 
                structured_output["title"], 
                structured_output["content"]
            )
            
            # Step 8: Generate metadata and insights
            metadata = self._generate_metadata(document_type, raw_brief, structured_output)
            
            return {
                "status": "success",
                "document_id": document_id,
                "document_type": document_type,
                "title": structured_output["title"],
                "content": structured_output["content"],
                "audience_versions": structured_output.get("audience_versions", {}),
                "metadata": metadata,
                "processing_info": {
                    "ai_provider": self.chat_service.model_type,
                    "context_sources": len(context_documents) if context_documents else 0,
                    "brief_length": len(raw_brief),
                    "output_length": len(structured_output["content"])
                }
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Document Factory processing failed: {str(e)}",
                "document": None
            }
    
    async def _prepare_context(self, project_id: int, context_documents: Optional[List[str]] = None) -> str:
        """Prepare contextual information from existing documents and vector store"""
        context_parts = []
        
        # Get relevant context from vector store
        if hasattr(self.chat_service, 'vector_store'):
            try:
                relevant_chunks = self.chat_service.vector_store.search_similar_chunks(
                    query="project context requirements business goals user needs",
                    project_id=project_id,
                    n_results=10
                )
                
                if relevant_chunks:
                    context_parts.append("=== EXISTING PROJECT CONTEXT ===")
                    for i, chunk in enumerate(relevant_chunks):
                        content = chunk.get('content', chunk.get('text', str(chunk)))
                        context_parts.append(f"Context {i+1}: {content}")
                    context_parts.append("")
                    
            except Exception as e:
                print(f"Warning: Could not retrieve vector context: {e}")
        
        # Add any specific context documents provided
        if context_documents:
            context_parts.append("=== PROVIDED CONTEXT DOCUMENTS ===")
            for i, doc in enumerate(context_documents):
                context_parts.append(f"Document {i+1}: {doc}")
            context_parts.append("")
        
        return "\n".join(context_parts)
    
    def _get_master_prompt(self, document_type: str) -> Optional[str]:
        """Get the appropriate master prompt for the document type"""
        prompt_map = {
            "prd": self.master_prompts.get_prd_master_prompt(),
            "rfp": self.master_prompts.get_rfp_master_prompt(),
            "business_case": self.master_prompts.get_business_case_master_prompt(),
            "mvp": self.master_prompts.get_mvp_master_prompt(),
            "user_personas": self.master_prompts.get_user_personas_master_prompt(),
            "gtm_strategy": self.master_prompts.get_gtm_master_prompt()
        }
        
        return prompt_map.get(document_type)
    
    def _enhance_brief_with_context(self, raw_brief: str, context: str) -> str:
        """Combine raw brief with contextual information"""
        if not context.strip():
            return raw_brief
            
        return f"""{context}

=== USER REQUEST/BRIEF ===
{raw_brief}

=== PROCESSING INSTRUCTIONS ===
Use the provided context above to inform your document generation. Reference specific context elements where relevant, but focus on the user's brief as the primary requirement."""
    
    async def _generate_with_ai(self, formatted_prompt: str, document_type: str) -> str:
        """Generate content using the AI service with the formatted prompt"""
        
        try:
            if self.chat_service.model_type == "claude":
                content = await self._generate_claude_response_advanced(formatted_prompt, document_type)
            else:  # gemini
                content = await self._generate_gemini_response_advanced(formatted_prompt, document_type)
            
            return content
            
        except Exception as e:
            # Fallback to template-based generation if AI fails
            return self._generate_template_fallback(document_type, formatted_prompt)
    
    async def _generate_claude_response_advanced(self, prompt: str, document_type: str) -> str:
        """Generate response using Claude with optimized settings for document types"""
        
        # Adjust parameters based on document type
        max_tokens_map = {
            "prd": 4000,
            "rfp": 4000, 
            "business_case": 3500,
            "mvp": 3000,
            "user_personas": 3500,
            "gtm_strategy": 4000
        }
        
        max_tokens = max_tokens_map.get(document_type, 3000)
        
        try:
            message = self.chat_service.anthropic_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=max_tokens,
                temperature=0.1,  # Low temperature for structured documents
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text
        except Exception as e:
            raise Exception(f"Claude API error: {str(e)}")
    
    async def _generate_gemini_response_advanced(self, prompt: str, document_type: str) -> str:
        """Generate response using Gemini with optimized settings"""
        try:
            response = self.chat_service.gemini_model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.2,
                    "top_p": 0.8,
                    "top_k": 40,
                    "max_output_tokens": 4000,
                }
            )
            return response.text
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")
    
    def _structure_output(self, generated_content: str, document_type: str) -> Dict[str, Any]:
        """Structure the AI output into organized components"""
        
        # Extract title from the content
        lines = generated_content.split('\n')
        title = "Generated Document"
        
        for line in lines[:5]:  # Check first 5 lines for title
            if line.startswith('#') and not line.startswith('##'):
                title = line.replace('#', '').strip()
                break
        
        # Look for audience-specific sections
        audience_versions = self._extract_audience_versions(generated_content)
        
        # Clean up the main content
        cleaned_content = self._clean_document_content(generated_content)
        
        return {
            "title": title,
            "content": cleaned_content,
            "audience_versions": audience_versions,
            "document_type": document_type
        }
    
    def _extract_audience_versions(self, content: str) -> Dict[str, str]:
        """Extract audience-specific versions from the generated content"""
        audience_versions = {}
        
        # Look for sections like "FOR DEVELOPERS:", "FOR MANAGERS:", etc.
        import re
        
        patterns = {
            "developers": r"(?:FOR DEVELOPERS?|DEVELOPER SUMMARY):?\s*\n(.*?)(?=\n(?:FOR [A-Z]|###|##|\Z))",
            "managers": r"(?:FOR MANAGERS?|MANAGER SUMMARY):?\s*\n(.*?)(?=\n(?:FOR [A-Z]|###|##|\Z))", 
            "corporate": r"(?:FOR CORPORATE|CORPORATE SUMMARY|FOR SALES|FOR MARKETING):?\s*\n(.*?)(?=\n(?:FOR [A-Z]|###|##|\Z))",
            "executives": r"(?:FOR EXECUTIVES?|EXECUTIVE SUMMARY):?\s*\n(.*?)(?=\n(?:FOR [A-Z]|###|##|\Z))"
        }
        
        for audience, pattern in patterns.items():
            match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
            if match:
                audience_versions[audience] = match.group(1).strip()
        
        return audience_versions
    
    def _clean_document_content(self, content: str) -> str:
        """Clean and format the document content"""
        # Remove any markdown code block markers if present
        content = content.replace('```markdown', '').replace('```', '')
        
        # Ensure consistent line breaks
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        # Clean up any obvious AI artifacts
        content = content.replace('[INSERT RAW BRIEF HERE]', '')
        content = content.replace('{raw_brief}', '')
        
        return content.strip()
    
    def _generate_metadata(self, document_type: str, raw_brief: str, structured_output: Dict) -> Dict[str, Any]:
        """Generate metadata about the document creation process"""
        
        word_count = len(structured_output["content"].split())
        
        # Extract key sections for metadata
        sections = []
        for line in structured_output["content"].split('\n'):
            if line.startswith('##') and not line.startswith('###'):
                sections.append(line.replace('##', '').strip())
        
        return {
            "document_type": document_type,
            "word_count": word_count,
            "sections_count": len(sections),
            "sections": sections,
            "has_audience_versions": len(structured_output.get("audience_versions", {})) > 0,
            "brief_word_count": len(raw_brief.split()),
            "expansion_ratio": round(word_count / max(len(raw_brief.split()), 1), 1),
            "generated_at": "2025-08-05",  # Would use datetime in production
            "ai_provider": self.chat_service.model_type
        }
    
    def _save_generated_document(self, project_id: int, document_type: str, title: str, content: str) -> int:
        """Save generated document to database"""
        db = SessionLocal()
        try:
            # Mark any existing documents of this type as not latest
            db.query(GeneratedDocument).filter(
                GeneratedDocument.project_id == project_id,
                GeneratedDocument.document_type == document_type
            ).update({"is_latest": False})
            
            # Create new document
            db_document = GeneratedDocument(
                project_id=project_id,
                document_type=document_type,
                title=title,
                content=content,
                version=1,
                is_latest=True
            )
            db.add(db_document)
            db.commit()
            db.refresh(db_document)
            return db_document.id
        finally:
            db.close()
    
    def _generate_template_fallback(self, document_type: str, formatted_prompt: str) -> str:
        """Generate a template-based document when AI is unavailable"""
        
        fallback_templates = {
            "prd": """# Product Requirements Document: [Product Name]

## Executive Summary
**Problem Statement:** Based on your input, we've identified a key user problem that needs addressing.

**Vision:** This feature aligns with strategic business objectives and user needs.

**Target Audience:** Primary users who will benefit from this solution.

## User Stories & Core Requirements
- US-001: As a user, I want to [core functionality] so that I can [achieve goal]
- US-002: As a user, I want to [secondary feature] so that I can [get benefit]

## Functional Requirements  
- REQ-001: The system must provide core functionality
- REQ-002: Users should be able to interact intuitively

## Success Metrics
- Primary KPI: User engagement improvement
- Secondary KPI: Task completion rate
- Timeline: Measure within 30 days of launch

*Note: This is a template-based document. AI enhancement temporarily unavailable.*""",

            "mvp": """# MVP Strategy: [Product Name]

## Executive Summary
**MVP Concept:** Minimum viable version focusing on core user value

**Value Proposition:** Solving the primary user problem with essential features

## Core Features (Priority 1)
- **Feature 1:** Essential user functionality
- **Feature 2:** Core interaction capability  
- **Feature 3:** Basic user experience

## Success Metrics
- **User Adoption:** Target engagement rate
- **Feature Usage:** Core feature utilization
- **User Feedback:** Satisfaction scores

## Timeline
- **Week 1-2:** Development setup
- **Week 3-4:** Core features
- **Week 5-6:** Testing and refinement
- **Week 7-8:** Launch preparation

*Note: This is a template-based document. AI enhancement temporarily unavailable.*""",

            "business_case": """# Business Case: [Project Name]

## Executive Summary
**Problem:** Business challenge requiring solution
**Solution:** Proposed approach to address the problem
**Investment:** Estimated resource requirements
**ROI:** Expected return on investment

## Benefits Analysis
### Quantitative Benefits
- Cost savings opportunities
- Revenue generation potential
- Efficiency improvements

### Qualitative Benefits
- User experience enhancement
- Competitive positioning
- Strategic alignment

## Financial Projections
- **Year 1:** Initial investment and early returns
- **Year 2:** Scaling benefits
- **Year 3:** Full realization of value

## Recommendation
Proceed with implementation based on compelling business case.

*Note: This is a template-based document. AI enhancement temporarily unavailable.*"""
        }
        
        return fallback_templates.get(document_type, 
            "# Generated Document\n\nTemplate-based generation. AI enhancement temporarily unavailable.")

# Factory instance for use across the application
document_factory = DocumentFactoryService()
