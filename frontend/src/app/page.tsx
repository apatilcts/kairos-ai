'use client'

import { Button } from '@/components/ui/Button'
import { 
  DocumentTextIcon, 
  RocketLaunchIcon,
  SparklesIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  LightBulbIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header - Factory.ai style: clean, professional, minimal */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">KairosAI</h1>
                  <p className="text-xs text-gray-500 font-medium">STRATEGIC INTELLIGENCE PLATFORM</p>
                </div>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</a>
                <a href="#demo" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Demo</a>
                <a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Pricing</a>
                <a href="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Dashboard</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Sign In
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Clean, minimal, professional */}
      <section className="pt-16 pb-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-8">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Trusted by 500+ enterprises for strategic planning
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              AI-Powered Strategy Generation
              <span className="block mt-4 text-blue-600">with Enterprise Intelligence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Upload your documents, ask strategic questions, and generate professional MVPs, PRDs, and business plans with AI that shows its work. Every insight includes verifiable source citations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                <RocketLaunchIcon className="mr-2 h-5 w-5" />
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3">
                <PlayIcon className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-gray-500 text-sm">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <ShieldCheckIcon className="w-5 h-5 text-green-500 mr-2" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center">
                <UserGroupIcon className="w-5 h-5 text-green-500 mr-2" />
                <span>Enterprise SSO</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Clean grid layout */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Enterprise-Grade Intelligence Platform</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for strategic planning, document analysis, and AI-powered insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* RAG-Powered Knowledge Base */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <CloudArrowUpIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Document Intelligence</h3>
              <p className="text-gray-600 mb-4">Secure upload and AI-powered analysis of your business documents with source verification</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Multi-format support (PDF, DOCX, TXT, PPTX)
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Cloud storage integration
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Version control and document history
                </li>
              </ul>
            </div>

            {/* Verifiable Insights */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <ShieldCheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Verifiable Insights</h3>
              <p className="text-gray-600 mb-4">AI answers with clickable source citations - no hallucinations, complete transparency</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 italic">
                  "Every AI response includes direct links to source documents, building trust through transparency."
                </p>
              </div>
            </div>

            {/* Smart Generation */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <DocumentTextIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Templates</h3>
              <p className="text-gray-600 mb-4">Generate enterprise-grade documents in minutes, not weeks</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• MVP Canvas & Business Cases</li>
                <li>• PRD & User Personas</li>
                <li>• RFP & GTM Strategies</li>
                <li>• System Design Documents</li>
              </ul>
            </div>

            {/* Conversational AI */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Chat Interface</h3>
              <p className="text-gray-600 mb-4">Natural language queries across your entire knowledge base</p>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="text-xs text-gray-500 font-medium">Example queries:</div>
                <div className="text-sm text-gray-700 bg-white rounded px-3 py-2">"What are the key user pain points?"</div>
                <div className="text-sm text-gray-700 bg-white rounded px-3 py-2">"Compare market analysis reports"</div>
              </div>
            </div>

            {/* Team Collaboration */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <UserGroupIcon className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Team Collaboration</h3>
              <p className="text-gray-600 mb-4">Real-time editing and workflow integration for teams</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Shared workspaces</li>
                <li>• Role-based permissions</li>
                <li>• Jira/Asana integration</li>
                <li>• Live commenting & reviews</li>
              </ul>
            </div>

            {/* Predictive Analytics */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <ChartBarIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Predictive Analytics</h3>
              <p className="text-gray-600 mb-4">AI-powered insights and risk detection for strategic planning</p>
              <p className="text-sm text-gray-600">
                Early warnings on timeline slips, conflicting requirements, and project risks with actionable recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Strategic Planning?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Join hundreds of enterprises using KairosAI to accelerate their strategic initiatives. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-3">
              Schedule Demo
            </Button>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            No credit card required • 14-day free trial • Setup in under 5 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold">KairosAI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Enterprise strategy platform powered by verifiable AI insights.
              </p>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Features", "Demo", "Dashboard", "MVP Generator"]
              },
              {
                title: "Company", 
                links: ["About", "Customers", "Security", "Contact"]
              },
              {
                title: "Resources",
                links: ["Documentation", "API", "Support", "Blog"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-medium mb-4 text-white">{section.title}</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  {section.links.map((link, linkIndex) => (
                    <a key={linkIndex} href="#" className="block hover:text-white transition-colors">
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 KairosAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}