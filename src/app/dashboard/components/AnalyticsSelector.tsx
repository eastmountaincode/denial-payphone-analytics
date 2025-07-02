'use client';

import React, { useRef, useState, useEffect } from 'react';

interface AnalyticsType {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface AnalyticsSelectorProps {
  analyticsTypes: AnalyticsType[];
  selectedType: string;
  onTypeChange: (typeId: string) => void;
}

export default function AnalyticsSelector({ analyticsTypes, selectedType, onTypeChange }: AnalyticsSelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const hasOverflow = container.scrollWidth > container.clientWidth;
    const isAtEnd = container.scrollLeft >= (container.scrollWidth - container.clientWidth - 1);
    
    setShowScrollIndicator(hasOverflow);
    setCanScrollRight(hasOverflow && !isAtEnd);
  };

  useEffect(() => {
    checkScrollability();
    
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [analyticsTypes]);

  return (
    <div className="border-b border-white bg-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide"
        >
          <div className="flex space-x-0 min-w-max">
            {analyticsTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onTypeChange(type.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  selectedType === type.id
                    ? 'border-white text-white'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
                }`}
              >
                <span className="text-base">{type.icon}</span>
                <span>{type.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Scroll indicator - only show when there's more content to the right */}
        {showScrollIndicator && canScrollRight && (
          <div className="absolute right-4 top-0 bottom-0 flex items-center pointer-events-none">
            <div className="bg-gradient-to-l from-black via-black/80 to-transparent w-8 h-full flex items-center justify-end pr-1">
              <svg 
                className="w-4 h-4 text-gray-400 animate-pulse" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 