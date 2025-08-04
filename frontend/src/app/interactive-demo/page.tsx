'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  DocumentTextIcon,
  CloudArrowUpIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  LinkIcon
} from '@heroicons/react/24/outline'

export default function InteractiveDemoPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<Array<{type: 'user' | 'ai', content: string, citations?: string[]}>>([])
  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null)

  const handleFileUpload = () => {
    setUploadedFile("customer_interviews.pdf")
    setCurrentStep(2)
  }

  const handleChatQuery = (query: string) => {
    setChatMessages(prev => [...prev, 
      { type: 'user', content: query },
      { 
        type: 'ai', 
        content: "Based on the customer interviews, the key pain points are: 1) Manual data entry taking 3-4 hours daily, 2) Lack of real-time collaboration features, 3) Difficulty tracking project dependencies. These insights come directly from interviews with users Sarah, Mike, and Jennifer.",
        citations: ["customer_interviews.pdf:p.3", "customer_interviews.pdf:p.7", "customer_interviews.pdf:p.12"]
      }
    ])
    setCurrentStep(3)
  }

  const handleGenerateDoc = () => {
    setGeneratedDoc(`
# MVP: Project Management Enhancement Tool

## Problem Statement
Based on customer interview analysis, users spend 3-4 hours daily on manual data entry and struggle with real-time collaboration.

## Solution
A lightweight project management tool that automates data entry and provides real-time collaboration features.

## Key Features
1. **Automated Data Import** - Reduces manual entry by 80%
2. **Real-time Collaboration** - Live updates across team members
3. **Dependency Tracking** - Visual project timeline with dependencies

## Success Metrics
- Reduce data entry time from 4 hours to <1 hour
- Increase team collaboration score by 50%
- 95% user adoption within 30 days

## Validation Plan
1. Build prototype with core features
2. Test with 5 existing customers
3. Gather feedback and iterate

---
*This document was generated from: customer_interviews.pdf, market_analysis.docx*
    `)
    setCurrentStep(4)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">StrategyAI Demo</h1>
                <p className="text-sm text-gray-500">Interactive Product Experience</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.history.back()}>
              ← Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step ? <CheckCircleIcon className="w-6 h-6" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-4 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-20 text-sm text-gray-600">
            <span>Upload</span>
            <span>Query</span>
            <span>Generate</span>
            <span>Download</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Demo Interface */}
          <div className="space-y-6">
            {/* Step 1: Upload Documents */}
            <Card className={`transition-all duration-300 ${currentStep === 1 ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CloudArrowUpIcon className="w-5 h-5" />
                  <span>1. Upload Your Documents</span>
                </CardTitle>
                <CardDescription>
                  Upload sample customer interview documents to begin analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!uploadedFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Try our sample document</p>
                    <Button onClick={handleFileUpload} className="bg-blue-600 hover:bg-blue-700">
                      Upload Sample: Customer Interviews
                    </Button>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 font-medium">{uploadedFile}</span>
                    </div>
                    <p className="text-green-700 text-sm mt-2">Document uploaded and processed successfully!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Ask Questions */}
            <Card className={`transition-all duration-300 ${currentStep === 2 ? 'ring-2 ring-blue-500 shadow-lg' : currentStep < 2 ? 'opacity-50' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  <span>2. Ask Strategic Questions</span>
                </CardTitle>
                <CardDescription>
                  Query your documents using natural language
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentStep >= 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full text-left justify-start"
                        onClick={() => handleChatQuery("What are the key user pain points?")}
                      >
                        "What are the key user pain points mentioned in the interviews?"
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full text-left justify-start"
                        onClick={() => handleChatQuery("What features should we prioritize?")}
                      >
                        "What features should we prioritize based on user feedback?"
                      </Button>
                    </div>
                    
                    {chatMessages.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4 max-h-64 overflow-y-auto">
                        {chatMessages.map((msg, idx) => (
                          <div key={idx} className={`${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-3 rounded-lg max-w-xs ${
                              msg.type === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white border border-gray-200'
                            }`}>
                              <p className="text-sm">{msg.content}</p>
                              {msg.citations && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <p className="text-xs text-gray-500 mb-1">Sources:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {msg.citations.map((citation, cidx) => (
                                      <span key={cidx} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                        <LinkIcon className="w-3 h-3 mr-1" />
                                        {citation}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 3: Generate Documents */}
            <Card className={`transition-all duration-300 ${currentStep === 3 ? 'ring-2 ring-blue-500 shadow-lg' : currentStep < 3 ? 'opacity-50' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SparklesIcon className="w-5 h-5" />
                  <span>3. Generate Strategy Documents</span>
                </CardTitle>
                <CardDescription>
                  Create professional documents based on your insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentStep >= 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        onClick={handleGenerateDoc}
                        className="p-4 h-auto flex-col items-start"
                      >
                        <DocumentTextIcon className="w-6 h-6 mb-2" />
                        <span className="font-medium">MVP Canvas</span>
                        <span className="text-xs text-gray-500">Problem-solution fit</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleGenerateDoc}
                        className="p-4 h-auto flex-col items-start"
                      >
                        <DocumentTextIcon className="w-6 h-6 mb-2" />
                        <span className="font-medium">PRD</span>
                        <span className="text-xs text-gray-500">Product requirements</span>
                      </Button>
                    </div>
                    
                    {generatedDoc && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Generated MVP Canvas</h4>
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 max-h-32 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-xs">{generatedDoc.substring(0, 200)}...</pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Demo Guide */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
              <CardHeader>
                <CardTitle>🎯 What You're Experiencing</CardTitle>
                <CardDescription>
                  This demo showcases StrategyAI's core capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">RAG-Powered Upload</p>
                      <p className="text-sm text-gray-600">Documents are automatically chunked, vectorized, and indexed for semantic search</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Verifiable Insights</p>
                      <p className="text-sm text-gray-600">Every AI response includes clickable citations linking to source documents</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Strategic Generation</p>
                      <p className="text-sm text-gray-600">Professional documents generated using insights from your knowledge base</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🚀 Ready for the Real Thing?</CardTitle>
                <CardDescription>
                  Experience the full power of StrategyAI with your own documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span>Upload unlimited documents</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span>Advanced AI models (Claude, GPT-4)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span>Team collaboration features</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span>Enterprise security & compliance</span>
                  </div>
                </div>
                
                <div className="pt-4 space-y-3">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Start Free Trial
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full">
                    Schedule Demo Call
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-emerald-100 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Demo Complete!</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    You've experienced the core workflow that's helping 500+ enterprises accelerate their strategic planning.
                  </p>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Share This Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}