import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// GET /api/notes?date=2025-06-25
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 });
    }
    
    const note = await kv.get(`note:${date}`) || '';
    
    return NextResponse.json({ date, note });
    
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note' },
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