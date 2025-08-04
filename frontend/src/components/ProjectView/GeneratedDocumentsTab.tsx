'use client';

import { useState, useEffect } from 'react';
import { ProjectWithDocuments, generationsApi, GeneratedDocument, generatedDocumentsApi, chatGenerationsApi } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import { SparklesIcon, DocumentTextIcon, CogIcon, CheckCircleIcon, PencilIcon, ArrowDownTrayIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface GeneratedDocumentsTabProps {
  project: ProjectWithDocuments;
}

export default function GeneratedDocumentsTab({ project }: GeneratedDocumentsTabProps) {
  const [savedDocuments, setSavedDocuments] = useState<GeneratedDocument[]>([]);
  const [loadingGeneration, setLoadingGeneration] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [showDesignPrompt, setShowDesignPrompt] = useState(false);
  const [activeDocument, setActiveDocument] = useState<string | null>(null);
  const [editingDocument, setEditingDocument] = useState<GeneratedDocument | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showChatGeneration, setShowChatGeneration] = useState(false);
  const [chatInstructions, setChatInstructions] = useState('');

  // Computed values
  const hasAnyDocuments = savedDocuments.length > 0;
  
  const getDocumentByType = (type: string): GeneratedDocument | undefined => {
    return savedDocuments.find(doc => doc.document_type === type);
  };
  
  const documents = [
    { 
      key: 'mvp' as const, 
      title: 'MVP Plan', 
      description: 'Minimum Viable Product strategy',
      icon: SparklesIcon,
      savedDoc: getDocumentByType('mvp')
    },
    { 
      key: 'prd' as const, 
      title: 'PRD', 
      description: 'Product Requirements Document',
      icon: DocumentTextIcon,
      savedDoc: getDocumentByType('prd')
    },
    { 
      key: 'rfp' as const, 
      title: 'RFP', 
      description: 'Request for Proposal',
      icon: DocumentTextIcon,
      savedDoc: getDocumentByType('rfp')
    },
    { 
      key: 'design' as const, 
      title: 'System Design', 
      description: 'Technical architecture document',
      icon: CogIcon,
      savedDoc: getDocumentByType('design')
    },
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (hasAnyDocuments && !editingDocument && !showChatGeneration) {
        const currentIndex = documents.findIndex(d => d.key === activeDocument);
        
        if (event.key === 'ArrowLeft' && currentIndex > 0) {
          event.preventDefault();
          setActiveDocument(documents[currentIndex - 1].key);
        } else if (event.key === 'ArrowRight' && currentIndex < documents.length - 1) {
          event.preventDefault();
          setActiveDocument(documents[currentIndex + 1].key);
        } else if (event.key === 'Escape' && showChatGeneration) {
          event.preventDefault();
          setShowChatGeneration(false);
          setChatInstructions('');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasAnyDocuments, activeDocument, documents, editingDocument, showChatGeneration]);

  // Load saved documents on component mount
  useEffect(() => {
    loadSavedDocuments();
  }, [project.id]);

  const loadSavedDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const response = await generatedDocumentsApi.getAll(project.id);
      setSavedDocuments(response.data || []);
      
      // Set first document as active if none selected
      if (response.data && response.data.length > 0 && !activeDocument) {
        setActiveDocument(response.data[0].document_type);
      }
    } catch (error: any) {
      console.error('Error loading saved documents:', error);
      // Show user-friendly error from API interceptor or fallback
      const errorMessage = error.userMessage || 'Failed to load generated documents. Please refresh and try again.';
      alert(errorMessage);
      setSavedDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleGenerateDocuments = async () => {
    if (project.documents.length === 0) {
      alert('Please upload documents first to generate strategic documents.');
      return;
    }

    setLoadingGeneration(true);
    try {
      const prompt = "Generate based on uploaded documents";
      
      // Generate MVP, PRD, and RFP in parallel
      await Promise.all([
        generationsApi.generateMVP(project.id, prompt),
        generationsApi.generatePRD(project.id, prompt),
        generationsApi.generateRFP(project.id, prompt),
      ]);

      // Reload saved documents from database
      await loadSavedDocuments();
      
      // Check if we have design document, if not show prompt
      const hasDesign = savedDocuments.some(doc => doc.document_type === 'design');
      if (!hasDesign) {
        setShowDesignPrompt(true);
      }
      
      // Set MVP as active by default
      setActiveDocument('mvp');
    } catch (error: any) {
      console.error('Generation failed:', error);
      const errorMessage = error.userMessage || 'Failed to generate documents. Ensure backend is running and try again.';
      alert(errorMessage);
    } finally {
      setLoadingGeneration(false);
    }
  };

  const handleGenerateDesign = async () => {
    const mvpDoc = getDocumentByType('mvp');
    const prdDoc = getDocumentByType('prd');
    const rfpDoc = getDocumentByType('rfp');
    
    const context = `MVP:\n${mvpDoc?.content || ''}\n\nPRD:\n${prdDoc?.content || ''}\n\nRFP:\n${rfpDoc?.content || ''}`;
    
    try {
      setLoadingGeneration(true);
      await generationsApi.generateDesign(project.id, context);
      
      // Reload saved documents
      await loadSavedDocuments();
      setShowDesignPrompt(false);
      setActiveDocument('design');
    } catch (error: any) {
      console.error('Design generation failed:', error);
      const errorMessage = error.userMessage || 'Failed to generate system design. Please try again.';
      alert(errorMessage);
    } finally {
      setLoadingGeneration(false);
    }
  };

  const handleEditDocument = (document: GeneratedDocument) => {
    setEditingDocument(document);
    setEditContent(document.content);
  };

  const handleSaveEdit = async () => {
    if (!editingDocument) return;
    
    try {
      await generatedDocumentsApi.update(editingDocument.id, {
        content: editContent
      });
      
      // Reload documents
      await loadSavedDocuments();
      setEditingDocument(null);
      setEditContent('');
    } catch (error: any) {
      console.error('Failed to save changes:', error);
      const errorMessage = error.userMessage || 'Failed to save changes. Please try again.';
      alert(errorMessage);
    }
  };

  const handleCancelEdit = () => {
    setEditingDocument(null);
    setEditContent('');
  };

  const handleDownload = async (doc: GeneratedDocument, format: 'pdf' | 'word') => {
    try {
      const response = format === 'pdf' 
        ? await generatedDocumentsApi.downloadPDF(doc.id)
        : await generatedDocumentsApi.downloadWord(doc.id);
      
      // Create blob and download
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const extension = format === 'pdf' ? 'pdf' : 'docx';
      const filename = `${doc.title}-${doc.document_type}-v${doc.version}.${extension}`;
      link.download = filename;
      
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download failed:', error);
      const errorMessage = error.userMessage || `Failed to download ${format.toUpperCase()}. Please try again.`;
      alert(errorMessage);
    }
  };

  const handleChatGeneration = async () => {
    if (!chatInstructions.trim()) {
      alert('Please enter instructions for document generation.');
      return;
    }

    setLoadingGeneration(true);
    try {
      await chatGenerationsApi.generateAll(project.id, chatInstructions);
      
      // Reload saved documents
      await loadSavedDocuments();
      
      // Reset chat form
      setChatInstructions('');
      setShowChatGeneration(false);
      
      // Set MVP as active by default
      setActiveDocument('mvp');
      
      alert('Documents generated successfully from your instructions!');
    } catch (error: any) {
      console.error('Chat generation failed:', error);
      const errorMessage = error.userMessage || 'Failed to generate documents from chat. Please try again.';
      alert(errorMessage);
    } finally {
      setLoadingGeneration(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI-Generated Strategic Documents</h2>
            <p className="text-gray-600">
              Generate comprehensive business documents powered by Claude AI with two options: upload documents or use chat instructions.
            </p>
          </div>
          
          {!hasAnyDocuments && (
            <div className="flex space-x-3">
              <button
                onClick={() => setShowChatGeneration(true)}
                disabled={loadingGeneration}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Generate from Chat
              </button>
              <button
                onClick={handleGenerateDocuments}
                disabled={loadingGeneration || project.documents.length === 0}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                {loadingGeneration ? 'Generating...' : 'Generate from Files'}
              </button>
            </div>
          )}
        </div>

        {/* Chat Generation Modal */}
        {showChatGeneration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Generate Documents from Chat Instructions
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Provide detailed instructions about your project, product, or business idea. The AI will generate MVP, PRD, and RFP documents based on your requirements.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowChatGeneration(false);
                      setChatInstructions('');
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Description & Requirements
                    </label>
                    <textarea
                      value={chatInstructions}
                      onChange={(e) => setChatInstructions(e.target.value)}
                      className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Example: Create documents for a mobile app that helps users track their fitness goals. It should include features like workout tracking, nutrition logging, progress visualization, and social sharing. Target audience is fitness enthusiasts aged 25-40. The app should have a subscription model with a free tier and premium features..."
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setShowChatGeneration(false);
                          setChatInstructions('');
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Be as specific as possible for better document quality. Press Esc to close.
                    </p>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowChatGeneration(false);
                        setChatInstructions('');
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleChatGeneration}
                      disabled={loadingGeneration || !chatInstructions.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loadingGeneration && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      )}
                      {loadingGeneration ? 'Generating...' : 'Generate Documents'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Selection */}
        {hasAnyDocuments && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Generated Documents</h3>
              <p className="text-xs text-gray-500">Use ← → arrow keys to navigate</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {documents.map((doc) => (
                <button
                  key={doc.key}
                  onClick={() => setActiveDocument(doc.key)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 ${
                    activeDocument === doc.key
                      ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <doc.icon className={`h-5 w-5 ${
                      activeDocument === doc.key ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    {doc.savedDoc && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <h3 className={`font-semibold text-sm ${
                    activeDocument === doc.key ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {doc.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{doc.description}</p>
                  {doc.savedDoc && (
                    <p className="text-xs text-blue-600 mt-1">
                      Created {new Date(doc.savedDoc.created_at).toLocaleDateString()}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Design Generation Prompt */}
        {showDesignPrompt && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Generate System Design?
                </h3>
                <p className="text-blue-700 text-sm">
                  Based on your MVP, PRD, and RFP, would you like to generate a comprehensive system design document?
                </p>
              </div>
              <div className="flex space-x-3 ml-6">
                <button
                  onClick={handleGenerateDesign}
                  disabled={loadingGeneration}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {loadingGeneration ? 'Generating...' : 'Yes, Generate'}
                </button>
                <button
                  onClick={() => setShowDesignPrompt(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Document Content */}
        {hasAnyDocuments ? (
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {activeDocument && (
              <div className="h-full flex flex-col">
                <div className="flex-shrink-0 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    {documents.find(d => d.key === activeDocument)?.title}
                  </h3>
                  <div className="flex space-x-2">
                    {documents.find(d => d.key === activeDocument)?.savedDoc && (
                      <>
                        <button
                          onClick={() => handleDownload(documents.find(d => d.key === activeDocument)!.savedDoc!, 'pdf')}
                          className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-1 inline" />
                          PDF
                        </button>
                        <button
                          onClick={() => handleDownload(documents.find(d => d.key === activeDocument)!.savedDoc!, 'word')}
                          className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-1 inline" />
                          Word
                        </button>
                        <button
                          onClick={() => handleEditDocument(documents.find(d => d.key === activeDocument)!.savedDoc!)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4 mr-2 inline" />
                          Edit
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowChatGeneration(true)}
                      disabled={loadingGeneration}
                      className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2 inline" />
                      Generate from Chat
                    </button>
                    <button
                      onClick={handleGenerateDocuments}
                      disabled={loadingGeneration}
                      className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      <SparklesIcon className="h-4 w-4 mr-2 inline" />
                      Regenerate from Files
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-h-0 overflow-y-auto">
                {loadingGeneration || loadingDocuments ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-gray-600">
                      {loadingGeneration ? 'Generating with Claude AI...' : 'Loading documents...'}
                    </span>
                  </div>
                ) : editingDocument && editingDocument.document_type === activeDocument ? (
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex-1 flex flex-col space-y-4">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="flex-1 min-h-96 w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="Edit your document content here..."
                      />
                      <div className="flex justify-end space-x-2 flex-shrink-0">
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    {documents.find(d => d.key === activeDocument)?.savedDoc?.content ? (
                      <div className="prose prose-blue prose-lg max-w-none">
                        <ReactMarkdown
                          components={{
                            h1: ({children}) => <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>,
                            h2: ({children}) => <h2 className="text-xl font-semibold mb-3 text-gray-800">{children}</h2>,
                            h3: ({children}) => <h3 className="text-lg font-medium mb-2 text-gray-700">{children}</h3>,
                            p: ({children}) => <p className="mb-4 text-gray-600 leading-relaxed">{children}</p>,
                            ul: ({children}) => <ul className="mb-4 pl-6 list-disc space-y-1">{children}</ul>,
                            ol: ({children}) => <ol className="mb-4 pl-6 list-decimal space-y-1">{children}</ol>,
                            li: ({children}) => <li className="text-gray-600">{children}</li>,
                            strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>,
                          }}
                        >
                          {documents.find(d => d.key === activeDocument)?.savedDoc?.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-500 mb-4">
                          <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>No content available for this document.</p>
                          <p className="text-sm mt-2">Try regenerating the documents or check your connection.</p>
                        </div>
                        <button
                          onClick={loadSavedDocuments}
                          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Reload Documents
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                <SparklesIcon className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No documents generated yet
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {project.documents.length === 0 
                  ? "Upload documents first, then generate MVP, PRD, and RFP documents using AI."
                  : "Generate comprehensive strategic documents based on your uploaded content."
                }
              </p>
              {project.documents.length > 0 && (
                <button
                  onClick={handleGenerateDocuments}
                  disabled={loadingGeneration}
                  className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  {loadingGeneration ? 'Generating...' : 'Generate Strategic Documents'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}