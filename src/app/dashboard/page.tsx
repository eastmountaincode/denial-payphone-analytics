'use client';

import { useState } from 'react';
import AnalyticsSelector from './components/AnalyticsSelector';
import CallsAnalytics from './components/calls/CallsAnalytics';
import { HiPhone, HiRectangleStack } from 'react-icons/hi2';

interface AnalyticsType {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const analyticsTypes: AnalyticsType[] = [
  { id: 'calls', name: 'Denial Payphone', icon: <HiPhone /> },
  { id: 'placeholder1', name: 'Coming Soon', icon: <HiRectangleStack /> },
  { id: 'placeholder2', name: 'Coming Soon', icon: <HiRectangleStack /> },
  { id: 'placeholder3', name: 'Coming Soon', icon: <HiRectangleStack /> },
];

export default function Dashboard() {
  const [selectedAnalytics, setSelectedAnalytics] = useState<string>('calls');

  const renderAnalyticsContent = () => {
    switch (selectedAnalytics) {
      case 'calls':
        return <CallsAnalytics />;
      case 'placeholder1':
      case 'placeholder2':
      case 'placeholder3':
        return (
          <div className="bg-black border border-white rounded-lg shadow-lg p-6">
            <div className="flex justify-center items-center h-64">
              <div className="text-white text-center">
                <HiRectangleStack className="text-4xl mb-4 mx-auto text-gray-400" />
                <div className="text-xl font-semibold mb-2">Analytics Dashboard</div>
                <div className="text-gray-400">Coming Soon</div>
              </div>
            </div>
          </div>
        );
      default:
        return <CallsAnalytics />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <AnalyticsSelector
        analyticsTypes={analyticsTypes}
        selectedType={selectedAnalytics}
        onTypeChange={setSelectedAnalytics}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderAnalyticsContent()}
      </main>
    </div>
  );
} 