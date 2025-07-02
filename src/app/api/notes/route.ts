import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// GET /api/notes?date=2025-06-25 OR /api/notes?startDate=2025-06-01&endDate=2025-06-30
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Single date request (legacy)
    if (date) {
      const note = await kv.get(`note:${date}`) || '';
      return NextResponse.json({ date, note });
    }
    
    // Date range request (optimized)
    if (startDate && endDate) {
      const keys = [];
      const currentDate = new Date(startDate);
      const end = new Date(endDate);
      
      while (currentDate <= end) {
        keys.push(`note:${currentDate.toISOString().split('T')[0]}`);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Batch fetch all notes at once
      const notes: { [key: string]: string } = {};
      
      // KV doesn't have native batch get, so we'll use Promise.all but at least it's server-side
      const notePromises = keys.map(async (key) => {
        const note = await kv.get(key) as string | null;
        const date = key.replace('note:', '');
        return { date, note: note || '' };
      });
      
      const results = await Promise.all(notePromises);
      results.forEach(({ date, note }) => {
        if (note) notes[date] = note;
      });
      
      return NextResponse.json({ notes });
    }
    
    return NextResponse.json({ error: 'Date or date range required' }, { status: 400 });
    
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST /api/notes
export async function POST(request: NextRequest) {
  try {
    const { date, note } = await request.json();
    
    if (!date) {
      return NextResponse.json({ error: 'Date required' }, { status: 400 });
    }
    
    if (note && note.trim()) {
      // Save note
      await kv.set(`note:${date}`, note.trim());
    } else {
      // Delete note if empty
      await kv.del(`note:${date}`);
    }
    
    return NextResponse.json({ success: true, date, note: note?.trim() || '' });
    
  } catch (error) {
    console.error('Error saving note:', error);
    return NextResponse.json(
      { error: 'Failed to save note' },
      { status: 500 }
    );
  }
} 