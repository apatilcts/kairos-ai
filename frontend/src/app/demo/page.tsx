'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/modern/StatusBadge';
import DocumentUploadZone from '@/components/modern/DocumentUploadZone';
import ProjectCard from '@/components/modern/ProjectCard';
import Navigation from '@/components/modern/Navigation';
import { 
  SparklesIcon, 
  DocumentTextIcon, 
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function DemoPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const mockProject = {
    id: 1,
    name: 'AI Strategy Document',
    description: 'Comprehensive strategy for implementing AI in enterprise workflows',
    created_at: new Date().toISOString(),
  };

  const handleFileUpload = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  };

  const simulateAction = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            Modern UI Components
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Beautifully designed components built with Claude's UI Component Generator, 
            featuring modern styling, animations, and enhanced user experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Buttons Section */}
          <Card variant="elevated" className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-blue-600" />
                Button Components
              </CardTitle>
              <CardDescription>
                Modern button variants with loading states and icons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="default" loading={loading}>Default</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="success" icon={<CheckCircleIcon className="h-4 w-4" />}>
                  Success
                </Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex space-x-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={simulateAction}
                loading={loading}
                className="w-full"
              >
                Test Loading State
              </Button>
            </CardFooter>
          </Card>

          {/* Status Badges */}
          <Card variant="elevated" className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center">
                <InformationCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
                Status Badges
              </CardTitle>
              <CardDescription>
                Colorful status indicators with icons and animations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <StatusBadge variant="success" icon={<CheckCircleIcon className="h-3 w-3" />}>
                  Success
                </StatusBadge>
                <StatusBadge variant="warning" icon={<ExclamationTriangleIcon className="h-3 w-3" />}>
                  Warning
                </StatusBadge>
                <StatusBadge variant="error" icon={<ExclamationTriangleIcon className="h-3 w-3" />}>
                  Error
                </StatusBadge>
                <StatusBadge variant="info" icon={<InformationCircleIcon className="h-3 w-3" />}>
                  Info
                </StatusBadge>
                <StatusBadge variant="purple" pulse>
                  Processing
                </StatusBadge>
                <StatusBadge variant="default">
                  Default
                </StatusBadge>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge size="sm" variant="success">Small</StatusBadge>
                <StatusBadge size="md" variant="info">Medium</StatusBadge>
                <StatusBadge size="lg" variant="warning">Large</StatusBadge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Input Components */}
        <Card variant="elevated" className="mb-8 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
              Input Components
            </CardTitle>
            <CardDescription>
              Enhanced input fields with variants, icons, and validation states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input 
                  label="Default Input" 
                  placeholder="Enter your name"
                  icon={<UserIcon className="h-4 w-4" />}
                />
                <Input 
                  label="Email Address" 
                  type="email"
                  placeholder="user@example.com"
                  icon={<EnvelopeIcon className="h-4 w-4" />}
                  variant="filled"
                />
                <Input 
                  label="Error State" 
                  placeholder="Something went wrong"
                  error={true}
                  helperText="This field is required"
                />
              </div>
              <div className="space-y-4">
                <Input 
                  label="Large Input" 
                  placeholder="Large size input"
                  inputSize="lg"
                  variant="outline"
                />
                <Input 
                  label="Small Input" 
                  placeholder="Small size input"
                  inputSize="sm"
                />
                <Input 
                  label="With Helper Text" 
                  placeholder="Valid input"
                  helperText="This input looks great!"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Card Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card variant="elevated" className="animate-fade-in">
            <CardHeader>
              <CardTitle>Project Card Component</CardTitle>
              <CardDescription>
                Interactive project cards with hover effects and actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectCard 
                project={mockProject}
                documentCount={5}
                isSelected={true}
                onClick={() => console.log('Project clicked')}
                onGenerate={() => console.log('Generate clicked')}
              />
            </CardContent>
          </Card>

          {/* Card Variants */}
          <div className="space-y-4 animate-slide-up">
            <Card variant="default">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900">Default Card</h3>
                <p className="text-sm text-gray-600">Standard card with subtle shadow</p>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900">Elevated Card</h3>
                <p className="text-sm text-gray-600">Enhanced shadow for importance</p>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900">Glass Card</h3>
                <p className="text-sm text-gray-600">Modern glassmorphism effect</p>
              </CardContent>
            </Card>
            <Card variant="outline">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900">Outline Card</h3>
                <p className="text-sm text-gray-600">Clean border-only design</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* File Upload Zone */}
        <Card variant="elevated" className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CloudArrowUpIcon className="h-5 w-5 mr-2 text-blue-600" />
              Document Upload Zone
            </CardTitle>
            <CardDescription>
              Drag-and-drop file upload with progress tracking and validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUploadZone 
              onFilesSelected={handleFileUpload}
              maxFiles={10}
              maxSize={50 * 1024 * 1024}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 py-8 border-t border-gray-200">
          <p className="text-gray-600">
            🎨 Created with <strong>Claude UI Component Generator</strong> - Modern, accessible, and beautiful
          </p>
          <div className="flex justify-center items-center mt-4 space-x-4">
            <StatusBadge variant="success" icon={<CheckCircleIcon className="h-3 w-3" />}>
              TypeScript Ready
            </StatusBadge>
            <StatusBadge variant="info" icon={<SparklesIcon className="h-3 w-3" />}>
              AI Generated
            </StatusBadge>
            <StatusBadge variant="purple">
              Tailwind CSS
            </StatusBadge>
          </div>
        </div>
      </div>
    </div>
  );
}