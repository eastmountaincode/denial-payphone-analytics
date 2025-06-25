'use client';

import { useState, useEffect } from 'react';
import CallChart from './CallChart';
import StatsCards from './StatsCards';
import NoteModal from './NoteModal';
import { useNotes } from '../../hooks/useNotes';

interface CallData {
  date: string;
  totalCalls: number;
  uniqueCalls: number;
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '60' | '90'>('7');
  const [showUnique, setShowUnique] = useState(false);
  const [callData, setCallData] = useState<CallData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Custom hook for note management
  const {
    notes,
    editingNote,
    noteText,
    handleNoteClick,
    saveNote,
    closeModal,
    setNoteText,
    loadNotesForData,
  } = useNotes();
  
  // Hardcoded phone number
  const phoneNumber = '+14156505285';



  useEffect(() => {
    const fetchCallData = async () => {
      setLoading(true);
      try {
        const url = `/api/calls?days=${timeRange}&phone=${encodeURIComponent(phoneNumber)}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setCallData(data);
          
          // Fetch notes for the same date range
          await loadNotesForData(data);
        } else {
          console.error('Failed to fetch call data');
        }
      } catch (error) {
        console.error('Error fetching call data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCallData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  return (
    <div className="min-h-screen bg-black">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-black border border-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-2">
            <h2 className="text-2xl font-semibold text-white mb-4 sm:mb-0">
              Twilio Call Analytics
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="unique-calls"
                  checked={showUnique}
                  onChange={(e) => setShowUnique(e.target.checked)}
                  className="rounded border-white bg-black text-white focus:ring-white cursor-pointer"
                />
                <label htmlFor="unique-calls" className="text-white text-sm">
                  Show unique calls only
                </label>
              </div>
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as '7' | '30' | '60' | '90')}
                  className="bg-black border border-white text-white rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-white cursor-pointer appearance-none w-full"
                >
                  <option value="7">Past 7 days</option>
                  <option value="30">Past 30 days</option>
                  <option value="60">Past 60 days</option>
                  <option value="90">Past 90 days</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-white">Loading analytics...</div>
            </div>
          ) : (
            <div className="space-y-6">
              <CallChart 
                callData={callData} 
                showUnique={showUnique} 
                notes={notes}
                onNoteClick={handleNoteClick}
              />
              <StatsCards 
                callData={callData} 
                showUnique={showUnique} 
              />
            </div>
          )}
        </div>
      </main>

      <NoteModal
        editingNote={editingNote}
        noteText={noteText}
        notes={notes}
        onClose={closeModal}
        onSave={saveNote}
        onNoteTextChange={setNoteText}
      />
    </div>
  );
} 