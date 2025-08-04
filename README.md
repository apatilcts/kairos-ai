# AI-Assisted Document & Strategy Generator

An AI-powered platform that transforms how product managers, consultants, and business analysts interact with project documents. Upload unstructured source materials and leverage conversational AI to analyze, query, and generate structured strategic documents like MVPs, PRDs, and RFPs.

## 🚀 Features

- **Secure Document Upload & Management**: Upload PDF, DOCX, TXT files organized by projects
- **Conversational Q&A**: Chat interface to query your documents using AI
- **AI-Powered Document Generation**: Generate MVPs, PRDs, and RFPs based on your uploaded content

## 🏗️ Architecture

- **Frontend**: Next.js with React and Tailwind CSS
- **Backend**: Python FastAPI with RAG (Retrieval-Augmented Generation)
- **AI Model**: Claude 3 Sonnet (recommended) or Google Gemini for reasoning and generation
- **Vector Database**: ChromaDB (local) / Pinecone (production)
- **Database**: PostgreSQL
- **File Storage**: Local filesystem (dev) / AWS S3 (production)

## 📁 Project Structure

```
AI-MVP/
├── backend/                 # FastAPI backend
│   ├── app/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # Next.js frontend
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml      # Development environment
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker (optional)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd AI-MVP
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Variables**
   ```bash
   # Backend (.env)
   # Choose your AI provider (Claude recommended for best document analysis)
   ANTHROPIC_API_KEY=your_claude_api_key  # Get from https://console.anthropic.com/
   AI_PROVIDER=claude
   
   # Optional: Gemini as fallback
   GEMINI_API_KEY=your_gemini_api_key
   DATABASE_URL=postgresql://user:password@localhost:5432/ai_mvp
   
   # Frontend (.env.local)
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

5. **Run the Application**
   ```bash
   # Terminal 1: Backend
   cd backend
   uvicorn app.main:app --reload --port 8000
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

### Using Docker

```bash
docker-compose up --build
```

## 🤖 AI Provider Setup

### **Claude (Recommended)**
For superior document analysis and business document generation:
- 📖 **[See Claude Setup Guide](CLAUDE_SETUP.md)** for detailed instructions
- 🔑 **Get API Key**: [Anthropic Console](https://console.anthropic.com/)
- ⚡ **Better Performance**: Longer context, superior reasoning, business-focused

### **Gemini (Alternative)**
- 🔑 **Get API Key**: [Google AI Studio](https://ai.google.dev)
- 💰 **Lower Cost**: More economical for high-volume usage
- 🚀 **Faster**: Quicker response times

## 🗺️ Development Roadmap

### Phase 1: Core RAG Engine ✅
- [x] Basic project structure
- [ ] File upload functionality
- [ ] Document processing pipeline
- [ ] Basic chat interface
- [ ] Core "chat with your doc" functionality

### Phase 2: Document Generation & UI Polish
- [ ] MVP Plan generator
- [ ] Rich text editor for generated content
- [ ] User authentication
- [ ] Project management UI

### Phase 3: Expansion & Enterprise Features
- [ ] PRD and RFP generators
- [ ] Team collaboration features
- [ ] Advanced document analysis
- [ ] Role-based access control

## 📚 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 