'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { cn, formatFileSize } from '@/lib/utils';

interface FileWithPreview extends File {
  preview?: string;
  id?: string;
}

interface DocumentUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  uploadProgress?: Record<string, number>;
  uploadStatus?: Record<string, 'uploading' | 'success' | 'error'>;
}

export default function DocumentUploadZone({
  onFilesSelected,
  acceptedTypes = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  disabled = false,
  uploadProgress = {},
  uploadStatus = {},
}: DocumentUploadZoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        id: Math.random().toString(36).substr(2, 9),
      })
    );
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
    onFilesSelected(newFiles);

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      console.warn('Some files were rejected:', rejectedFiles);
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize,
    maxFiles: maxFiles - selectedFiles.length,
    disabled,
  });

  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getFileIcon = (fileType: string) => {
    return <DocumentTextIcon className="h-8 w-8" />;
  };

  const getStatusIcon = (fileId: string) => {
    const status = uploadStatus[fileId];
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'uploading':
        return (
          <div className="h-5 w-5">
            <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <Card 
        variant="outline"
        padding="lg"
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragActive && "border-blue-500 bg-blue-50",
          disabled && "opacity-50 cursor-not-allowed",
          !isDragActive && !disabled && "hover:border-blue-400 hover:bg-blue-50/30"
        )}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <CloudArrowUpIcon className={cn(
            "mx-auto h-12 w-12 mb-4",
            isDragActive ? "text-blue-600" : "text-gray-400"
          )} />
          {isDragActive ? (
            <div>
              <p className="text-lg font-medium text-blue-600">Drop files here</p>
              <p className="text-sm text-blue-500">Release to upload</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drag & drop files here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse files
              </p>
              <Button variant="outline" disabled={disabled}>
                Browse Files
              </Button>
            </div>
          )}
          <div className="mt-4 text-xs text-gray-500">
            <p>Supported: PDF, DOCX, TXT</p>
            <p>Max file size: {formatFileSize(maxSize)} • Max files: {maxFiles}</p>
          </div>
        </div>
      </Card>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card variant="default" padding="md">
          <h4 className="font-medium text-gray-900 mb-3">
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-gray-500">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(file.id!)}
                  {uploadProgress[file.id!] !== undefined && (
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress[file.id!]}%` }}
                      />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id!)}
                    disabled={uploadStatus[file.id!] === 'uploading'}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}