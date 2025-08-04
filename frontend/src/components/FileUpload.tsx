'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { documentsApi } from '@/lib/api';

interface FileUploadProps {
  projectId: number;
  onFileUploaded: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
  success?: boolean;
}

export default function FileUpload({ projectId, onFileUploaded }: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Initialize uploading files state
    const newUploadingFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
    }));
    
    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload each file
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      const fileIndex = uploadingFiles.length + i;

      try {
        // Update progress to show upload starting
        setUploadingFiles(prev => prev.map((f, idx) => 
          idx === fileIndex ? { ...f, progress: 10 } : f
        ));

        await documentsApi.upload(projectId, file);

        // Mark as successful
        setUploadingFiles(prev => prev.map((f, idx) => 
          idx === fileIndex ? { ...f, progress: 100, success: true } : f
        ));

        // Remove from list after a delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter((f, idx) => idx !== fileIndex));
        }, 2000);

        onFileUploaded();

      } catch (error) {
        console.error('Upload error:', error);
        setUploadingFiles(prev => prev.map((f, idx) => 
          idx === fileIndex ? { 
            ...f, 
            progress: 0, 
            error: 'Upload failed. Please try again.' 
          } : f
        ));
      }
    }
  }, [projectId, onFileUploaded, uploadingFiles.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeUploadingFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-900">
            {isDragActive ? 'Drop files here' : 'Drag files here or click to browse'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supports PDF, DOCX, and TXT files up to 50MB
          </p>
        </div>
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Uploading files</h4>
          {uploadingFiles.map((uploadingFile, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadingFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadingFile.file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {uploadingFile.success ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Uploaded
                    </span>
                  ) : uploadingFile.error ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Failed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Uploading...
                    </span>
                  )}
                  <button
                    onClick={() => removeUploadingFile(index)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              {!uploadingFile.success && !uploadingFile.error && (
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-primary-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${uploadingFile.progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Error Message */}
              {uploadingFile.error && (
                <p className="mt-2 text-xs text-red-600">{uploadingFile.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}