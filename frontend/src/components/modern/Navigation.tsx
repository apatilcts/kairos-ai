'use client';

import React, { useState } from 'react';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  SparklesIcon, 
  Cog6ToothIcon, 
  ChevronDownIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Navigation() {
  const [showApiStatus, setShowApiStatus] = useState(false);

  const navigationItems = [
    {
      name: 'Documents',
      icon: DocumentTextIcon,
      description: 'Upload and manage your documents',
      shortcut: '⌘D',
    },
    {
      name: 'AI Chat',
      icon: ChatBubbleLeftRightIcon,
      description: 'Conversational document analysis',
      shortcut: '⌘C',
    },
    {
      name: 'Generations',
      icon: SparklesIcon,
      description: 'AI-generated strategic documents',
      shortcut: '⌘G',
    },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/60 h-16 shadow-sm sticky top-0 z-50">
      <div className="px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-lg ring-2 ring-blue-500/20">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  KairosAI
                </span>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Strategic Intelligence Platform
                </div>
              </div>
            </div>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <div
                key={item.name}
                className="group relative"
              >
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Button>
                
                {/* Tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <Card variant="glass" padding="sm" className="w-48">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                      <div className="mt-2 inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs text-gray-500">
                        {item.shortcut}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* API Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700">AI Ready</span>
              </div>
            </div>
            
            {/* Settings Menu */}
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button as={Button} variant="outline" className="flex items-center space-x-2">
                  <Cog6ToothIcon className="h-4 w-4" />
                  <span>Settings</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-20 mt-2 w-64 origin-top-right">
                  <Card variant="glass" padding="sm">
                    <div className="space-y-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? 'bg-blue-50 text-blue-900' : 'text-gray-700'
                            } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors`}
                          >
                            <CommandLineIcon className="mr-3 h-4 w-4" />
                            API Configuration
                            <span className="ml-auto text-xs text-gray-400">⌘,</span>
                          </button>
                        )}
                      </Menu.Item>
                      
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? 'bg-blue-50 text-blue-900' : 'text-gray-700'
                            } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors`}
                          >
                            <DocumentTextIcon className="mr-3 h-4 w-4" />
                            Documentation
                          </button>
                        )}
                      </Menu.Item>
                      
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? 'bg-blue-50 text-blue-900' : 'text-gray-700'
                            } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors`}
                          >
                            <QuestionMarkCircleIcon className="mr-3 h-4 w-4" />
                            Help & Support
                            <span className="ml-auto text-xs text-gray-400">⌘?</span>
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Card>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
}