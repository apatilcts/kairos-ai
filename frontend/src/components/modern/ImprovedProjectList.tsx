'use client';

import { useState, useEffect } from 'react';
import { Project, projectsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ProjectCard from './ProjectCard';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FolderPlusIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ImprovedProjectListProps {
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
}

export default function ImprovedProjectList({ selectedProject, onProjectSelect }: ImprovedProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.list();
      setProjects(response.data || []);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please refresh and try again.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      setCreating(true);
      const response = await projectsApi.create({
        name: newProjectName.trim(),
        description: newProjectDescription.trim() || undefined,
      });
      
      setProjects(prev => [response.data, ...prev]);
      setNewProjectName('');
      setNewProjectDescription('');
      setShowCreateForm(false);
      onProjectSelect(response.data);
    } catch (error: any) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-lg">Projects</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
            icon={<PlusIcon className="h-4 w-4" />}
          >
            New
          </Button>
        </div>

        {/* Search */}
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<MagnifyingGlassIcon className="h-4 w-4" />}
        />
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <Card padding="md">
            <div className="space-y-3">
              <Input
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                label="Name"
              />
              <Input
                placeholder="Project description (optional)"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                label="Description"
              />
              <div className="flex space-x-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim() || creating}
                  loading={creating}
                  className="flex-1"
                >
                  Create
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewProjectName('');
                    setNewProjectDescription('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Project List */}
      <div className="flex-1 overflow-y-auto p-6">
        {error ? (
          <Card variant="outline" className="border-red-200 bg-red-50">
            <CardContent className="text-center p-6">
              <div className="text-red-600 mb-2">⚠️</div>
              <p className="text-sm text-red-700 mb-3">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchProjects}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <FolderPlusIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              {searchTerm ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Create your first project to get started with AI document generation'
              }
            </p>
            {!searchTerm && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowCreateForm(true)}
                icon={<PlusIcon className="h-4 w-4" />}
              >
                Create Project
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isSelected={selectedProject?.id === project.id}
                onClick={() => onProjectSelect(project)}
                onGenerate={() => {
                  onProjectSelect(project);
                  // Trigger generation tab switch
                  window.dispatchEvent(new CustomEvent('switchToGenerationsTab'));
                }}
                documentCount={Math.floor(Math.random() * 5) + 1} // Mock for now
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {filteredProjects.length > 0 && (
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{filteredProjects.length} projects</span>
            <div className="flex items-center space-x-1">
              <SparklesIcon className="h-4 w-4" />
              <span>AI Ready</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}