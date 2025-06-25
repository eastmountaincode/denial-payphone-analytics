'use client';

import { useState, useEffect } from 'react';
import CallChart from './CallChart';
import StatsCards from './StatsCards';

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
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  
  // Hardcoded phone number
  const phoneNumber = '+14156505285';

  const fetchNotes = async (startDate: string, endDate: string) => {
    try {
      const keys = [];
      let currentDate = new Date(startDate);
      const end = new Date(endDate);
      
      while (currentDate <= end) {
        keys.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      const notePromises = keys.map(async (date) => {
        try {
          const response = await fetch(`/api/notes?date=${date}`);
          if (response.ok) {
            const data = await response.json();
            return { date, note: data.note };
          }
          return { date, note: '' };
        } catch {
          return { date, note: '' };
        }
      });
      
      const noteResults = await Promise.all(notePromises);
      const noteMap: { [key: string]: string } = {};
      noteResults.forEach(({ date, note }) => {
        if (note) noteMap[date] = note;
      });
      
      setNotes(noteMap);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const saveNote = async (date: string, note: string) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, note }),
      });
      
      if (response.ok) {
        if (note.trim()) {
          setNotes(prev => ({ ...prev, [date]: note.trim() }));
        } else {
          setNotes(prev => {
            const newNotes = { ...prev };
            delete newNotes[date];
            return newNotes;
          });
        }
        setEditingNote(null);
        setNoteText('');
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleNoteClick = (date: string) => {
    setEditingNote(date);
    setNoteText(notes[date] || '');
  };

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
          if (data.length > 0) {
            const dates = data.map((d: CallData) => d.date).sort();
            const startDate = dates[0];
            const endDate = dates[dates.length - 1];
            await fetchNotes(startDate, endDate);
          }
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

      {/* Note editing modal */}
      {editingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">
              Add Note for {new Date(editingNote + 'T00:00:00').toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter your note here... (e.g., 'Ran Facebook ad campaign')"
              className="w-full h-32 bg-black border border-white text-white rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-white"
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setEditingNote(null);
                  setNoteText('');
                }}
                className="px-4 py-2 text-white border border-white rounded-md hover:bg-white hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={() => saveNote(editingNote, noteText)}
                className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 