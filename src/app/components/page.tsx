'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Zap, BarChart3, Bell, Accessibility, Search } from 'lucide-react';

// Import available enhanced components
import { EnhancedButton } from '@/components/ui/EnhancedButton';
import { EnhancedInput } from '@/components/ui/EnhancedInput';
import { EnhancedSkeleton } from '@/components/ui/EnhancedSkeleton';
import { EnhancedToastDemo } from '@/components/ui/EnhancedToastDemo';
import { EnhancedModalDemo } from '@/components/ui/EnhancedModalDemo';
import { EnhancedDropdownDemo } from '@/components/ui/EnhancedDropdownDemo';
import { EnhancedTooltipDemo } from '@/components/ui/EnhancedTooltipDemo';
import { EnhancedScrollDemo } from '@/components/ui/EnhancedScrollDemo';
import { EnhancedBarChart } from '@/components/ui/EnhancedCharts';
import { EnhancedProgressDemo } from '@/components/ui/EnhancedProgressDemo';

export default function ComponentShowcase() {
  const [activeTab, setActiveTab] = useState('buttons');
  const [searchQuery, setSearchQuery] = useState('');

  const componentCategories = [
    { id: 'buttons', name: 'Buttons', icon: Zap, count: 8 },
    { id: 'forms', name: 'Form Elements', icon: Palette, count: 2 },
    { id: 'feedback', name: 'Feedback', icon: Bell, count: 6 },
    { id: 'data', name: 'Data Visualization', icon: BarChart3, count: 2 },
    { id: 'accessibility', name: 'Accessibility', icon: Accessibility, count: 1 }
  ];

  const filteredCategories = componentCategories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const componentData = {
    buttons: [
      { name: 'Primary Button', component: <EnhancedButton variant="primary">Primary</EnhancedButton> },
      { name: 'Secondary Button', component: <EnhancedButton variant="secondary">Secondary</EnhancedButton> },
      { name: 'Outline Button', component: <EnhancedButton variant="outline">Outline</EnhancedButton> },
      { name: 'Ghost Button', component: <EnhancedButton variant="ghost">Ghost</EnhancedButton> }
    ],
    forms: [
      { name: 'Text Input', component: <EnhancedInput placeholder="Enter text..." value="" onChange={() => {}} /> },
      { name: 'Loading Skeleton', component: <EnhancedSkeleton className="h-20 w-full" /> }
    ],
    feedback: [
      { name: 'Toast Demo', component: <EnhancedToastDemo /> },
      { name: 'Modal Demo', component: <EnhancedModalDemo /> },
      { name: 'Dropdown Demo', component: <EnhancedDropdownDemo /> },
      { name: 'Tooltip Demo', component: <EnhancedTooltipDemo /> },
      { name: 'Scroll Demo', component: <EnhancedScrollDemo /> },
      { name: 'Progress Demo', component: <EnhancedProgressDemo /> }
    ],
    data: [
      { 
        name: 'Bar Chart', 
        component: <EnhancedBarChart 
          data={[
            { label: 'Jan', value: 65 },
            { label: 'Feb', value: 59 },
            { label: 'Mar', value: 80 },
            { label: 'Apr', value: 81 },
            { label: 'May', value: 56 }
          ]}
          horizontal={false}
          animated={true}
          showValueLabels={true}
        /> 
      },
      { name: 'Progress Demo', component: <EnhancedProgressDemo /> }
    ],
    accessibility: [
      { name: 'Focus Management', component: <div className="text-white">Focus management handled automatically in all components</div> }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Component Showcase</h1>
          <p className="text-white/70 text-lg">Interactive demonstration of enhanced UI components</p>
        </div>

        {/* Search */}
        <div className="mb-8 relative max-w-md mx-auto">
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
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4 sticky top-6">
              <nav className="space-y-2">
                {filteredCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveTab(category.id)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeTab === category.id
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {componentCategories.find(c => c.id === activeTab)?.name}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {componentData[activeTab as keyof typeof componentData]?.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all duration-300"
                  >
                    <h3 className="text-white font-medium mb-4">{item.name}</h3>
                    <div className="flex justify-center">
                      {item.component}
                    </div>
                  </motion.div>
                )) || (
                  <div className="col-span-full text-center py-12">
                    <div className="text-white/50">No components found</div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}