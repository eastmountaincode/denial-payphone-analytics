import React from 'react';

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
  const maxCalls = Math.max(...callData.map(d => showUnique ? d.uniqueCalls : d.totalCalls));

  return (
    <div className="bg-black border border-white rounded-lg p-4">
      <h3 className="text-lg font-medium text-white mb-4">
        Calls per Day ({showUnique ? 'Unique' : 'Total'})
      </h3>
      <div className="overflow-x-auto">
        <div className="h-64 flex items-end justify-between gap-1 min-w-full mb-8 px-4">
          {callData.map((data, index) => {
            const callCount = showUnique ? data.uniqueCalls : data.totalCalls;
            const hasNote = notes[data.date];
            
            // Show dates strategically based on time range
            let showDate = false;
            const totalDays = callData.length;
            if (totalDays <= 7) {
              showDate = true; // Show all dates for 7 days
            } else if (totalDays <= 30) {
              showDate = index % 3 === 0; // Show every 3rd date for 30 days
            } else if (totalDays <= 60) {
              showDate = index % 7 === 0; // Show every 7th date for 60 days
            } else {
              showDate = index % 10 === 0; // Show every 10th date for 90 days
            }
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center" style={{ minWidth: `${Math.max(100 / callData.length, 2)}%` }}>
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
                    className={`hidden sm:block w-4 h-4 rounded-full cursor-pointer group/circle relative ${
                      hasNote 
                        ? 'bg-white border border-white hover:bg-gray-200' 
                        : 'border border-gray-600 hover:border-white hover:bg-white'
                    }`}
                    onClick={() => onNoteClick(data.date)}
                  >
                    {hasNote ? (
                      // Show note icon for dates with notes
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-black text-xs">📝</span>
                      </div>
                    ) : (
                      // Show plus icon on hover for dates without notes
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/circle:opacity-100">
                        <span className="text-black text-xs font-bold">+</span>
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