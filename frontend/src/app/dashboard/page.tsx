'use client'

import { useState, useEffect } from 'react'
import {
  BellIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  CloudArrowUpIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import CreateProjectModal from '@/components/CreateProjectModal'
import { projectsApi, documentsApi, chatApi, chatGenerationsApi, documentFactoryApi, generatedDocumentsApi, type Project, type ProjectWithDocuments, type GeneratedDocument } from '@/lib/api'

function Header({ onNewProject, onNavigate }: { 
  onNewProject: () => void,
  onNavigate: (tab: string) => void 
}) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">KairosAI</h1>
                <p className="text-xs text-gray-500 font-medium">STRATEGIC INTELLIGENCE PLATFORM</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-2">
              <button onClick={() => onNavigate('documents')} className="nav-link">
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Documents
              </button>
              <button onClick={() => onNavigate('chat')} className="nav-link">
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                AI Chat
              </button>
              <button onClick={() => onNavigate('generations')} className="nav-link-active">
                <SparklesIcon className="w-4 h-4 mr-2" />
                Generations
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>AI Ready</span>
            </div>
            <Button onClick={onNewProject} size="sm" className="btn-primary">
              <PlusIcon className="w-4 h-4 mr-1" />
              New
            </Button>
            <div className="flex items-center space-x-1">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
                <BellIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-1 cursor-pointer p-2 rounded-md hover:bg-gray-100 transition-colors">
                <span className="text-sm font-medium text-gray-700">Settings</span>
                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function ProjectList({ projects, selectedProject, onSelectProject, onNewProject, onViewProject, onGenerateDocuments }: {
  projects: Project[],
  selectedProject: Project | null,
  onSelectProject: (project: Project) => void,
  onNewProject: () => void,
  onViewProject: (project: Project) => void,
  onGenerateDocuments: (project: Project) => void
}) {
  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
          <Button onClick={onNewProject} size="sm" className="bg-gray-100 hover:bg-gray-200 text-gray-700">
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            className="input-field w-full pl-9"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {projects.length === 0 ? (
          <div className="text-center py-10">
            <FolderIcon className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No projects yet.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className={`sidebar-item ${selectedProject?.id === project.id ? 'sidebar-item-active' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FolderIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <h3 className="font-medium text-gray-800 truncate">{project.name}</h3>
                  </div>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${selectedProject?.id === project.id ? 'transform rotate-180' : ''}`} />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 pl-8">
                  <span>{project.description || 'No description'}</span>
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
                {selectedProject?.id === project.id && (
                  <div className="pl-8 mt-3 flex items-center space-x-2">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewProject(project);
                      }}
                      size="sm" 
                      className="btn-secondary text-xs"
                    >
                      View
                    </Button>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onGenerateDocuments(project);
                      }}
                      size="sm" 
                      className="btn-primary text-xs"
                    >
                      <SparklesIcon className="w-3 h-3 mr-1" />
                      Generate
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-200 text-sm text-gray-600">
        <p>{projects.length} projects</p>
      </div>
    </aside>
  )
}

