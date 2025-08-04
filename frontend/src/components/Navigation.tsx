'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, DocumentTextIcon, ChatBubbleLeftRightIcon, Cog6ToothIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function Navigation() {
  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 h-16 shadow-sm">
      <div className="px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  KairosAI
                </span>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Strategic Intelligence
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Neural Document Processing</span>
            </div>
            
            {/* Settings Menu */}
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-white/80 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <Cog6ToothIcon className="h-4 w-4 mr-2 text-gray-500" />
                  Settings
                  <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-400" aria-hidden="true" />
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
                <Menu.Items className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-xl bg-white/95 backdrop-blur-md shadow-xl ring-1 ring-black/5 border border-gray-100 focus:outline-none">
                  <div className="py-2">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={`${
                            active ? 'bg-blue-50 text-blue-900' : 'text-gray-700'
                          } flex items-center px-4 py-3 text-sm font-medium transition-colors`}
                        >
                          <Cog6ToothIcon className="h-5 w-5 mr-3 text-gray-400" />
                          API Configuration
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={`${
                            active ? 'bg-blue-50 text-blue-900' : 'text-gray-700'
                          } flex items-center px-4 py-3 text-sm font-medium transition-colors`}
                        >
                          <DocumentTextIcon className="h-5 w-5 mr-3 text-gray-400" />
                          Help & Documentation
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
}