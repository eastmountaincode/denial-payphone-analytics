import { useState, useCallback } from 'react';

interface CallData {
  date: string;
  totalCalls: number;
  uniqueCalls: number;
}

export function useNotes() {
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const fetchNotes = async (startDate: string, endDate: string) => {
    try {
      // Single API call for date range
      const response = await fetch(`/api/notes?startDate=${startDate}&endDate=${endDate}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || {});
      } else {
        console.error('Failed to fetch notes');
      }
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

  const closeModal = () => {
    setEditingNote(null);
    setNoteText('');
  };

  const loadNotesForData = useCallback(async (callData: CallData[]) => {
    if (callData.length > 0) {
      const dates = callData.map((d: CallData) => d.date).sort();
      const startDate = dates[0];
      const endDate = dates[dates.length - 1];
      await fetchNotes(startDate, endDate);
    }
  }, []);

  return {
    // State
    notes,
    editingNote,
    noteText,
    
    // Actions
    handleNoteClick,
    saveNote,
    closeModal,
    setNoteText,
    loadNotesForData,
  };
} 