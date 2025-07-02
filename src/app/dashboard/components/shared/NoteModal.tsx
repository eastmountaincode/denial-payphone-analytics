import React from 'react';

interface NoteModalProps {
  editingNote: string | null;
  noteText: string;
  notes: { [key: string]: string };
  onClose: () => void;
  onSave: (date: string, note: string) => void;
  onNoteTextChange: (text: string) => void;
}

export default function NoteModal({ 
  editingNote, 
  noteText, 
  notes, 
  onClose, 
  onSave, 
  onNoteTextChange 
}: NoteModalProps) {
  if (!editingNote) return null;

  return (
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
          onChange={(e) => onNoteTextChange(e.target.value)}
          placeholder="Enter your note here... (e.g., 'Ran Facebook ad campaign')"
          className="w-full h-32 bg-black border border-white text-white rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-white"
          autoFocus
        />
        <div className="flex justify-between mt-4">
          <div>
            {notes[editingNote] && (
              <button
                onClick={() => onSave(editingNote, '')}
                className="px-4 py-2 text-red-400 border border-red-400 rounded-md hover:bg-red-400 hover:text-black cursor-pointer"
              >
                Delete Note
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white border border-white rounded-md hover:bg-white hover:text-black cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(editingNote, noteText)}
              className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 cursor-pointer"
            >
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 