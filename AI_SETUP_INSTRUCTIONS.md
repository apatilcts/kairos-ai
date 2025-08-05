# AI Document Factory - Setup Instructions

## 🚀 Current Status
✅ **Backend Server**: Running on http://127.0.0.1:8001  
✅ **Frontend App**: Running on http://localhost:3000  
✅ **Document Factory**: Fully implemented with comprehensive fallback templates  
⚠️ **AI Enhancement**: Currently in template mode (API keys needed for full AI functionality)

---

## 🤖 To Enable Full AI Functionality

### Option 1: Claude (Recommended) 
1. **Get API Key**: Visit https://console.anthropic.com/
2. **Create Account**: Sign up or log in
3. **Generate Key**: Go to API Keys section and create a new key
4. **Configure**: Edit `/backend/.env` file:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   AI_PROVIDER=claude
   ```
5. **Restart**: Restart the backend server

### Option 2: Google Gemini (Alternative)
1. **Get API Key**: Visit https://aistudio.google.com/app/apikey
2. **Create Account**: Sign up with Google account
3. **Generate Key**: Create a new API key
4. **Configure**: Edit `/backend/.env` file:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   AI_PROVIDER=gemini
   ```
5. **Restart**: Restart the backend server

---

## 🔧 How to Restart Backend Server

1. **Stop Current Server**: 
   - Press `Ctrl+C` in the terminal running the backend
   - Or run: `pkill -f uvicorn`

2. **Start Server Again**:
   ```bash
   cd /Users/454469/Downloads/Personal/AI-MVP
   source venv/bin/activate
   cd backend
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
   ```

---

## 📋 What Works Right Now (Template Mode)

The AI Document Factory is already generating comprehensive documents in template mode:

### Available Document Types:
- ✅ **Business Case** - Complete financial analysis and implementation plan
- ✅ **Product Requirements Document (PRD)** - Full technical specifications
- ✅ **MVP Strategy** - Detailed minimum viable product planning  
- ✅ **User Personas** - Comprehensive user profiles and analysis
- ✅ **Request for Proposal (RFP)** - Professional procurement documents
- ✅ **Go-to-Market Strategy** - Complete launch and marketing plans

### Current Features:
- 📊 **Multi-audience versions** (when AI is enabled)
- 📈 **Document analytics and metadata**
- 💾 **Database storage and retrieval**
- 🔄 **Professional fallback templates**
- ✨ **Enhanced UI with Document Factory branding**

---

## 🎯 Difference Between Template Mode vs AI Mode

### Template Mode (Current):
- ✅ Comprehensive, professional document templates
- ✅ Structured sections and frameworks
- ✅ Industry best practices built-in
- ❌ Not customized to your specific input
- ❌ No context-aware content generation

### AI Mode (With API Keys):
- ✅ Everything from Template Mode, PLUS:
- ✅ **Personalized content** based on your input
- ✅ **Context-aware generation** using uploaded documents
- ✅ **Multi-audience versions** (Developer, Manager, Corporate, Executive)
- ✅ **Intelligent analysis** of your specific business context
- ✅ **Dynamic content** that adapts to your requirements

---

## 🧪 Testing the System

### Test Document Generation:
1. Open http://localhost:3000
2. Create a new project or select existing one
3. Try generating any document type
4. You'll see professional templates with "AI enhancement temporarily unavailable" note

### Verify AI Connection (Once API keys are configured):
1. Generate a document with specific context
2. Look for personalized content instead of template placeholders
3. Check for "Generated via AI Document Factory" with AI provider name
4. Multi-audience versions should appear in the output

---

## 🚨 Troubleshooting

### Backend Issues:
- **Port conflicts**: Change port in uvicorn command if needed
- **Database errors**: Check if `ai_mvp.db` exists in backend folder
- **Module not found**: Ensure you're in the activated virtual environment

### Frontend Issues:
- **Port conflicts**: Frontend auto-selects available port
- **API connection**: Ensure backend is running on port 8001
- **Build errors**: Clear cache with `rm -rf .next` and restart

### API Key Issues:
- **Invalid keys**: Check that API keys are correctly formatted
- **Rate limits**: Both Claude and Gemini have usage limits on free tiers
- **Network issues**: Ensure internet connection for AI API calls

---

## 💰 API Costs (Optional Information)

### Claude (Anthropic):
- **Free tier**: $5 credit for new accounts
- **Pay-per-use**: ~$0.01-0.05 per document (varies by length)
- **Monthly plans**: Available for heavy usage

### Google Gemini:
- **Free tier**: 15 requests per minute
- **Pay-per-use**: Very low cost
- **Generous free limits**: Good for testing

---

## 🎉 Ready to Use!

The AI Document Factory is **fully operational** in template mode and ready for immediate use. The comprehensive templates provide professional, structured documents even without AI API keys.

**Add API keys when you're ready for personalized, context-aware document generation!**
