'use client';

import { useState, useEffect } from 'react';
import { DocumentTextIcon, ChatBubbleLeftRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import { ProjectWithDocuments, projectsApi, chatApi } from '@/lib/api';

interface OverviewTabProps {
  project: ProjectWithDocuments;
  onRefresh: () => void;
}

export default function OverviewTab({ project, onRefresh }: OverviewTabProps) {
  const [stats, setStats] = useState<any>(null);
  const [summary, setSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await projectsApi.stats(project.id);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generateSummary = async () => {
    if (project.documents.length === 0) return;
    
    setLoadingSummary(true);
    try {
      const response = await chatApi.generateSummary(project.id);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [project.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const processedDocs = project.documents.filter(doc => doc.processed).length;
  const processingDocs = project.documents.length - processedDocs;

  return (
    <div className="space-y-6 overflow-y-auto h-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Documents</p>
              <p className="text-2xl font-semibold text-gray-900">{project.documents.length}</p>
              {processingDocs > 0 && (
                <p className="text-xs text-yellow-600">{processingDocs} processing</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Text Chunks</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.total_chunks || 0}
              </p>
              <p className="text-xs text-gray-500">For AI analysis</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Created</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(project.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Project Details</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{project.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {project.description || 'No description provided'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Files</dt>
            <dd className="mt-1 text-sm text-gray-900">{project.documents.length}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              {processingDocs > 0 ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Processing
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Ready
                </span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Recent Documents */}
      {project.documents.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Documents</h3>
          <div className="space-y-3">
            {project.documents.slice(0, 5).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center min-w-0 flex-1">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.original_filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(doc.file_size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {doc.processed ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Processed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Processing
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Summary */}
      {project.documents.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">AI Summary</h3>
            <button
              onClick={generateSummary}
              disabled={loadingSummary || processingDocs > 0}
              className="btn-primary disabled:opacity-50"
            >
              {loadingSummary ? 'Generating...' : 'Generate Summary'}
            </button>
          </div>
          
          {summary ? (
            <div className="prose prose-sm max-w-none">
              <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
                {summary}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>Generate an AI summary of your project documents</p>
              {processingDocs > 0 && (
                <p className="text-sm mt-2">Wait for documents to finish processing</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}