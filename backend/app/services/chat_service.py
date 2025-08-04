import google.generativeai as genai
from anthropic import Anthropic
from typing import List, Dict, Optional
from app.core.config import settings
from app.services.vector_store import VectorStore
from app.db.database import SessionLocal
from app.db.models import GeneratedDocument

class ChatService:
    def __init__(self):
        self.ai_provider = settings.ai_provider
        self.anthropic_client = None
        self.gemini_model = None
        
        # Configure Claude (Anthropic) API
        if settings.anthropic_api_key:
            self.anthropic_client = Anthropic(api_key=settings.anthropic_api_key)
            print("Claude API initialized")
        
        # Configure Gemini API (fallback)
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
            self.gemini_model = genai.GenerativeModel('gemini-pro')
            print("Gemini API initialized")
        
        # Determine which model to use
        if self.ai_provider == "claude" and self.anthropic_client:
            self.model_type = "claude"
        elif self.ai_provider == "gemini" and self.gemini_model:
            self.model_type = "gemini"
        elif self.anthropic_client:
            self.model_type = "claude"
        elif self.gemini_model:
            self.model_type = "gemini"
        else:
            self.model_type = None
            print("Warning: No AI API keys configured")
        
        # Initialize vector store
        self.vector_store = VectorStore()
    
    def create_context_from_chunks(self, chunks: List[Dict]) -> str:
        """Create context string from retrieved chunks"""
        context_parts = []
        for i, chunk in enumerate(chunks):
            context_parts.append(f"Document {i+1}:\n{chunk['content']}\n")
        
        return "\n".join(context_parts)
    
    def create_claude_rag_prompt(self, query: str, context: str, chat_history: Optional[List[Dict]] = None) -> str:
        """Create an optimized RAG prompt for Claude"""
        history_text = ""
        if chat_history:
            history_text = self._format_chat_history(chat_history)
            history_text = f"\n\nPREVIOUS CONVERSATION:\n{history_text}\n"
        
        prompt = f"""You are an expert AI assistant specializing in document analysis and business strategy. You help users extract insights, analyze content, and answer questions based on their uploaded documents.

{history_text}
DOCUMENT CONTEXT:
{context}

USER QUESTION: {query}

INSTRUCTIONS:
- Analyze the provided document context carefully
- Give comprehensive, well-structured answers based solely on the document content
- When relevant, cite specific sections or documents
- If the documents don't contain sufficient information, clearly state this
- For complex questions, break down your analysis into logical sections
- Provide actionable insights when possible
- Maintain a professional, analytical tone

Please provide your response:"""
        
        return prompt
    
    def create_gemini_rag_prompt(self, query: str, context: str) -> str:
        """Create a RAG prompt optimized for Gemini"""
        prompt = f"""You are an AI assistant helping users analyze and understand their uploaded documents. 
        
Based on the following context from the user's documents, please answer their question. 
Be specific and cite relevant information from the documents when possible.

CONTEXT:
{context}

QUESTION: {query}

INSTRUCTIONS:
- Only use information from the provided context
- If the context doesn't contain enough information to answer the question, say so
- Be helpful and conversational
- Provide specific details when available
- If referencing specific information, mention it comes from the documents

ANSWER:"""
        
        return prompt
    
    async def chat_with_documents(self, 
                                  query: str, 
                                  project_id: int,
                                  chat_history: Optional[List[Dict]] = None) -> Dict:
        """Main chat function using RAG"""
        
        if not self.model_type:
            return {
                "response": "Sorry, the AI service is not configured. Please check your API keys.",
                "sources": []
            }
        
        try:
            # Search for relevant chunks
            relevant_chunks = self.vector_store.search_similar_chunks(
                query=query,
                project_id=project_id,
                n_results=8 if self.model_type == "claude" else 5  # Claude can handle more context
            )
            
            if not relevant_chunks:
                return {
                    "response": "I don't have any documents to reference for this project. Please upload some documents first.",
                    "sources": []
                }
            
            # Create context from chunks
            context = self.create_context_from_chunks(relevant_chunks)
            
            # Generate response based on AI provider
            if self.model_type == "claude":
                response_text = await self._generate_claude_response(query, context, chat_history)
            else:
                response_text = await self._generate_gemini_response(query, context, chat_history)
            
            # Prepare sources for frontend
            sources = []
            for chunk in relevant_chunks:
                sources.append({
                    "document_id": chunk['metadata'].get('document_id'),
                    "chunk_index": chunk['metadata'].get('chunk_index'),
                    "content_preview": chunk['content'][:200] + "..." if len(chunk['content']) > 200 else chunk['content'],
                    "distance": chunk.get('distance')
                })
            
            return {
                "response": response_text,
                "sources": sources
            }
            
        except Exception as e:
            return {
                "response": f"Sorry, I encountered an error: {str(e)}",
                "sources": []
            }
    
    async def _generate_claude_response(self, query: str, context: str, chat_history: Optional[List[Dict]] = None) -> str:
        """Generate response using Claude with fallback handling"""
        prompt = self.create_claude_rag_prompt(query, context, chat_history)
        
        try:
            message = self.anthropic_client.messages.create(
                model="claude-3-sonnet-20240229",  # Use Claude 3 Sonnet for best performance
                max_tokens=2000,
                temperature=0.1,  # Low temperature for factual responses
                messages=[
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ]
            )
            return message.content[0].text
        except Exception as e:
            print(f"Claude API blocked/failed: {str(e)}")
            # Try Gemini fallback if available
            if self.gemini_model:
                try:
                    return await self._generate_gemini_response(query, context, chat_history)
                except Exception as gemini_error:
                    print(f"Gemini fallback failed: {str(gemini_error)}")
                    return self._generate_offline_response(query, context)
            else:
                return self._generate_offline_response(query, context)
    
    async def _generate_gemini_response(self, query: str, context: str, chat_history: Optional[List[Dict]] = None) -> str:
        """Generate response using Gemini"""
        prompt = self.create_gemini_rag_prompt(query, context)
        
        # Add chat history if available
        if chat_history:
            history_text = self._format_chat_history(chat_history)
            prompt = f"{history_text}\n\n{prompt}"
        
        response = self.gemini_model.generate_content(prompt)
        return response.text
    
    def _format_chat_history(self, chat_history: List[Dict]) -> str:
        """Format chat history for context"""
        if not chat_history:
            return ""
        
        history_parts = ["PREVIOUS CONVERSATION:"]
        for msg in chat_history[-5:]:  # Only use last 5 messages for context
            history_parts.append(f"User: {msg['message']}")
            history_parts.append(f"Assistant: {msg['response']}")
        
        return "\n".join(history_parts)
    
    def _generate_offline_response(self, query: str, context: str) -> str:
        """Generate helpful response when AI APIs are blocked/unavailable"""
        
        query_lower = query.lower()
        
        # If we have context from documents, provide document-based analysis
        if context and len(context.strip()) > 50:
            if any(word in query_lower for word in ["summary", "summarize", "what", "about"]):
                return f"""📄 **Document Analysis** (Offline Mode)

Based on your uploaded documents, here's what I found:

**Key Content Areas:**
{context[:800]}...

**Analysis:** Your documents contain strategic information that can be used for business planning, technical specifications, and market analysis.

*Note: AI enhancement temporarily unavailable due to network restrictions. Using document extraction and template-based analysis.*

Would you like me to generate a specific type of document based on this content?"""
            
            elif any(word in query_lower for word in ["mvp", "plan", "strategy"]):
                return """🚀 **MVP Strategy Generation** (Template Mode)

I can help you create an MVP plan using proven frameworks:

**MVP Development Framework:**
1. **Problem Definition** - Based on your documents
2. **Target Market Analysis** - User persona identification  
3. **Core Feature Set** - Minimum viable features
4. **Technical Requirements** - Development roadmap
5. **Go-to-Market Strategy** - Launch plan
6. **Success Metrics** - KPIs and validation criteria

*Using built-in business strategy templates. AI enhancement will resume when network allows.*"""
            
            elif any(word in query_lower for word in ["prd", "requirements", "technical"]):
                return """📋 **Product Requirements Document** (Template Mode)

I can create a comprehensive PRD using standard frameworks:

**PRD Structure:**
- **Executive Summary** - Project overview and goals
- **Product Overview** - Vision, objectives, success criteria
- **User Stories & Use Cases** - Functional requirements
- **Technical Specifications** - Architecture and constraints  
- **UI/UX Requirements** - Design guidelines
- **Implementation Timeline** - Development phases

*Generated using proven PRD templates and your document content.*"""
        
        # General helpful responses when no context available
        if "documents" in query_lower or "upload" in query_lower:
            return """📤 **Document Upload & Analysis**

I can analyze various document types to help with strategic planning:

**Supported Formats:** PDF, Word, Text
**Analysis Capabilities:**
• Extract key insights and recommendations
• Generate strategic documents (MVP, PRD, RFP)
• Create business cases and user personas
• Develop go-to-market strategies

**To get started:** Upload your business documents, and I'll analyze them to provide strategic insights.

*Currently operating in template mode - upload documents for enhanced analysis.*"""
        
        elif any(word in query_lower for word in ["mvp", "business", "strategy", "plan"]):
            return """🎯 **Strategic Document Templates Available**

I can generate comprehensive business documents using proven frameworks:

**📈 MVP Plan**
- Market validation strategy
- Feature prioritization 
- Development roadmap

**💼 Business Case**  
- ROI analysis and projections
- Risk assessment
- Resource requirements

**👥 User Personas**
- Target audience profiles
- Behavioral insights
- Use case scenarios

**🚀 Go-to-Market Strategy**
- Launch timeline
- Marketing channels
- Competitive positioning

Which document type would you like me to create?"""
        
        else:
            return """🤖 **KairosAI Strategic Intelligence Platform** (Offline Mode)

**Available Features:**
• **Document Analysis** - Upload files for strategic insights
• **Template Generation** - MVP plans, PRDs, business cases
• **Strategic Planning** - User personas, GTM strategies  
• **Project Management** - Organize and track progress

**Current Status:** Operating with built-in templates and frameworks. AI enhancement temporarily limited due to network restrictions.

**How to proceed:**
1. Upload your business documents
2. Ask for specific document generation
3. Use strategic planning templates

What would you like to work on today?"""
    
    async def generate_summary(self, project_id: int, summary_type: str = "general") -> str:
        """Generate a summary of all documents in a project"""
        if not self.model_type:
            return "AI service not configured."
        
        try:
            # Get all chunks for the project (limit to avoid token limits)
            all_chunks = self.vector_store.search_similar_chunks(
                query="summary overview main points key findings",  # Generic query to get diverse content
                project_id=project_id,
                n_results=15 if self.model_type == "claude" else 10  # Claude can handle more context
            )
            
            if not all_chunks:
                return "No documents found for this project."
            
            context = self.create_context_from_chunks(all_chunks)
            
            if self.model_type == "claude":
                return await self._generate_claude_summary(context, summary_type)
            else:
                return await self._generate_gemini_summary(context, summary_type)
            
        except Exception as e:
            return f"Error generating summary: {str(e)}"
    
    async def _generate_claude_summary(self, context: str, summary_type: str) -> str:
        """Generate summary using Claude"""
        prompt = f"""As an expert business analyst, please provide a comprehensive {summary_type} summary of the following documents:

DOCUMENT CONTENT:
{context}

Please structure your summary to include:

1. **Executive Overview**: High-level summary of the main themes and purpose
2. **Key Findings**: Most important insights and discoveries from the documents  
3. **Main Topics**: Primary subjects and areas covered
4. **Critical Details**: Important specifics that require attention
5. **Recommendations & Action Items**: Suggested next steps or actions (if any are mentioned)
6. **Strategic Implications**: Business or strategic insights (if applicable)

Please provide a well-organized, professional summary that would be valuable for executive review:"""
        
        message = self.anthropic_client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=3000,
            temperature=0.2,
            messages=[{"role": "user", "content": prompt}]
        )
        
        return message.content[0].text
    
    async def _generate_gemini_summary(self, context: str, summary_type: str) -> str:
        """Generate summary using Gemini"""
        prompt = f"""Please provide a comprehensive summary of the following documents:

{context}

Create a {summary_type} summary that covers:
- Main topics and themes
- Key findings or insights
- Important details
- Any action items or recommendations

Summary:"""
        
        response = self.gemini_model.generate_content(prompt)
        return response.text
    
    # NEW FEATURE METHODS FOR MVP/PRD/RFP/DESIGN GENERATION
    
    def _save_generated_document(self, project_id: int, document_type: str, title: str, content: str) -> int:
        """Save generated document to database and return its ID"""
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
                version=1,  # We could implement versioning later
                is_latest=True
            )
            db.add(db_document)
            db.commit()
            db.refresh(db_document)
            return db_document.id
        finally:
            db.close()

    async def generate_mvp(self, project_id: int, user_prompt: str = "") -> str:
        """Generate a Minimum Viable Product plan based on project documents"""
        if not self.model_type:
            return "AI service not configured."
        
        # Retrieve relevant chunks from vector store
        n_results = 15 if self.model_type == "claude" else 10
        chunks = self.vector_store.search_similar_chunks(
            project_id=project_id, 
            query=user_prompt or "Generate MVP plan based on project requirements", 
            n_results=n_results
        )
        
        context = self._format_chunks_for_context_with_sources(chunks)
        
        prompt = f"""Based on the following document context and user request: '{user_prompt or 'Generate MVP plan'}'

DOCUMENT CONTEXT:
{context}

Generate a comprehensive Minimum Viable Product (MVP) Plan with the following sections:

## Executive Summary
- Brief overview of the MVP concept
- Value proposition

## Core Features (Priority 1)
- List 3-5 essential features for the MVP
- Brief description of each feature
- Why each feature is critical

## User Stories
- 5-7 key user stories in the format: "As a [user type], I want [functionality] so that [benefit]"

## Success Metrics
- Key performance indicators (KPIs)
- Measurable success criteria
- User adoption metrics

## Timeline & Milestones
- High-level development phases
- Key milestones and deliverables
- Estimated timeframes

Keep the plan actionable, realistic, and grounded in the provided context."""

        if self.model_type == "claude":
            content = await self._generate_claude_response_direct(prompt)
        else:
            content = await self._generate_gemini_response_direct(prompt)
        
        # Save to database
        self._save_generated_document(project_id, "mvp", "MVP Plan", content)
        return content
    
    async def generate_prd(self, project_id: int, user_prompt: str = "") -> str:
        """Generate a Product Requirements Document based on project documents"""
        if not self.model_type:
            return "AI service not configured."
        
        # Retrieve relevant chunks from vector store
        n_results = 15 if self.model_type == "claude" else 10
        chunks = self.vector_store.search_similar_chunks(
            project_id=project_id, 
            query=user_prompt or "Generate PRD based on project requirements", 
            n_results=n_results
        )
        
        context = self._format_chunks_for_context_with_sources(chunks)
        
        prompt = f"""Based on the following document context and user request: '{user_prompt or 'Generate PRD'}'

DOCUMENT CONTEXT:
{context}

Generate a comprehensive Product Requirements Document (PRD) with the following sections:

## 1. Introduction & Goals
- Product overview
- Business objectives
- Success criteria

## 2. User Personas
- Primary target users
- User needs and pain points
- User journeys

## 3. Functional Requirements
- Core functionality
- Feature specifications
- User interface requirements
- Integration requirements

## 4. Non-Functional Requirements
- Performance requirements
- Security requirements
- Scalability requirements
- Usability requirements

## 5. Assumptions & Dependencies
- Technical assumptions
- Business assumptions
- External dependencies
- Risk factors

## 6. Acceptance Criteria
- Definition of done
- Testing requirements
- Quality standards

Make it detailed, professional, and actionable for a development team."""

        if self.model_type == "claude":
            content = await self._generate_claude_response_direct(prompt)
        else:
            content = await self._generate_gemini_response_direct(prompt)
        
        # Save to database
        self._save_generated_document(project_id, "prd", "Product Requirements Document", content)
        return content
    
    async def generate_rfp(self, project_id: int, user_prompt: str = "") -> str:
        """Generate a Request for Proposal document based on project documents"""
        if not self.model_type:
            return "AI service not configured."
        
        # Retrieve relevant chunks from vector store
        n_results = 15 if self.model_type == "claude" else 10
        chunks = self.vector_store.search_similar_chunks(
            project_id=project_id, 
            query=user_prompt or "Generate RFP based on project scope", 
            n_results=n_results
        )
        
        context = self._format_chunks_for_context_with_sources(chunks)
        
        prompt = f"""Based on the following document context and user request: '{user_prompt or 'Generate RFP'}'

DOCUMENT CONTEXT:
{context}

Generate a formal Request for Proposal (RFP) document with the following sections:

## 1. Company Overview
- Organization background
- Project context
- Strategic objectives

## 2. Project Scope
- Project objectives
- Deliverables
- Expected outcomes
- Timeline

## 3. Technical Requirements
- Technology stack preferences
- Integration requirements
- Performance specifications
- Security requirements

## 4. Vendor Requirements
- Qualifications and experience
- Team composition
- Portfolio requirements
- References

## 5. Proposal Requirements
- Proposal format
- Required documentation
- Technical approach
- Project timeline
- Cost breakdown

## 6. Evaluation Criteria
- Scoring methodology
- Technical expertise (weight)
- Cost considerations (weight)
- Timeline feasibility (weight)
- References and experience (weight)

## 7. Submission Guidelines
- Submission deadline
- Contact information
- Proposal format requirements
- Q&A process

Make it professional, comprehensive, and suitable for vendor evaluation."""

        if self.model_type == "claude":
            content = await self._generate_claude_response_direct(prompt)
        else:
            content = await self._generate_gemini_response_direct(prompt)
        
        # Save to database
        self._save_generated_document(project_id, "rfp", "Request for Proposal", content)
        return content
    
    async def generate_business_case(self, project_id: int, user_prompt: str = "") -> str:
        """Generate a Business Case document based on project documents"""
        if not self.model_type:
            return "AI service not configured."
        
        # Retrieve relevant chunks from vector store
        n_results = 15 if self.model_type == "claude" else 10
        chunks = self.vector_store.search_similar_chunks(
            project_id=project_id, 
            query=user_prompt or "Generate business case based on project analysis", 
            n_results=n_results
        )
        
        context = self._format_chunks_for_context_with_sources(chunks)
        
        prompt = f"""Based on the following document context and user request: '{user_prompt or 'Generate Business Case'}'

DOCUMENT CONTEXT:
{context}

Generate a comprehensive Business Case document with the following sections:

## 1. Executive Summary
- Problem statement
- Proposed solution
- Key benefits
- Investment required
- Expected ROI

## 2. Problem Definition
- Current state analysis
- Pain points and challenges
- Impact of inaction
- Urgency and timing

## 3. Proposed Solution
- Solution overview
- Key capabilities
- Implementation approach
- Technology requirements

## 4. Benefits Analysis
- Quantitative benefits (cost savings, revenue increase)
- Qualitative benefits (efficiency, user satisfaction)
- Risk mitigation
- Competitive advantages

## 5. Cost Analysis
- Initial investment breakdown
- Ongoing operational costs
- Resource requirements
- Total cost of ownership (TCO)

## 6. Financial Projections
- ROI calculation
- Payback period
- Net present value (NPV)
- Break-even analysis

## 7. Risk Assessment
- Implementation risks
- Mitigation strategies
- Contingency planning
- Success factors

## 8. Recommendation
- Go/no-go recommendation
- Implementation timeline
- Key milestones
- Next steps

Make it compelling for executive decision-making with clear financial justification."""

        if self.model_type == "claude":
            content = await self._generate_claude_response_direct(prompt)
        else:
            content = await self._generate_gemini_response_direct(prompt)
        
        # Save to database
        self._save_generated_document(project_id, "business_case", "Business Case", content)
        return content
    
    async def generate_user_personas(self, project_id: int, user_prompt: str = "") -> str:
        """Generate User Personas document based on project documents"""
        if not self.model_type:
            return "AI service not configured."
        
        # Retrieve relevant chunks from vector store
        n_results = 15 if self.model_type == "claude" else 10
        chunks = self.vector_store.search_similar_chunks(
            project_id=project_id, 
            query=user_prompt or "Generate user personas based on user research and analysis", 
            n_results=n_results
        )
        
        context = self._format_chunks_for_context_with_sources(chunks)
        
        prompt = f"""Based on the following document context and user request: '{user_prompt or 'Generate User Personas'}'

DOCUMENT CONTEXT:
{context}

Generate comprehensive User Personas with the following structure for each persona:

## Primary User Personas

### Persona 1: [Name]
**Demographics:**
- Age range
- Job title/role
- Industry
- Location
- Education level

**Goals & Motivations:**
- Primary goals
- Success metrics
- Motivations and drivers
- Aspirations

**Pain Points & Frustrations:**
- Current challenges
- Specific frustrations
- Barriers to success
- Unmet needs

**Behavior Patterns:**
- How they currently work
- Technology usage
- Decision-making process
- Communication preferences

**Preferred Solutions:**
- Ideal features/capabilities
- User experience expectations
- Integration requirements
- Support needs

### Persona 2: [Name]
[Repeat structure for secondary persona]

### Persona 3: [Name]
[Repeat structure for tertiary persona if applicable]

## Persona Insights Summary
- Common patterns across personas
- Key differentiators
- Priority persona for MVP
- Design implications

## User Journey Mapping
- Awareness stage
- Consideration stage
- Decision stage
- Onboarding stage
- Active usage stage

Make each persona realistic and actionable for product development decisions."""

        if self.model_type == "claude":
            content = await self._generate_claude_response_direct(prompt)
        else:
            content = await self._generate_gemini_response_direct(prompt)
        
        # Save to database
        self._save_generated_document(project_id, "user_personas", "User Personas", content)
        return content
    
    async def generate_gtm_strategy(self, project_id: int, user_prompt: str = "") -> str:
        """Generate Go-to-Market Strategy document based on project documents"""
        if not self.model_type:
            return "AI service not configured."
        
        # Retrieve relevant chunks from vector store
        n_results = 15 if self.model_type == "claude" else 10
        chunks = self.vector_store.search_similar_chunks(
            project_id=project_id, 
            query=user_prompt or "Generate go-to-market strategy based on market analysis", 
            n_results=n_results
        )
        
        context = self._format_chunks_for_context_with_sources(chunks)
        
        prompt = f"""Based on the following document context and user request: '{user_prompt or 'Generate GTM Strategy'}'

DOCUMENT CONTEXT:
{context}

Generate a comprehensive Go-to-Market (GTM) Strategy with the following sections:

## 1. Market Overview
- Market size and growth
- Market segments
- Key trends and drivers
- Competitive landscape

## 2. Target Audience
- Primary target segments
- Secondary markets
- Customer profiles
- Decision-maker mapping

## 3. Value Proposition
- Unique value proposition
- Key differentiators
- Competitive advantages
- Messaging framework

## 4. Product Positioning
- Market positioning
- Brand positioning
- Competitive positioning
- Messaging strategy

## 5. Pricing Strategy
- Pricing model
- Price points
- Competitive pricing analysis
- Value-based pricing rationale

## 6. Sales Strategy
- Sales process
- Sales channels
- Channel partner strategy
- Sales enablement

## 7. Marketing Strategy
- Marketing objectives
- Lead generation strategy
- Content marketing plan
- Digital marketing channels
- Event and partnership marketing

## 8. Launch Plan
- Pre-launch activities
- Launch timeline
- Launch campaigns
- Success metrics

## 9. Customer Success
- Onboarding strategy
- Customer support
- Retention strategy
- Expansion opportunities

## 10. Success Metrics & KPIs
- Revenue targets
- Customer acquisition metrics
- Marketing metrics
- Sales metrics
- Customer success metrics

## 11. Budget & Resources
- Marketing budget allocation
- Sales team requirements
- Technology and tools
- External agency/partner needs

## 12. Risk Management
- Market risks
- Competitive risks
- Execution risks
- Mitigation strategies

Make it actionable with specific tactics, timelines, and measurable outcomes."""

        if self.model_type == "claude":
            content = await self._generate_claude_response_direct(prompt)
        else:
            content = await self._generate_gemini_response_direct(prompt)
        
        # Save to database
        self._save_generated_document(project_id, "gtm_strategy", "Go-to-Market Strategy", content)
        return content
    
    async def generate_design(self, project_id: int, context_documents: str, user_prompt: str = "") -> str:
        """Generate a System Design Document based on generated MVP/PRD/RFP"""
        if not self.model_type:
            return "AI service not configured."
        
        prompt = f"""Based on the following generated strategic documents and user request: '{user_prompt or 'Generate system design'}'

GENERATED DOCUMENTS CONTEXT:
{context_documents}

Generate a comprehensive System Design Document with the following sections:

## 1. Architecture Overview
- High-level system architecture
- Key components and their responsibilities
- System boundaries and interfaces

## 2. System Components
- Frontend components
- Backend services
- Database design
- External integrations

## 3. Data Flow
- User interaction flow
- Data processing pipeline
- Information architecture

## 4. Technology Stack
- Frontend technologies
- Backend technologies
- Database selection
- Infrastructure requirements

## 5. Scalability Considerations
- Performance optimization
- Load balancing strategies
- Caching mechanisms
- Horizontal scaling approach

## 6. Security Architecture
- Authentication and authorization
- Data protection
- Security best practices
- Compliance considerations

## 7. Deployment Strategy
- Environment setup
- CI/CD pipeline
- Monitoring and logging
- Backup and recovery

Use technical terminology appropriate for developers and architects. Include diagrams using ASCII or mermaid syntax where helpful."""

        if self.model_type == "claude":
            content = await self._generate_claude_response_direct(prompt, max_tokens=3000)
        else:
            content = await self._generate_gemini_response_direct(prompt)
        
        # Save to database
        self._save_generated_document(project_id, "design", "System Design Document", content)
        return content
    
    def _format_chunks_for_context(self, chunks: list) -> str:
        """Format chunks for use in generation prompts"""
        if not chunks:
            return "No relevant document content found."
        
        formatted_chunks = []
        for i, chunk in enumerate(chunks):
            # Handle different chunk data structures
            chunk_text = ""
            if isinstance(chunk, dict):
                if 'text' in chunk:
                    chunk_text = chunk['text']
                elif 'chunk_text' in chunk:
                    chunk_text = chunk['chunk_text'] 
                elif 'content' in chunk:
                    chunk_text = chunk['content']
                else:
                    chunk_text = str(chunk)
            else:
                chunk_text = str(chunk)
            
            formatted_chunks.append(f"Document Chunk {i+1}:\n{chunk_text}\n")
        
        return "\n".join(formatted_chunks)
    
    def _format_chunks_for_context_with_sources(self, chunks: list) -> str:
        """Format chunks for use in generation prompts with source information"""
        if not chunks:
            return "No relevant document content found."
        
        formatted_chunks = []
        for i, chunk in enumerate(chunks):
            # Handle different chunk data structures
            chunk_text = ""
            source_info = f"Document_{i+1}"
            
            if isinstance(chunk, dict):
                if 'text' in chunk:
                    chunk_text = chunk['text']
                elif 'chunk_text' in chunk:
                    chunk_text = chunk['chunk_text'] 
                elif 'content' in chunk:
                    chunk_text = chunk['content']
                else:
                    chunk_text = str(chunk)
                
                # Try to get source document name if available
                if 'document_name' in chunk:
                    source_info = chunk['document_name']
                elif 'source' in chunk:
                    source_info = chunk['source']
            else:
                chunk_text = str(chunk)
            
            formatted_chunks.append(f"[Source: {source_info}]\nDocument Chunk {i+1}:\n{chunk_text}\n")
        
        return "\n".join(formatted_chunks)
    
    async def _generate_claude_response_direct(self, prompt: str, max_tokens: int = 2500) -> str:
        """Generate response using Claude with direct prompt"""
        try:
            message = self.anthropic_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=max_tokens,
                temperature=0.1,
                messages=[
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ]
            )
            return message.content[0].text
        except Exception as e:
            return f"Error generating response: {str(e)}"
    
    async def _generate_gemini_response_direct(self, prompt: str) -> str:
        """Generate response using Gemini with direct prompt"""
        try:
            response = self.gemini_model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating response: {str(e)}" 