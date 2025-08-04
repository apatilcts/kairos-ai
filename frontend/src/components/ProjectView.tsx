'use client';

import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { DocumentTextIcon, ChatBubbleLeftRightIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline';
import { Project, ProjectWithDocuments, projectsApi } from '@/lib/api';
import DocumentsTab from './ProjectView/DocumentsTab';
import ChatTab from './ProjectView/ChatTab';
import OverviewTab from './ProjectView/OverviewTab';
import GeneratedDocumentsTab from './ProjectView/GeneratedDocumentsTab';

interface ProjectViewProps {
  project: Project;
}

const tabs = [
  { name: 'Overview', icon: ChartBarIcon },
  { name: 'Documents', icon: DocumentTextIcon },
  { name: 'AI Generations', icon: CogIcon },
  { name: 'Chat', icon: ChatBubbleLeftRightIcon },
];

export default function ProjectView({ project }: ProjectViewProps) {
  const [projectDetails, setProjectDetails] = useState<ProjectWithDocuments | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fetchProjectDetails = async () => {
    try {
      const response = await projectsApi.get(project.id);
      setProjectDetails(response.data);
    } catch (error) {
      console.error('Error fetching project details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [project.id]);

  useEffect(() => {
    const handleSwitchToGenerationsTab = () => {
      setSelectedIndex(2); // AI Generations tab is at index 2
    };

    window.addEventListener('switchToGenerationsTab', handleSwitchToGenerationsTab);
    return () => {
      window.removeEventListener('switchToGenerationsTab', handleSwitchToGenerationsTab);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!projectDetails) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load project
          </h3>
          <button 
            onClick={fetchProjectDetails}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{projectDetails.name}</h1>
            {projectDetails.description && (
              <p className="mt-1 text-sm text-gray-500">{projectDetails.description}</p>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {projectDetails.documents.length} document{projectDetails.documents.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="flex space-x-1 bg-gray-100 p-1 mx-6 mt-4 rounded-lg">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `w-full flex items-center justify-center py-2.5 text-sm font-medium leading-5 rounded-md transition-all ${
                    selected
                      ? 'bg-white text-primary-700 shadow'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/[0.12]'
                  }`
                }
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
          
          <Tab.Panels className="flex-1 min-h-0">
            <Tab.Panel className="h-full p-6 overflow-auto">
              <OverviewTab project={projectDetails} onRefresh={fetchProjectDetails} />
            </Tab.Panel>
            
            <Tab.Panel className="h-full p-6 overflow-auto">
              <DocumentsTab project={projectDetails} onRefresh={fetchProjectDetails} />
            </Tab.Panel>
            
            <Tab.Panel className="h-full">
              <GeneratedDocumentsTab project={projectDetails} />
            </Tab.Panel>
            
            <Tab.Panel className="h-full">
              <ChatTab project={projectDetails} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}