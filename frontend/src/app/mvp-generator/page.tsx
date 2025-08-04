'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { 
  SparklesIcon, 
  LightBulbIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CogIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface MVPFormData {
  productIdea: string;
  targetAudience: string;
  problemToSolve: string;
  keyFeatures: string;
  mvpGoal: string;
  resources: string;
  timeline: string;
}

export default function MVPGeneratorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<MVPFormData>({
    productIdea: '',
    targetAudience: '',
    problemToSolve: '',
    keyFeatures: '',
    mvpGoal: '',
    resources: '',
    timeline: ''
  });
  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);

  const steps = [
    {
      id: 1,
      title: 'Product Idea',
      description: 'Describe your product concept',
      icon: LightBulbIcon,
      field: 'productIdea',
      placeholder: 'e.g., A productivity app that helps teams organize and prioritize tasks using AI-powered insights...'
    },
    {
      id: 2,
      title: 'Target Audience',
      description: 'Define who will use your product',
      icon: UsersIcon,
      field: 'targetAudience',
      placeholder: 'e.g., Small to medium-sized tech companies with remote teams, project managers, and team leads...'
    },
    {
      id: 3,
      title: 'Problem to Solve',
      description: 'What specific problems does your product address?',
      icon: ExclamationTriangleIcon,
      field: 'problemToSolve',
      placeholder: 'e.g., Teams struggle with task prioritization, leading to missed deadlines and decreased productivity...'
    },
    {
      id: 4,
      title: 'Key Features',
      description: 'List all possible features of your product',
      icon: CogIcon,
      field: 'keyFeatures',
      placeholder: 'e.g., AI task prioritization, team collaboration tools, deadline tracking, integration with popular tools...'
    },
    {
      id: 5,
      title: 'MVP Goal',
      description: 'What do you want to achieve with your MVP?',
      icon: CheckCircleIcon,
      field: 'mvpGoal',
      placeholder: 'e.g., Validate product-market fit, test core AI prioritization feature, gather user feedback...'
    },
    {
      id: 6,
      title: 'Resources',
      description: 'What resources do you have available?',
      icon: CurrencyDollarIcon,
      field: 'resources',
      placeholder: 'e.g., $10,000 budget, 2 developers, 1 designer, 3 months timeline...'
    },
    {
      id: 7,
      title: 'Timeline',
      description: 'When do you want to launch your MVP?',
      icon: CalendarIcon,
      field: 'timeline',
      placeholder: 'e.g., 3 months from now, by Q2 2024, within 12 weeks...'
    }
  ];

  const handleInputChange = (field: keyof MVPFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateMVPPlan = async () => {
    setGenerating(true);
    
    // Simulate AI generation (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockPlan = `
# MVP Plan: ${formData.productIdea}

## Executive Summary
Based on your inputs, we've created a comprehensive MVP plan that focuses on validating your core product hypothesis while minimizing development time and costs.

## Target Market Analysis
**Primary Audience:** ${formData.targetAudience}

**Market Size:** Based on your target audience, the addressable market includes approximately 50,000+ potential organizations with similar needs.

**Problem Statement:** ${formData.problemToSolve}

## Core MVP Features (Priority 1)
1. **AI Task Prioritization Engine**
   - Basic algorithm for task ranking
   - User input for task importance
   - Simple scoring system

2. **Team Dashboard**
   - Task overview
   - Team member assignments
   - Progress tracking

3. **Basic Collaboration Tools**
   - Comments on tasks
   - File attachments
   - Notifications

## Secondary Features (Future Releases)
- Advanced AI insights
- Third-party integrations
- Advanced analytics
- Mobile applications

## Development Timeline
**Phase 1 (Weeks 1-4):** Core infrastructure and basic task management
**Phase 2 (Weeks 5-8):** AI prioritization engine implementation
**Phase 3 (Weeks 9-12):** Team collaboration features and testing
**Phase 4 (Weeks 13-16):** Beta testing and launch preparation

## Resource Allocation
Based on your available resources: ${formData.resources}

- **Development:** 60% of budget
- **Design:** 20% of budget
- **Testing & QA:** 15% of budget
- **Marketing & Launch:** 5% of budget

## Success Metrics
- **User Adoption:** 100 active users within first month
- **Feature Usage:** 70% of users actively using AI prioritization
- **User Satisfaction:** 4.0+ star rating or 80%+ positive feedback
- **Retention:** 60% user retention after 30 days

## Validation Strategy
1. **User Interviews:** Conduct 20+ interviews with target audience
2. **Beta Testing:** Launch closed beta with 50 select users
3. **A/B Testing:** Test different UI/UX approaches
4. **Analytics:** Track user behavior and feature usage

## Risk Mitigation
- **Technical Risk:** Start with simpler AI algorithms, iterate based on feedback
- **Market Risk:** Validate assumptions through user interviews
- **Resource Risk:** Focus on core features, defer nice-to-have features

## Next Steps
1. Finalize technical architecture
2. Create detailed wireframes
3. Set up development environment
4. Begin Phase 1 development
5. Recruit beta testers

This MVP plan is designed to validate your core hypothesis with minimal resources while setting the foundation for future growth.
    `;
    
    setGeneratedPlan(mockPlan);
    setGenerating(false);
  };

  if (generatedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    KairosAI
                  </h1>
                </div>
              </Link>
              <Button variant="outline" onClick={() => setGeneratedPlan(null)}>
                Generate New Plan
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              MVP Plan Generated Successfully
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Strategic MVP Plan</h1>
            <p className="text-gray-600">AI-generated roadmap tailored to your specific requirements</p>
          </div>

          <Card variant="elevated" className="mb-8">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                  {generatedPlan}
                </pre>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center space-x-4">
            <Button size="lg">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" size="lg">
              <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
              Copy to Clipboard
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setGeneratedPlan(null)}>
              Generate Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep - 1];
  const isLastStep = currentStep === steps.length;
  const currentValue = formData[currentStepData.field as keyof MVPFormData];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  KairosAI
                </h1>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  MVP Plan Generator
                </p>
              </div>
            </Link>
            <Link href="/">
              <Button variant="outline">← Back to Home</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round((currentStep / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <Card variant="elevated" className="mb-8">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <currentStepData.icon className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
            <CardDescription className="text-lg">{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <textarea
              value={currentValue}
              onChange={(e) => handleInputChange(currentStepData.field as keyof MVPFormData, e.target.value)}
              placeholder={currentStepData.placeholder}
              className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">
              Be as detailed as possible to generate a more accurate MVP plan.
            </p>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <div className="flex space-x-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  step.id === currentStep
                    ? 'bg-blue-600 scale-125'
                    : step.id < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {isLastStep ? (
            <Button 
              onClick={generateMVPPlan}
              disabled={!currentValue.trim() || generating}
              loading={generating}
              size="lg"
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              Generate MVP Plan
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!currentValue.trim()}
            >
              Next
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}