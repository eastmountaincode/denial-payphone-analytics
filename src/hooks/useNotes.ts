import { useState } from 'react';

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
      const keys = [];
      const currentDate = new Date(startDate);
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

  const closeModal = () => {
    setEditingNote(null);
    setNoteText('');
  };

  const loadNotesForData = async (callData: CallData[]) => {
    if (callData.length > 0) {
      const dates = callData.map((d: CallData) => d.date).sort();
      const startDate = dates[0];
      const endDate = dates[dates.length - 1];
      await fetchNotes(startDate, endDate);
    }
  };

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