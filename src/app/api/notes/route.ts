import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for development
const devNotes: { [key: string]: string } = {};

// Try to use Vercel KV, fall back to in-memory for development
const getKV = async () => {
  try {
    const { kv } = await import('@vercel/kv');
    return kv;
  } catch {
    console.log('Vercel KV not available, using in-memory storage for development');
    return null;
  }
};

// GET /api/notes?date=2025-06-25
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 });
    }
    
    const kv = await getKV();
    let note = '';
    
    if (kv) {
      note = await kv.get(`note:${date}`) || '';
    } else {
      note = devNotes[`note:${date}`] || '';
    }
    
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
    
    const kv = await getKV();
    
    if (note && note.trim()) {
      // Save note
      if (kv) {
        await kv.set(`note:${date}`, note.trim());
      } else {
        devNotes[`note:${date}`] = note.trim();
      }
    } else {
      // Delete note if empty
      if (kv) {
        await kv.del(`note:${date}`);
      } else {
        delete devNotes[`note:${date}`];
      }
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