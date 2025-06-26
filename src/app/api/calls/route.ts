import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const phoneNumber = searchParams.get('phone');
    const timezone = searchParams.get('timezone') || 'America/New_York'; // Default to EST
    
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
    
    // Group calls by date and track unique numbers across entire timeframe
    const callsByDate: { [key: string]: { total: number; unique: Set<string> } } = {};
    const allUniqueNumbers = new Set<string>(); // Track unique numbers across entire timeframe
    
    // Initialize all dates in range - include today through past days (in user's timezone)
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      // Convert to user's timezone for date grouping
      const dateString = date.toLocaleDateString('en-CA', { timeZone: timezone }); // en-CA gives YYYY-MM-DD format
      callsByDate[dateString] = { total: 0, unique: new Set() };
    }
    
    // Process calls - convert Twilio UTC timestamps to user's timezone
    calls.forEach((call) => {
      // Convert Twilio UTC timestamp to user's timezone date
      const callDate = new Date(call.dateCreated).toLocaleDateString('en-CA', { timeZone: timezone });
      if (callsByDate[callDate]) {
        callsByDate[callDate].total += 1;
        // Use 'from' number for unique caller tracking
        if (call.from) {
          callsByDate[callDate].unique.add(call.from);
          allUniqueNumbers.add(call.from); // Track across entire timeframe
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

    // Add the total unique count across entire timeframe to the response
    return NextResponse.json({
      dailyData: result,
      totalUniqueCallers: allUniqueNumbers.size
    });
    
  } catch (error) {
    console.error('Error fetching Twilio data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 