function ProjectOverview({ project }: { project: ProjectWithDocuments }) {
  const stats = [
    { name: 'Documents', value: project.documents?.length || 0, icon: DocumentTextIcon, color: 'blue' },
    { name: 'Text Chunks', value: 0, icon: ChatBubbleLeftRightIcon, color: 'green', note: 'For AI analysis' },
    { name: 'Created', value: new Date(project.created_at).toLocaleDateString(), icon: ClockIcon, color: 'purple', time: new Date(project.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ];

  return (
    <div className="p-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map(stat => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-3xl font-semibold text-gray-900 ${stat.name === 'Created' ? 'text-lg' : ''}`}>{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.name}</p>
                 {stat.time && <p className="text-sm text-gray-900">{stat.time}</p>}
                {stat.note && <p className="text-xs text-gray-400 mt-1">{stat.note}</p>}
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Details */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Name</label>
            <p className="mt-1 text-sm text-gray-900">{project.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Description</label>
            <p className="mt-1 text-sm text-gray-900">{project.description || 'No description provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Total Files</label>
            <p className="mt-1 text-sm text-gray-900">{project.documents?.length || 0}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <span className="status-ready">
                <CheckCircleIcon className="w-3 h-3 mr-1" />
                Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


function MainContent({ project, activeTab, onTabChange }: { 
  project: ProjectWithDocuments | null,
  activeTab: string,
  onTabChange: (tab: string) => void 
}) {
  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FolderIcon className="w-16 h-16 mx-auto text-gray-300" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Select a project</h2>
          <p className="mt-1 text-sm text-gray-500">Choose a project from the sidebar to see its details.</p>
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-screen-2xl mx-auto px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-sm text-gray-500">{project.documents?.length || 0} documents • Last updated {new Date(project.updated_at || project.created_at).toLocaleDateString()}</p>
        </div>
        <div className="max-w-screen-2xl mx-auto px-8">
          <nav className="flex space-x-6">
            <button 
              onClick={() => onTabChange('overview')}
              className={`py-3 px-1 border-b-2 text-sm font-medium ${
                activeTab === 'overview' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SparklesIcon className="w-4 h-4 inline mr-1.5" />
              Overview
            </button>
            <button 
              onClick={() => onTabChange('documents')}
              className={`py-3 px-1 border-b-2 text-sm font-medium ${
                activeTab === 'documents' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DocumentTextIcon className="w-4 h-4 inline mr-1.5" />
              Documents
            </button>
            <button 
              onClick={() => onTabChange('generations')}
              className={`py-3 px-1 border-b-2 text-sm font-medium ${
                activeTab === 'generations' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SparklesIcon className="w-4 h-4 inline mr-1.5" />
              AI Generations
            </button>
            <button 
              onClick={() => onTabChange('chat')}
              className={`py-3 px-1 border-b-2 text-sm font-medium ${
                activeTab === 'chat' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4 inline mr-1.5" />
              Chat
            </button>
          </nav>
        </div>
      </div>
      {/* Dynamic tab content */}
      {activeTab === 'overview' && <ProjectOverview project={project} />}
      {activeTab === 'documents' && <DocumentsTab project={project} />}
      {activeTab === 'generations' && <GenerationsTab project={project} />}
      {activeTab === 'chat' && <ChatTab project={project} />}
    </main>
  )
}

function DocumentsTab({ project }: { project: ProjectWithDocuments }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [project.id]);

  const loadDocuments = async () => {
    try {
      const response = await documentsApi.listByProject(project.id);
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await documentsApi.upload(project.id, file);
      await loadDocuments();
    } catch (error) {
      console.error('Failed to upload document:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
        <div className="relative">
          <input
            type="file"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.docx,.txt"
            disabled={isUploading}
          />
          <Button className="btn-primary" disabled={isUploading}>
            <CloudArrowUpIcon className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </div>

      <div className="card">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No documents yet</h3>
            <p className="mt-2 text-sm text-gray-500">Upload your first document to get started with AI analysis.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <DocumentTextIcon className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">{doc.original_filename}</h4>
                    <p className="text-sm text-gray-500">
                      {doc.file_type.toUpperCase()} • {(doc.file_size / 1024).toFixed(1)} KB • 
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button size="sm" className="btn-secondary">
                  <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GenerationsTab({ project }: { project: ProjectWithDocuments }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<string | null>(null);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocument[]>([]);
  const [modalDocument, setModalDocument] = useState<{ type: string; content: string; title: string; factoryData?: any } | null>(null);

  // Load generated documents for this project
  const loadGeneratedDocuments = async () => {
    try {
      console.log(`🔄 Loading generated documents for project ${project.id}...`);
      const response = await generatedDocumentsApi.getAll(project.id);
      console.log(`✅ Loaded ${response.data.length} generated documents`);
      setGeneratedDocs(response.data);
    } catch (error) {
      console.error('❌ Failed to load generated documents:', error);
    }
  };

  // Load documents when component mounts or project changes
  useEffect(() => {
    if (project.id) {
      loadGeneratedDocuments();
    }
  }, [project.id]);

  const generateDocument = async (type: string) => {
    // Prevent multiple simultaneous generations
    if (isGenerating) {
      console.log(`⚠️ Generation already in progress for ${generatingType}, ignoring ${type} request`);
      return;
    }
    
    setIsGenerating(true);
    setGeneratingType(type);
    
    try {
      console.log(`🚀 Generating ${type} document using AI Document Factory for project ${project.id}...`);
      let response;
      
      // Use the Document Factory for structured, high-quality document generation
      const documentRequest = {
        project_id: project.id,
        user_prompt: `Create a comprehensive ${type.replace('-', ' ')} document based on the project context and uploaded documents. This should be a professional, executive-ready document.`,
        context_documents: [], // Will be enhanced with actual context in the future
        user_preferences: {
          style: 'professional',
          length: 'comprehensive',
          audience: 'executive'
        }
      };
      
      switch (type) {
        case 'mvp':
          console.log(`📋 Calling Document Factory MVP generation...`);
          response = await documentFactoryApi.generateMVP(documentRequest);
          break;
          
        case 'prd':
          console.log(`📋 Calling Document Factory PRD generation...`);
          response = await documentFactoryApi.generatePRD(documentRequest);
          break;
          
        case 'business-case':
          console.log(`📋 Calling Document Factory Business Case generation...`);
          response = await documentFactoryApi.generateBusinessCase(documentRequest);
          break;
          
        case 'user-personas':
          console.log(`📋 Calling Document Factory User Personas generation...`);
          response = await documentFactoryApi.generateUserPersonas(documentRequest);
          break;
          
        case 'rfp':
          console.log(`📋 Calling Document Factory RFP generation...`);
          response = await documentFactoryApi.generateRFP(documentRequest);
          break;
          
        case 'gtm-strategy':
          console.log(`📋 Calling Document Factory GTM Strategy generation...`);
          response = await documentFactoryApi.generateGTMStrategy(documentRequest);
          break;
          
        default:
          // Fallback to legacy API
          console.log(`📋 Fallback to legacy API for ${type}...`);
          const legacyResponse = await chatGenerationsApi.generateAll(project.id, `Generate a ${type} document for this project`);
          response = { data: { content: legacyResponse.data.response, title: `Generated ${type}` } };
      }
      
      console.log(`✅ Document Factory generated ${type}:`, response.data);
      
      // Display the high-quality generated content
      if (response.data.content) {
        setModalDocument({
          type,
          content: response.data.content,
          title: response.data.title || `${type.toUpperCase().replace('-', ' ')} Generated Successfully!`,
          factoryData: response.data
        });
        
        // Reload the generated documents list to show the new document
        await loadGeneratedDocuments();
      } else {
        throw new Error('No content received from Document Factory');
      }
      
    } catch (error) {
      console.error(`❌ Failed to generate ${type}:`, error);
      showErrorNotification(type, error);
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
        alert('✅ Copied to clipboard!');
      } else {
        // Fallback for when clipboard API is not available
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          alert('✅ Copied to clipboard!');
        } catch (err) {
          console.error('Copy failed:', err);
          alert('❌ Copy failed. Please select and copy manually.');
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Copy operation failed:', err);
      alert('❌ Copy failed. Please select and copy manually.');
    }
  };

  const showErrorNotification = (type: string, error: any) => {
    const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; background: #EF4444; color: white; padding: 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 10000; max-width: 400px;">
        <div style="font-weight: bold; margin-bottom: 8px;">❌ ${type.toUpperCase()} Generation Failed</div>
        <div style="font-size: 14px; opacity: 0.9;">${errorMessage.substring(0, 150)}...</div>
        <button onclick="this.parentElement.remove()" style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
      </div>
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      if (errorDiv.parentElement) {
        errorDiv.remove();
      }
    }, 7000);
  };

  const templates = [
    { id: 'mvp', name: 'MVP Plan', description: 'Minimum Viable Product strategy and roadmap', icon: SparklesIcon },
    { id: 'prd', name: 'Product Requirements', description: 'Detailed technical and functional specifications', icon: DocumentTextIcon },
    { id: 'business-case', name: 'Business Case', description: 'ROI analysis and justification', icon: CheckCircleIcon },
    { id: 'user-personas', name: 'User Personas', description: 'Target audience profiles and behaviors', icon: FolderIcon },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">AI Generations</h2>
        <p className="text-gray-600">Generate strategic documents using AI analysis of your uploaded content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {templates.map((template) => (
          <div key={template.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <template.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
              </div>
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log(`🎯 User clicked Generate for: ${template.id}`);
                  generateDocument(template.id);
                }}
                size="sm" 
                className="btn-primary"
                disabled={isGenerating}
                type="button"
              >
                {isGenerating && generatingType === template.id ? (
                  <>
                    <SparklesIcon className="w-4 h-4 mr-1 animate-spin" />
                    Generating {template.name}...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 mr-1" />
                    Generate {template.name}
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Documents</h3>
        {generatedDocs.length === 0 ? (
          <div className="text-center py-8">
            <SparklesIcon className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No generated documents yet. Create your first document above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {generatedDocs.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <div>
                  <h4 className="font-medium">{doc.title}</h4>
                  <p className="text-sm text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="btn-secondary"
                    onClick={() => setModalDocument({
                      type: doc.document_type,
                      content: doc.content,
                      title: doc.title,
                      factoryData: doc
                    })}
                  >
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    className="btn-primary"
                    onClick={() => {
                      // Add download functionality
                      const blob = new Blob([doc.content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${doc.title}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Modal */}
      {modalDocument && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={() => setModalDocument(null)}
        >
          <div 
            className="bg-white max-w-4xl max-h-[85vh] rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-green-500 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">✅ {modalDocument.title}</h3>
                {modalDocument.factoryData?.metadata && (
                  <p className="text-sm opacity-90">
                    Generated via AI Document Factory • {modalDocument.factoryData.metadata.word_count || 0} words • {modalDocument.factoryData.metadata.ai_provider || 'AI'}
                  </p>
                )}
              </div>
              <button 
                onClick={() => setModalDocument(null)}
                className="text-white hover:text-gray-200 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Multi-audience info */}
            {modalDocument.factoryData?.audience_versions && Object.keys(modalDocument.factoryData.audience_versions).length > 0 && (
              <div className="bg-blue-50 border-b border-gray-200 p-3">
                <p className="text-sm text-blue-700 font-medium">
                  📊 Multi-Audience Document: Available for {Object.keys(modalDocument.factoryData.audience_versions).join(', ')}
                </p>
              </div>
            )}

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-system text-gray-800 leading-relaxed">
                {modalDocument.content
                  .replace(/Warning:.*AI service not configured.*?\n?/gi, '')
                  .replace(/AI service not configured.*?\n?/gi, '')
                  .replace(/^Warning:.*?\n/gim, '')
                  .trim()}
              </pre>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {modalDocument.factoryData?.metadata?.sections_count && `${modalDocument.factoryData.metadata.sections_count} sections • `}
                {modalDocument.factoryData?.processing_info?.ai_provider ? `AI: ${modalDocument.factoryData.processing_info.ai_provider}` : 'Enhanced AI Processing'}
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => copyToClipboard(modalDocument.content)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
                >
                  📋 Copy
                </button>
                <button 
                  onClick={() => setModalDocument(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatTab({ project }: { project: ProjectWithDocuments }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = { id: Date.now(), message: newMessage, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(project.id, newMessage);
      const aiMessage = { 
        id: Date.now() + 1, 
        message: response.data.response, 
        isUser: false, 
        sources: response.data.sources 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = { 
        id: Date.now() + 1, 
        message: 'Sorry, I encountered an error. Please try again.', 
        isUser: false 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">AI Chat</h2>
        <p className="text-gray-600">Ask questions about your documents and get AI-powered insights.</p>
      </div>

      <div className="flex-1 card flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Start a conversation</h3>
              <p className="mt-2 text-sm text-gray-500">Ask me anything about your uploaded documents.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl p-3 rounded-lg ${
                  msg.isUser 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 text-xs opacity-75">
                      Sources: {msg.sources.length} document(s)
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                <p>AI is thinking...</p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me about your documents..."
              className="flex-1 input-field"
              disabled={isLoading}
            />
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !newMessage.trim()}
              className="btn-primary"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWithDocuments | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchProjects = async () => {
    console.log('🔄 Dashboard: Starting to fetch projects...');
    try {
      setIsLoading(true);
      console.log('📡 Dashboard: Calling projectsApi.list()...');
      const response = await projectsApi.list();
      console.log('✅ Dashboard: Got projects response:', response.data?.length, 'projects');
      setProjects(response.data || []);
      if (response.data && response.data.length > 0) {
        console.log('🎯 Dashboard: Selecting first project:', response.data[0].name);
        handleSelectProject(response.data[0]);
      }
    } catch (err) {
      console.error('❌ Dashboard: Error fetching projects:', err);
      setError('Failed to load projects.');
    } finally {
      console.log('🏁 Dashboard: Finished loading, setting isLoading to false');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);
  
  const handleSelectProject = async (project: Project) => {
    console.log('🎯 Dashboard: Selecting project:', project.name, 'ID:', project.id);
    try {
      console.log('📡 Dashboard: Calling projectsApi.get() for project', project.id);
      const response = await projectsApi.get(project.id);
      console.log('✅ Dashboard: Got project details:', response.data);
      setSelectedProject(response.data);
      setActiveTab('overview'); // Reset to overview when selecting a new project
      console.log('✅ Dashboard: Project selected successfully');
    } catch (err) {
      console.error('❌ Dashboard: Error selecting project:', err);
      setError(`Failed to load project ${project.name}.`);
    }
  };

  const handleNewProject = () => {
    setShowCreateModal(true);
  };

  const handleProjectCreated = async (newProject: Project) => {
    setShowCreateModal(false);
    await fetchProjects();
    handleSelectProject(newProject);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    console.log(`Navigating to ${tab} tab`);
  };

  const handleNavigate = (section: string) => {
    setActiveTab(section);
    console.log(`Navigating to ${section} section`);
  };

  const handleViewProject = async (project: Project) => {
    console.log(`Viewing project: ${project.name}`);
    
    // First, load the project with all its documents
    try {
      const response = await projectsApi.get(project.id);
      setSelectedProject(response.data);
      
      // Navigate to the generations tab to show the generated documents
      setActiveTab('generations');
      console.log('Navigating to Generated Documents tab');
    } catch (error) {
      console.error('Error loading project for viewing:', error);
    }
  };

  const handleGenerateDocuments = (project: Project) => {
    setActiveTab('generations');
    console.log(`Generating documents for project: ${project.name}`);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Loading dashboard...</p></div>
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-700"><p>{error}</p></div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onNewProject={handleNewProject}
        onNavigate={handleNavigate}
      />
      <div className="flex h-[calc(100vh-69px)]">
        <ProjectList 
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={handleSelectProject}
          onNewProject={handleNewProject}
          onViewProject={handleViewProject}
          onGenerateDocuments={handleGenerateDocuments}
        />
        <MainContent 
          project={selectedProject}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
      
      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
}