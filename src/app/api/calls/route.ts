import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const phoneNumber = searchParams.get('phone');
    
    // Initialize Twilio client
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Twilio credentials not configured' },
        { status: 500 }
      );
    }
    
    const client = twilio(accountSid, authToken);
    
    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Build query parameters
    const queryParams: {
      direction: string;
      limit: number;
      to?: string;
    } = {
      // startTime: startDate,  // Commenting out date filter - it was causing issues
      direction: 'inbound', // Only incoming calls
      limit: 1000
    };
    
    // Add phone number filter if provided
    if (phoneNumber) {
      queryParams.to = phoneNumber;
    }
    
    // Fetch incoming calls from Twilio
    const calls = await client.calls.list(queryParams);
    
    // Group calls by date
    const callsByDate: { [key: string]: { total: number; unique: Set<string> } } = {};
    
    // Initialize all dates in range - include today through past days
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      callsByDate[dateString] = { total: 0, unique: new Set() };
    }
    
    // Process calls
    calls.forEach((call) => {
      const callDate = new Date(call.dateCreated).toISOString().split('T')[0];
      if (callsByDate[callDate]) {
        callsByDate[callDate].total += 1;
        // Use 'from' number for unique caller tracking
        if (call.from) {
          callsByDate[callDate].unique.add(call.from);
        }
      }
    });
    
        // Convert to array format - sort with most recent dates last (so they appear on the right)
    const result = Object.entries(callsByDate)
      .sort(([a], [b]) => a.localeCompare(b)) // Keep chronological order so most recent is rightmost
      .map(([date, data]) => ({
        date,
        totalCalls: data.total,
        uniqueCalls: data.unique.size
      }));

    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error fetching Twilio data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 