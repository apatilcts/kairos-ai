'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { AIResponse } from '@/components/ui/AIResponse'
import { 
  DocumentTextIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export function FeatureShowcase() {
  const [activeFeature, setActiveFeature] = useState<'upload' | 'query' | 'generate'>('upload')
  
  const sampleResponse = `Based on the customer interviews and market analysis documents, I've identified three critical pain points:

**1. Manual Data Entry Overhead**
Users consistently report spending 3-4 hours daily on manual data entry tasks. [Source: customer_interviews.pdf] Sarah from TechCorp mentioned: "We waste so much time copying data between systems."

**2. Lack of Real-time Collaboration**
The current workflow doesn't support simultaneous editing, causing version conflicts. [Source: user_survey_results.docx] 78% of teams reported collaboration as their biggest challenge.

**3. Poor Dependency Tracking**
Project managers struggle to visualize interdependencies. [Source: pm_feedback_report.pdf] Mike noted: "We often miss critical dependencies until it's too late."

These insights suggest an MVP focused on automation and real-time collaboration would address the most pressing user needs.`

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            See Verifiable AI in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience how StrategyAI provides transparent, source-backed insights that you can trust and verify.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Interactive Demo */}
          <div className="space-y-6">
            {/* Step Navigation */}
            <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
              {[
                { key: 'upload', icon: CloudArrowUpIcon, label: 'Upload' },
                { key: 'query', icon: SparklesIcon, label: 'Query' },
                { key: 'generate', icon: DocumentTextIcon, label: 'Generate' }
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveFeature(key as any)}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeFeature === key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>

            {/* Feature Content */}
            {activeFeature === 'upload' && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CloudArrowUpIcon className="w-5 h-5 text-blue-600" />
                    <span>Secure Document Upload</span>
                  </CardTitle>
                  <CardDescription>
                    Multiple formats, automatic processing, and intelligent chunking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      <span>customer_interviews.pdf</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500">Processed</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      <span>market_analysis.docx</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500">Vectorized</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      <span>user_survey_results.xlsx</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500">Indexed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeFeature === 'query' && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <SparklesIcon className="w-5 h-5 text-green-600" />
                    <span>Conversational Analysis</span>
                  </CardTitle>
                  <CardDescription>
                    Ask natural language questions, get verifiable answers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700 font-medium">
                        "What are the main user pain points identified in our research?"
                      </p>
                    </div>
                    <AIResponse content={sampleResponse} />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeFeature === 'generate' && (
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                    <span>Strategic Document Generation</span>
                  </CardTitle>
                  <CardDescription>
                    Professional documents based on your insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Generate MVP Canvas
                    </Button>
                    <Button variant="outline" className="w-full">
                      Create PRD Document
                    </Button>
                    <Button variant="outline" className="w-full">
                      Build RFP Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Trust Through Transparency
              </h3>
              <p className="text-gray-600 mb-6">
                Unlike other AI tools that provide "black box" responses, StrategyAI shows you exactly where every insight comes from.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Source Citations",
                  description: "Every AI response includes clickable links to the exact source documents and sections",
                  color: "blue"
                },
                {
                  title: "No Hallucinations",
                  description: "AI can only reference information that exists in your uploaded documents",
                  color: "green"
                },
                {
                  title: "Audit Trail",
                  description: "Complete transparency for compliance and verification requirements",
                  color: "purple"
                },
                {
                  title: "Enterprise Trust",
                  description: "SOC 2 compliant with full data lineage and source tracking",
                  color: "orange"
                }
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${benefit.color}-100`}>
                    <CheckCircleIcon className={`w-5 h-5 text-${benefit.color}-600`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Experience Verifiable AI
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}