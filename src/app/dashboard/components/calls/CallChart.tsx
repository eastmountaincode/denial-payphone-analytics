import React, { useEffect, useRef } from 'react';
import { IoChatboxOutline } from 'react-icons/io5';
import { HiPlus } from 'react-icons/hi2';

interface CallData {
  date: string;
  totalCalls: number;
  uniqueCalls: number;
}

interface CallChartProps {
  callData: CallData[];
  showUnique: boolean;
  notes: { [key: string]: string };
  onNoteClick: (date: string) => void;
}

export default function CallChart({ callData, showUnique, notes, onNoteClick }: CallChartProps) {
  // Always use total calls for the scale, so unique calls bars shrink down visually
  const maxCalls = Math.max(...callData.map(d => d.totalCalls));
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to the right when component mounts or data changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [callData]);

  return (
    <div className="bg-black border border-white rounded-lg p-4">
      <h3 className="text-lg font-medium text-white mb-4">
        Calls per Day ({showUnique ? 'Unique' : 'Total'})
      </h3>
      <div className="overflow-x-auto" ref={scrollContainerRef}>
        <div className={`h-72 flex items-end gap-1 mb-8 px-4 ${callData.length <= 15 ? 'justify-between min-w-full' : ''}`} style={callData.length > 15 ? { minWidth: `${callData.length * 28}px` } : {}}>
          {callData.map((data, index) => {
            const callCount = showUnique ? data.uniqueCalls : data.totalCalls;
            const hasNote = notes[data.date];
            
            // Show dates strategically based on time range
            let showDate = false;
            const totalDays = callData.length;
            const isLastDate = index === callData.length - 1; // Always show the most recent date
            
            if (totalDays <= 7) {
              showDate = true; // Show all dates for 7 days
            } else if (totalDays <= 30) {
              showDate = index % 3 === 0 || isLastDate; // Show every 3rd date + most recent
            } else if (totalDays <= 60) {
              showDate = index % 7 === 0 || isLastDate; // Show every 7th date + most recent
            } else {
              showDate = index % 10 === 0 || isLastDate; // Show every 10th date + most recent
            }
            
            return (
              <div key={index} className={`flex flex-col items-center ${callData.length <= 15 ? 'flex-1' : ''}`} style={callData.length > 15 ? { width: '24px' } : {}}>
                <div className="text-xs text-white mb-1">{callCount}</div>
                <div
                  className="bg-white rounded-t-sm w-full transition-all duration-300"
                  style={{ 
                    height: `${Math.max((callCount / maxCalls) * 160, 4)}px`
                  }}
                />
                <div className="text-xs text-gray-300 mt-2 flex flex-col items-center">
                  {/* Fixed height container for date labels */}
                  <div className="h-12 flex flex-col items-center justify-start">
                    {showDate && (
                      <>
                        <div className="w-px bg-gray-600 h-4"></div>
                        <span className="whitespace-nowrap text-center sm:rotate-0 rotate-45 mt-2 sm:mt-0 origin-center">
                          {new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* Note circle - different states for notes vs no notes */}
                  <div 
                    className={`hidden sm:block w-6 h-6 rounded-full cursor-pointer group/circle relative ${
                      hasNote 
                        ? 'bg-white border border-white hover:bg-gray-200' 
                        : 'border border-gray-600 hover:border-white hover:bg-white'
                    }`}
                    onClick={() => onNoteClick(data.date)}
                  >
                    {hasNote ? (
                      // Show note icon for dates with notes
                      <div className="absolute inset-0 flex items-center justify-center">
                        <IoChatboxOutline className="text-black text-sm" />
                      </div>
                    ) : (
                      // Show plus icon on hover for dates without notes
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/circle:opacity-100">
                        <HiPlus className="text-black text-sm" />
                      </div>
                    )}
                    
                    {/* Tooltip for notes */}
                    {hasNote && (
                      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black border border-white text-white text-xs px-2 py-1 rounded opacity-0 group-hover/circle:opacity-100 pointer-events-none z-10 max-w-xs text-center break-words">
                        {hasNote}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 