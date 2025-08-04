'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hi! I'm your StrategyAI assistant. I can help you learn about our platform, answer questions about features, or guide you through getting started. How can I help you today?",
      timestamp: new Date()
    }
  ])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const predefinedResponses: Record<string, string> = {
    'hello': "Hello! Welcome to StrategyAI. I'm here to help you understand how our AI-powered strategy platform can transform your business planning.",
    'pricing': "Our pricing is flexible and scales with your needs. We offer a free trial, professional plans starting at $49/month, and enterprise solutions. Would you like me to connect you with our sales team for a custom quote?",
    'features': "StrategyAI offers: 📊 RAG-powered document analysis, 🤖 Verifiable AI insights with source citations, 📝 Professional document generation (MVP, PRD, RFP, Business Cases), 👥 Team collaboration, and 🔒 Enterprise security. What would you like to know more about?",
    'demo': "I'd love to show you our platform! You can try our interactive demo at /interactive-demo or I can schedule a personalized demo with our team. Which would you prefer?",
    'security': "Security is our top priority. We're SOC 2 compliant, offer enterprise SSO, end-to-end encryption, and maintain complete audit trails. Your data never leaves your control.",
    'getting started': "Getting started is easy! 1️⃣ Sign up for a free trial, 2️⃣ Upload your documents, 3️⃣ Ask questions about your content, 4️⃣ Generate professional strategy documents. Want me to walk you through it?",
    'integration': "StrategyAI integrates with popular tools like Jira, Asana, Google Drive, Dropbox, OneDrive, Confluence, and Notion. We also offer robust APIs for custom integrations.",
    'support': "We offer 24/7 support for enterprise customers, comprehensive documentation, video tutorials, and a dedicated customer success team. How can we best support you?"
  }

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()
    
    // Check for keyword matches
    for (const [keyword, response] of Object.entries(predefinedResponses)) {
      if (message.includes(keyword)) {
        return response
      }
    }

    // Fallback responses based on message patterns
    if (message.includes('help') || message.includes('assistance')) {
      return "I'm here to help! I can answer questions about our features, pricing, security, integrations, or help you get started. You can also try our interactive demo or schedule a personalized walkthrough with our team."
    }
    
    if (message.includes('thank') || message.includes('thanks')) {
      return "You're welcome! Is there anything else I can help you with today? I'm always here to assist with questions about StrategyAI."
    }

    if (message.includes('contact') || message.includes('sales') || message.includes('team')) {
      return "I'd be happy to connect you with our team! You can reach us at contact@strategyai.com or click 'Schedule Demo' to book a personalized walkthrough. Our sales team typically responds within 2 hours."
    }

    // Default response
    return "I'd be happy to help you with that! For detailed questions, I recommend trying our interactive demo or speaking with our sales team. You can also ask me about our features, pricing, security, or getting started."
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateBotResponse(currentMessage),
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000) // 1-2 second delay
  }

  const quickActions = [
    "Tell me about features",
    "Show me pricing",
    "How do I get started?",
    "Schedule a demo"
  ]

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] max-h-[80vh]">
      <Card className="h-full flex flex-col shadow-2xl border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <SparklesIcon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">StrategyAI Assistant</CardTitle>
                <p className="text-blue-100 text-sm">Online • Typically replies instantly</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="p-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Quick questions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs p-2 h-auto text-left justify-start"
                    onClick={() => setCurrentMessage(action)}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isTyping}
              />
              <Button 
                type="submit" 
                size="sm"
                disabled={!currentMessage.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}