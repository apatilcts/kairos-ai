'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, FolderIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { Project, projectsApi } from '@/lib/api';
import CreateProjectModal from './CreateProjectModal';

interface ProjectListProps {
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
}

export default function ProjectList({ selectedProject, onProjectSelect }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await projectsApi.list();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
    onProjectSelect(newProject);
    setShowCreateModal(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your document analysis projects</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6">
            <FolderIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
          <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
            Create your first project to start analyzing documents and generating strategic insights with AI.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create First Project
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onProjectSelect(project)}
              className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg group ${
                selectedProject?.id === project.id
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-2">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      selectedProject?.id === project.id ? 'bg-blue-500' : 'bg-gray-300 group-hover:bg-blue-400'
                    } transition-colors`}></div>
                    <h3 className={`text-sm font-semibold truncate ${
                      selectedProject?.id === project.id ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {project.name}
                    </h3>
                  </div>
                  {project.description && (
                    <p className="mt-1 text-xs text-gray-600 line-clamp-2 ml-6">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center text-xs text-gray-500 ml-6">
                    <CalendarDaysIcon className="h-3 w-3 mr-1" />
                    {formatDate(project.created_at)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
}