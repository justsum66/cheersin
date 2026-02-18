'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Copy, Check, BookOpen, Code, Palette, Accessibility, Zap } from 'lucide-react';

// Design System Documentation Component
export function DesignSystemDocumentation() {
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Component categories and documentation
  const componentCategories = {
    overview: {
      title: 'Design System Overview',
      icon: BookOpen,
      description: 'Comprehensive guide to Cheersin\'s design system and component library',
      content: () => (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-xl border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-3">Cheersin Design System</h2>
            <p className="text-white/70 mb-4">
              A comprehensive design system built for the Cheersin application, featuring 50+ UX/UI optimizations 
              that enhance accessibility, performance, and user experience across all components.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">50+</div>
                <div className="text-sm text-white/60">Optimizations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">25+</div>
                <div className="text-sm text-white/60">Components</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">WCAG</div>
                <div className="text-sm text-white/60">AA Compliant</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">90+</div>
                <div className="text-sm text-white/60">Lighthouse Score</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    accessibility: {
      title: 'Accessibility Components',
      icon: Accessibility,
      description: 'Components optimized for WCAG 2.1 AA compliance and inclusive design',
      content: () => (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Enhanced Accessibility Features</h3>
          
          <div className="grid gap-4">
            <ComponentCard 
              title="Enhanced Focus Indicators"
              description="Custom focus rings with smooth animations and proper contrast ratios"
              usage="Use enhanced focus indicators for all interactive elements"
              code={`import { EnhancedFocusRing } from '@/components/ui/EnhancedFocusRing';

<EnhancedFocusRing>
  <button className="px-4 py-2 bg-blue-500 text-white rounded">
    Click me
  </button>
</EnhancedFocusRing>`}
              features={['Smooth animations', 'WCAG 2.1 AA compliant', 'Customizable colors', 'Keyboard navigation support']}
            />
            
            <ComponentCard 
              title="Skip Links"
              description="Keyboard navigation shortcuts for improved accessibility"
              usage="Place at the beginning of your page layout"
              code={`import { SkipLink } from '@/components/ui/SkipLink';

<SkipLink targetId="main-content" label="Skip to main content" />`}
              features={['Screen reader optimized', 'Keyboard only', 'Smooth scrolling', 'Multiple target support']}
            />
            
            <ComponentCard 
              title="Enhanced Form Labels"
              description="Accessible form components with proper labeling and validation"
              usage="Use for all form inputs and controls"
              code={`import { EnhancedLabel } from '@/components/ui/EnhancedLabel';

<EnhancedLabel 
  htmlFor="email" 
  required 
  description="Enter your email address"
>
  Email Address
</EnhancedLabel>`}
              features={['ARIA attributes', 'Validation states', 'Error messaging', 'Screen reader support']}
            />
          </div>
        </div>
      )
    },
    visual: {
      title: 'Visual Design Components',
      icon: Palette,
      description: 'Enhanced visual components with modern design patterns',
      content: () => (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Visual Design System</h3>
          
          <div className="grid gap-4">
            <ComponentCard 
              title="Enhanced Buttons"
              description="Modern button components with multiple variants and states"
              usage="Use for all interactive actions"
              code={`import { EnhancedButton } from '@/components/ui/EnhancedButton';

<EnhancedButton 
  variant="primary" 
  size="md"
  onClick={handleClick}
  disabled={isLoading}
>
  Click me
</EnhancedButton>`}
              features={['8 variants', '3 sizes', 'Loading states', 'Icon support', 'Keyboard accessible']}
            />
            
            <ComponentCard 
              title="Enhanced Cards"
              description="Glassmorphism cards with depth and visual hierarchy"
              usage="Use for content containers and information display"
              code={`import { EnhancedCard } from '@/components/ui/EnhancedCard';

<EnhancedCard 
  variant="glass"
  hoverEffect="lift"
  className="max-w-md"
>
  <h3 className="text-lg font-semibold">Card Title</h3>
  <p className="text-white/70">Card content goes here</p>
</EnhancedCard>`}
              features={['Glassmorphism effect', 'Hover animations', 'Multiple variants', 'Responsive design']}
            />
            
            <ComponentCard 
              title="Enhanced Typography"
              description="Consistent typography system with proper hierarchy"
              usage="Use for all text content"
              code={`import { EnhancedTypography } from '@/components/ui/EnhancedTypography';

<EnhancedTypography 
  variant="h1"
  className="text-center"
>
  Heading Text
</EnhancedTypography>`}
              features={['8 heading levels', 'Responsive scaling', 'Font weight variants', 'Line height optimization']}
            />
          </div>
        </div>
      )
    },
    interaction: {
      title: 'Interactive Components',
      icon: Zap,
      description: 'Enhanced interactive elements with smooth animations',
      content: () => (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Interactive Components</h3>
          
          <div className="grid gap-4">
            <ComponentCard 
              title="Enhanced Toast Notifications"
              description="Non-blocking notifications with multiple positions and animations"
              usage="Use for user feedback and status updates"
              code={`import { useEnhancedToast } from '@/hooks/useEnhancedToast';

const { showToast } = useEnhancedToast();

showToast({
  title: 'Success!',
  description: 'Operation completed successfully',
  variant: 'success',
  position: 'top-right'
});`}
              features={['5 positions', '4 variants', 'Auto-dismiss', 'Custom durations', 'Keyboard dismissible']}
            />
            
            <ComponentCard 
              title="Enhanced Modal Dialogs"
              description="Accessible modal dialogs with smooth transitions"
              usage="Use for important user interactions"
              code={`import { EnhancedModal } from '@/components/ui/EnhancedModal';

<EnhancedModal 
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
  size="md"
>
  <p>Modal content goes here</p>
</EnhancedModal>`}
              features={['ARIA compliant', 'Keyboard navigation', 'Focus trapping', 'Smooth animations', 'Multiple sizes']}
            />
            
            <ComponentCard 
              title="Enhanced Dropdown Menus"
              description="Accessible dropdowns with keyboard navigation and search"
              usage="Use for selection and menu components"
              code={`import { EnhancedDropdown } from '@/components/ui/EnhancedDropdown';

<EnhancedDropdown 
  options={options}
  value={selectedValue}
  onChange={handleChange}
  searchable
  multiple
/>`}
              features={['Keyboard navigation', 'Search functionality', 'Multiple selection', 'Custom rendering', 'ARIA labels']}
            />
          </div>
        </div>
      )
    },
    data: {
      title: 'Data Visualization',
      icon: Code,
      description: 'Enhanced data visualization components',
      content: () => (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Data Visualization Components</h3>
          
          <div className="grid gap-4">
            <ComponentCard 
              title="Enhanced Charts"
              description="Interactive chart components with animations and tooltips"
              usage="Use for data visualization and reporting"
              code={`import { BarChart } from '@/components/ui/EnhancedCharts';

<BarChart 
  data={chartData}
  horizontal={false}
  animated={true}
  showValueLabels={true}
  showTooltip={true}
/>`}
              features={['Bar and line charts', 'Horizontal/vertical orientation', 'Animations', 'Tooltips', 'Custom colors']}
            />
            
            <ComponentCard 
              title="Enhanced Progress Indicators"
              description="Visual progress tracking with multiple variants"
              usage="Use for loading states and progress tracking"
              code={`import { EnhancedLinearProgress } from '@/components/ui/EnhancedProgress';

<EnhancedLinearProgress 
  value={75}
  variant="gradient"
  showLabel={true}
  animated={true}
/>`}
              features={['Linear and circular progress', 'Step indicators', 'Loading bars', 'Gradient variants', 'Animations']}
            />
          </div>
        </div>
      )
    }
  };

  const filteredCategories = Object.entries(componentCategories).filter(([key, category]) => 
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Design System Documentation</h1>
          <p className="text-white/70">Comprehensive guide to Cheersin's enhanced component library</p>
        </div>

        {/* Search */}
        <div className="mb-8 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4 sticky top-6">
              <nav className="space-y-2">
                {filteredCategories.map(([key, category]) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveSection(key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeSection === key
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{category.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6"
              >
                {componentCategories[activeSection as keyof typeof componentCategories]?.content()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component Card Component
function ComponentCard({ 
  title, 
  description, 
  usage, 
  code, 
  features 
}: { 
  title: string; 
  description: string; 
  usage: string;
  code: string; 
  features: string[]; 
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
          <p className="text-white/70 text-sm">{description}</p>
        </div>
        <button
          onClick={copyCode}
          className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/70" />}
          <span className="text-xs text-white/70">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      <div className="mb-4">
        <h5 className="text-sm font-medium text-white/80 mb-2">Usage:</h5>
        <p className="text-white/60 text-sm">{usage}</p>
      </div>

      <div className="mb-4">
        <h5 className="text-sm font-medium text-white/80 mb-2">Code Example:</h5>
        <pre className="bg-black/30 p-4 rounded-lg text-sm overflow-x-auto">
          <code className="text-green-400">{code}</code>
        </pre>
      </div>

      <div>
        <h5 className="text-sm font-medium text-white/80 mb-2">Features:</h5>
        <div className="flex flex-wrap gap-2">
          {features.map((feature, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}