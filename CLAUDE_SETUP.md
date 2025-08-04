# 🤖 Claude AI Integration Guide

This guide shows how to set up **Claude (Anthropic)** as your AI provider for superior document analysis and strategic document generation.

## 🏆 Why Choose Claude for Document Analysis?

### **Claude Advantages:**
- **📚 Superior Document Understanding**: Exceptional at analyzing complex business documents, PDFs, and technical content
- **🧠 Advanced Reasoning**: Better at connecting insights across multiple documents and generating strategic recommendations  
- **📏 Longer Context Windows**: Claude 3 supports up to 200K tokens (vs Gemini's ~32K), meaning it can analyze larger documents and more context
- **🎯 Instruction Following**: More reliable at following specific formatting requirements for PRDs, RFPs, and MVPs
- **💼 Business Focus**: Specifically trained on business documents, legal texts, and strategic content
- **⚡ Structured Output**: Better at creating well-organized, professional documents

### **Performance Comparison for Your Use Case:**

| Feature | Claude 3 Sonnet | Gemini Pro | Winner |
|---------|----------------|------------|---------|
| Document Analysis | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **Claude** |
| Business Reasoning | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **Claude** |
| Context Length | 200K tokens | 32K tokens | **Claude** |
| Strategic Writing | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | **Claude** |
| Response Speed | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Gemini |
| Cost | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Gemini |

**Verdict:** **Claude is the clear winner for this document analysis and strategy generation use case.**

## 🚀 Quick Setup for Claude

### 1. Get Your Claude API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to "API Keys" 
4. Create a new API key
5. Copy your API key (starts with `sk-ant-`)

### 2. Configure Your Environment

#### Option A: Local Development

```bash
# Navigate to backend directory
cd backend

# Create environment file from template
cp env_template.txt .env

# Edit .env file and add your Claude API key
nano .env
```

**Add to your .env file:**
```bash
# AI Models Configuration
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
AI_PROVIDER=claude

# Optional: Keep Gemini as fallback
GEMINI_API_KEY=your_gemini_key_here_optional
```

#### Option B: Docker Setup

```bash
# Create environment file in project root
echo "ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here" > .env
echo "AI_PROVIDER=claude" >> .env

# Start the application
docker-compose up --build
```

### 3. Install Dependencies

```bash
cd backend
pip install anthropic==0.8.1
# Or reinstall all dependencies
pip install -r requirements.txt
```

### 4. Start the Application

```bash
# Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm run dev
```

## 🔄 Switching Between Claude and Gemini

The application now supports **both Claude and Gemini** with easy switching:

### Switch to Claude (Recommended):
```bash
# In your .env file
AI_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Switch to Gemini:
```bash
# In your .env file  
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-key-here
```

### Use Both (Auto-fallback):
```bash
# In your .env file
AI_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-your-key-here
GEMINI_API_KEY=your-gemini-key-here
```

The system will use Claude as primary and fallback to Gemini if needed.

## 🎯 Claude-Optimized Features

When using Claude, you get enhanced capabilities:

### **1. Better Document Analysis**
- **More context**: Analyzes up to 8 document chunks (vs 5 for Gemini)
- **Deeper insights**: Better at connecting themes across documents
- **Professional tone**: More suitable for business document generation

### **2. Enhanced Summaries**
Claude generates structured summaries with:
- ✅ **Executive Overview**
- ✅ **Key Findings** 
- ✅ **Main Topics**
- ✅ **Critical Details**
- ✅ **Recommendations & Action Items**
- ✅ **Strategic Implications**

### **3. Superior Document Generation** (Future Phase 2)
Perfect for generating:
- 📋 **MVP Plans** with detailed feature breakdowns
- 📄 **PRDs** with comprehensive requirements
- 📑 **RFPs** with professional formatting
- 📊 **Strategic Reports** with actionable insights

## 💰 Claude Pricing

### **Claude 3 Sonnet Pricing** (Recommended Model):
- **Input**: $3 per million tokens
- **Output**: $15 per million tokens

### **Typical Usage Costs:**
- **Small document analysis** (5-10 pages): ~$0.05-0.15 per session
- **Large document set** (50+ pages): ~$0.50-1.50 per session
- **Monthly usage** (100 documents): ~$20-50/month

**💡 Cost Optimization Tips:**
- Use efficient chunking (already implemented)
- Start with Claude 3 Haiku for testing ($0.25/$1.25 per million tokens)
- Upgrade to Sonnet for production use

## 🔧 Advanced Configuration

### **Model Selection:**
```python
# In chat_service.py, you can customize the Claude model:
model="claude-3-sonnet-20240229"    # Best performance (recommended)
model="claude-3-haiku-20240307"     # Fastest and cheapest
model="claude-3-opus-20240229"      # Highest capability (expensive)
```

### **Parameter Tuning:**
```python
# Adjust Claude parameters for your needs:
max_tokens=2000,        # Response length
temperature=0.1,        # Creativity (0.0-1.0, lower = more factual)
```

## 🎉 What You'll Experience with Claude

### **Before (Gemini):**
- Good basic document Q&A
- Simple responses
- Limited context understanding

### **After (Claude):**
- **🔥 Professional business analysis**
- **📈 Strategic insights and recommendations**  
- **🎯 Context-aware responses across multiple documents**
- **📋 Structured, executive-ready summaries**
- **💼 Business-appropriate tone and formatting**

## 🚀 Ready to Use Claude?

1. **Get your API key**: [Anthropic Console](https://console.anthropic.com/)
2. **Update your .env**: Add `ANTHROPIC_API_KEY=sk-ant-your-key`
3. **Set provider**: Add `AI_PROVIDER=claude`
4. **Restart the backend**: See immediate improvement in responses!

## 📞 Support & Troubleshooting

### **Common Issues:**

**❌ "AI service not configured"**
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check that key starts with `sk-ant-`
- Ensure you have API credits in your Anthropic account

**❌ "Rate limit exceeded"**
- Anthropic has rate limits for new accounts
- Wait a few minutes between requests
- Consider upgrading your account tier

**❌ "Invalid API key"**
- Double-check your API key
- Regenerate a new key from Anthropic Console
- Ensure no extra spaces in the .env file

### **Performance Tips:**

✅ **For best results with Claude:**
- Ask specific, detailed questions
- Use business terminology
- Request structured outputs
- Leverage the longer context window

**Ready to experience superior AI-powered document analysis? Switch to Claude today!** 🎯