import React from 'react';

interface CallData {
  date: string;
  totalCalls: number;
  uniqueCalls: number;
}

interface StatsCardsProps {
  callData: CallData[];
  showUnique: boolean;
  totalUniqueCallers: number;
}

export default function StatsCards({ callData, showUnique, totalUniqueCallers }: StatsCardsProps) {
  // Calculate based on the toggle
  const totalCalls = showUnique 
    ? callData.reduce((sum, d) => sum + d.uniqueCalls, 0) // Sum of daily unique calls
    : callData.reduce((sum, d) => sum + d.totalCalls, 0);  // Sum of all calls
  
  // Unique Numbers - always the same, true unique phone numbers across entire timeframe
  const uniqueNumbers = totalUniqueCallers;
  
  // Daily Average - changes based on toggle
  const dailyAverage = Math.round(callData.reduce((sum, d) => sum + (showUnique ? d.uniqueCalls : d.totalCalls), 0) / callData.length);
  
  // Peak Day - changes based on toggle
  const peakDay = Math.max(...callData.map(d => showUnique ? d.uniqueCalls : d.totalCalls));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-black border border-white rounded-lg p-4 flex flex-col justify-center items-center text-center sm:items-start sm:text-left sm:justify-between h-28 sm:h-24">
        <div className="text-xs text-gray-300 sm:order-1">Total Calls</div>
        <div className="text-3xl sm:text-2xl font-bold text-white mb-1 sm:mb-0 sm:order-2">
          {totalCalls}
        </div>
      </div>
      <div className="bg-black border border-white rounded-lg p-4 flex flex-col justify-center items-center text-center sm:items-start sm:text-left sm:justify-between h-28 sm:h-24">
        <div className="text-xs text-gray-300 sm:order-1">Unique Numbers</div>
        <div className="text-3xl sm:text-2xl font-bold text-white mb-1 sm:mb-0 sm:order-2">
          {uniqueNumbers}
        </div>
      </div>
      <div className="bg-black border border-white rounded-lg p-4 flex flex-col justify-center items-center text-center sm:items-start sm:text-left sm:justify-between h-28 sm:h-24">
        <div className="text-xs text-gray-300 sm:order-1">Daily Average</div>
        <div className="text-3xl sm:text-2xl font-bold text-white mb-1 sm:mb-0 sm:order-2">
          {dailyAverage}
        </div>
      </div>
      <div className="bg-black border border-white rounded-lg p-4 flex flex-col justify-center items-center text-center sm:items-start sm:text-left sm:justify-between h-28 sm:h-24">
        <div className="text-xs text-gray-300 sm:order-1">Peak Day</div>
        <div className="text-3xl sm:text-2xl font-bold text-white mb-1 sm:mb-0 sm:order-2">
          {peakDay}
        </div>
      </div>
    </div>
  );
} 