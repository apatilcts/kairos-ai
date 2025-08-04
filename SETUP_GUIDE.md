# AI-Assisted Document & Strategy Generator - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (optional, for containerized deployment)
- Google Gemini API key ([Get one here](https://ai.google.dev))

### Option 1: Local Development Setup

#### 1. Clone and Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp env_template.txt .env

# Edit .env file and add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here
```

#### 2. Setup Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

#### 3. Run the Application

```bash
# Terminal 1: Start Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

Visit http://localhost:3000 to access the application!

### Option 2: Docker Setup

#### 1. Create Environment File

```bash
# Create .env file in root directory
echo "GEMINI_API_KEY=your_actual_api_key_here" > .env
```

#### 2. Start with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

Visit http://localhost:3000 to access the application!

## 📋 Features Overview

### ✅ Completed Features

1. **Project Management**
   - Create, view, and manage projects
   - Project overview with statistics
   - Document organization by project

2. **Document Upload & Processing**
   - Drag & drop file upload (PDF, DOCX, TXT)
   - Automatic text extraction and chunking
   - Background processing with status tracking
   - Vector embedding generation for AI search

3. **AI Chat Interface**
   - Conversational AI powered by Google Gemini
   - RAG (Retrieval-Augmented Generation) for accurate responses
   - Source citations showing relevant document chunks
   - Chat history persistence
   - Real-time message streaming

4. **Backend Infrastructure**
   - FastAPI with automatic API documentation
   - SQLAlchemy ORM with PostgreSQL/SQLite support
   - ChromaDB vector database for similarity search
   - Background task processing
   - Comprehensive error handling

5. **Frontend Interface**
   - Modern React/Next.js interface
   - Responsive design with Tailwind CSS
   - Real-time UI updates
   - File upload progress tracking
   - Markdown support for AI responses

## 🛠️ Technical Architecture

### Backend Stack
- **FastAPI**: High-performance Python web framework
- **SQLAlchemy**: Database ORM with PostgreSQL support
- **ChromaDB**: Vector database for document embeddings
- **Google Gemini**: Large language model for AI responses
- **LangChain**: Document processing and text splitting
- **Sentence Transformers**: Text embedding generation

### Frontend Stack
- **Next.js 14**: React framework with app router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Headless UI**: Accessible UI components
- **React Dropzone**: File upload functionality
- **React Markdown**: Markdown rendering

### Database Schema
- **Projects**: Organize documents and conversations
- **Documents**: Store file metadata and processing status
- **Document Chunks**: Text segments for vector search
- **Chat Messages**: Conversation history

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=sqlite:///./ai_mvp.db

# AI API
GEMINI_API_KEY=your_gemini_api_key

# File Storage
UPLOAD_DIR=uploads
MAX_FILE_SIZE=52428800  # 50MB

# Vector Database
VECTOR_DB_PATH=./vector_db
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Security
SECRET_KEY=your-secret-key
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📊 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔍 Troubleshooting

### Common Issues

1. **"AI service not configured"**
   - Ensure GEMINI_API_KEY is set in backend/.env
   - Verify API key is valid

2. **File upload fails**
   - Check file size (max 50MB)
   - Ensure file type is supported (PDF, DOCX, TXT)
   - Verify uploads directory exists

3. **Documents not processing**
   - Check backend logs for errors
   - Ensure all dependencies are installed
   - Verify ChromaDB permissions

4. **Frontend can't connect to backend**
   - Ensure backend is running on port 8000
   - Check NEXT_PUBLIC_API_URL in frontend/.env.local
   - Verify CORS configuration

### Development Tips

1. **Backend Development**
   ```bash
   # Run with auto-reload
   uvicorn app.main:app --reload --port 8000
   
   # Check logs
   tail -f logs/app.log
   ```

2. **Frontend Development**
   ```bash
   # Run with hot reload
   npm run dev
   
   # Build for production
   npm run build
   ```

3. **Database Management**
   ```bash
   # Reset database (delete ai_mvp.db file)
   rm ai_mvp.db
   
   # View database contents
   sqlite3 ai_mvp.db ".tables"
   ```

## 🚀 Next Steps

### Phase 2 Features (Future Development)
- MVP Plan generator
- PRD (Product Requirements Document) generator
- RFP (Request for Proposal) generator
- Rich text editor for document editing
- User authentication and authorization
- Team collaboration features
- Advanced document analysis tools

### Deployment Options
- **Vercel**: Frontend deployment
- **Railway/Render**: Backend deployment
- **AWS/GCP**: Full stack deployment
- **Docker**: Containerized deployment

## 📝 Usage Guide

1. **Create a Project**
   - Click "+" button in the sidebar
   - Enter project name and description

2. **Upload Documents**
   - Select your project
   - Go to "Documents" tab
   - Drag & drop files or click to browse
   - Wait for processing to complete

3. **Start Chatting**
   - Go to "Chat" tab
   - Ask questions about your documents
   - Use suggested prompts to get started

4. **View Insights**
   - Check "Overview" tab for project statistics
   - Generate AI summaries of your documents
   - Monitor processing status

## 🎯 Example Use Cases

- **Product Managers**: Analyze user feedback and create PRDs
- **Consultants**: Process client documents and generate insights
- **Researchers**: Synthesize research papers and findings
- **Business Analysts**: Extract insights from business documents

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review API documentation at /docs
3. Check application logs for detailed error messages

Happy building! 🎉