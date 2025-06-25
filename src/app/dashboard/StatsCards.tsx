import React from 'react';

interface CallData {
  date: string;
  totalCalls: number;
  uniqueCalls: number;
}

interface StatsCardsProps {
  callData: CallData[];
  showUnique: boolean;
}

export default function StatsCards({ callData, showUnique }: StatsCardsProps) {
  const totalCalls = callData.reduce((sum, d) => sum + d.totalCalls, 0);
  const totalUniqueCalls = callData.reduce((sum, d) => sum + d.uniqueCalls, 0);
  const dailyAverage = Math.round(callData.reduce((sum, d) => sum + (showUnique ? d.uniqueCalls : d.totalCalls), 0) / callData.length);
  const peakDay = Math.max(...callData.map(d => showUnique ? d.uniqueCalls : d.totalCalls));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-black border border-white rounded-lg p-4 flex flex-col justify-between h-24">
        <div className="text-sm text-gray-300">Total Calls</div>
        <div className="text-2xl font-bold text-white text-left">
          {totalCalls}
        </div>
      </div>
      <div className="bg-black border border-white rounded-lg p-4 flex flex-col justify-between h-24">
        <div className="text-sm text-gray-300">Total Unique Calls</div>
        <div className="text-2xl font-bold text-white text-left">
          {totalUniqueCalls}
        </div>
      </div>
      <div className="bg-black border border-white rounded-lg p-4 flex flex-col justify-between h-24">
        <div className="text-sm text-gray-300">Daily Average</div>
        <div className="text-2xl font-bold text-white text-left">
          {dailyAverage}
        </div>
      </div>
      <div className="bg-black border border-white rounded-lg p-4 flex flex-col justify-between h-24">
        <div className="text-sm text-gray-300">Peak Day</div>
        <div className="text-2xl font-bold text-white text-left">
          {peakDay}
        </div>
      </div>
    </div>
  );
} 