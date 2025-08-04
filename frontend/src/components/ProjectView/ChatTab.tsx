'use client';

import { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, TrashIcon, DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import { ProjectWithDocuments, ChatMessage, ChatResponse, chatApi, chatGenerationsApi } from '@/lib/api';

interface ChatTabProps {
  project: ProjectWithDocuments;
}

export default function ChatTab({ project }: ChatTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChatHistory = async () => {
    try {
      const response = await chatApi.getHistory(project.id);
      setMessages(response.data.reverse()); // Reverse to show oldest first
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, [project.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || loading) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setLoading(true);

    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      id: Date.now(), // Temporary ID
      message: messageText,
      response: '',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await chatApi.sendMessage(project.id, messageText);
      
      // Update the message with the actual response
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { 
              ...msg, 
              response: response.data.response,
              // Store sources in a way we can access them
              // @ts-ignore - Adding custom property for sources
              sources: response.data.sources 
            }
          : msg
      ));

      // Fetch updated history to get real IDs
      fetchChatHistory();

    } catch (error) {
      console.error('Error sending message:', error);
      // Update message to show error
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, response: 'Sorry, I encountered an error. Please try again.' }
          : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all chat history?')) {
      return;
    }

    try {
      await chatApi.clearHistory(project.id);
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat history:', error);
      alert('Failed to clear chat history. Please try again.');
    }
  };

  const handleGenerateFromChat = async (instructions: string) => {
    if (!instructions.trim()) {
      alert('Please provide instructions for document generation.');
      return;
    }

    setLoading(true);
    try {
      await chatGenerationsApi.generateAll(project.id, instructions);
      
      // Add success message to chat
      const successMessage: ChatMessage = {
        id: Date.now(),
        message: instructions,
        response: 'Documents generated successfully! Go to the "AI Generations" tab to view and download your MVP, PRD, and RFP documents.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, successMessage]);
      
      // Trigger switch to generations tab (optional)
      window.dispatchEvent(new CustomEvent('switchToGenerationsTab'));
      
    } catch (error: any) {
      console.error('Generation failed:', error);
      const errorMessage = error.userMessage || 'Failed to generate documents. Please try again.';
      
      // Add error message to chat
      const errorMsg: ChatMessage = {
        id: Date.now(),
        message: instructions,
        response: `Error: ${errorMessage}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGenerate = (type: string) => {
    const prompts: Record<string, string> = {
      'mvp': 'Create an MVP plan for my project based on our conversation and uploaded documents.',
      'prd': 'Generate a Product Requirements Document based on our discussion and project materials.',
      'rfp': 'Create a Request for Proposal document based on the project requirements we discussed.',
      'all': 'Generate comprehensive MVP, PRD, and RFP documents based on our conversation and project context.'
    };
    
    const instruction = prompts[type] || prompts['all'];
    handleGenerateFromChat(instruction);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const hasProcessedDocs = project.documents.some(doc => doc.processed);

  if (!hasProcessedDocs) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center max-w-md">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No processed documents
          </h3>
          <p className="text-gray-500 mb-6">
            Upload and wait for documents to be processed before you can start chatting with them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Chat with Documents
            </h3>
            <p className="text-sm text-gray-500">
              Ask questions about your uploaded documents
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Clear History
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Start a conversation
            </h4>
            <p className="text-gray-500 mb-6">
              Ask me anything about your documents. I can help you analyze, summarize, and extract insights.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setNewMessage("What are the main topics covered in these documents?")}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
              >
                What are the main topics?
              </button>
              <button
                onClick={() => setNewMessage("Can you provide a summary of the key findings?")}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
              >
                Summarize key findings
              </button>
              <button
                onClick={() => setNewMessage("What are the most important recommendations?")}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
              >
                Show recommendations
              </button>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="space-y-4">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-3xl">
                  <div className="bg-primary-600 text-white rounded-lg px-4 py-2">
                    <p className="text-sm">{message.message}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>

              {/* AI Response */}
              {message.response && (
                <div className="flex justify-start">
                  <div className="max-w-3xl">
                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{message.response}</ReactMarkdown>
                      </div>
                      
                      {/* Sources */}
                      {/* @ts-ignore - Custom sources property */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-500 mb-2">Sources:</p>
                          <div className="space-y-1">
                            {/* @ts-ignore - Custom sources property */}
                            {message.sources.map((source: any, index: number) => (
                              <div key={index} className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                                <p className="font-medium">Document {source.document_id}, Chunk {source.chunk_index}</p>
                                <p className="mt-1">{source.content_preview}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span className="text-sm text-gray-500">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Generation Actions */}
      <div className="bg-gray-50 border-t border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Quick Actions:</span>
        </div>
        <div className="flex space-x-2 overflow-x-auto">
          <button
            onClick={() => handleQuickGenerate('all')}
            disabled={loading}
            className="flex-shrink-0 inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <SparklesIcon className="h-3 w-3 mr-1" />
            Generate All Documents
          </button>
          <button
            onClick={() => handleQuickGenerate('mvp')}
            disabled={loading}
            className="flex-shrink-0 inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            MVP Plan
          </button>
          <button
            onClick={() => handleQuickGenerate('prd')}
            disabled={loading}
            className="flex-shrink-0 inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors disabled:opacity-50"
          >
            PRD
          </button>
          <button
            onClick={() => handleQuickGenerate('rfp')}
            disabled={loading}
            className="flex-shrink-0 inline-flex items-center px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors disabled:opacity-50"
          >
            RFP
          </button>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask a question about your documents..."
              rows={1}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}