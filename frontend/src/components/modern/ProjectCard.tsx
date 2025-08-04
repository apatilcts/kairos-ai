'use client';

import React from 'react';
import { Project } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  DocumentTextIcon, 
  CalendarIcon, 
  FolderIcon,
  SparklesIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline';
import { cn, formatDate } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  isSelected?: boolean;
  onClick?: () => void;
  onGenerate?: () => void;
  documentCount?: number;
}

export default function ProjectCard({ 
  project, 
  isSelected = false, 
  onClick, 
  onGenerate,
  documentCount = 0 
}: ProjectCardProps) {
  return (
    <Card 
      variant={isSelected ? "elevated" : "default"}
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-lg group",
        isSelected && "ring-2 ring-blue-500 border-blue-200 bg-blue-50/30"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              isSelected 
                ? "bg-blue-100 text-blue-600" 
                : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
            )}>
              <FolderIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg leading-tight">
                {project.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {project.description || 'No description provided'}
              </CardDescription>
            </div>
          </div>
          <ChevronRightIcon className={cn(
            "h-4 w-4 transition-transform duration-200",
            isSelected ? "rotate-90 text-blue-600" : "text-gray-400 group-hover:text-blue-600"
          )} />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Project Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {documentCount} {documentCount === 1 ? 'document' : 'documents'}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {formatDate(project.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              View
            </Button>
            {documentCount > 0 && (
              <Button 
                variant="default" 
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerate?.();
                }}
              >
                <SparklesIcon className="h-4 w-4 mr-1" />
                Generate
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}