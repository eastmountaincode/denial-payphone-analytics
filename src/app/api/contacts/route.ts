import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { kv } from '@vercel/kv';

interface StoredContact {
  phone: string;
  firstCall: string;
  lastCall: string;
  totalCalls: number;
  dateAdded: string;
}

// Numbers to exclude from contact database
const EXCLUDED_NUMBERS = [
  'Anonymous',
  'anonymous', 
  '+15132357254', 
  '+14086672608',
  '+14155996020',
  '+16266438555'

];

// Function to check if a phone number should be excluded
const shouldExcludeNumber = (phone: string | null | undefined): boolean => {
  if (!phone || phone.trim() === '') return true;
  if (phone.toLowerCase() === 'anonymous') return true;
  return EXCLUDED_NUMBERS.includes(phone);
};

// GET /api/contacts - Get contacts from OUR database and compare with Twilio
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');
    
    // Get contacts from OUR database
    const storedContactsData = await kv.get('contacts:database') as StoredContact[] | null;
    const storedContacts = storedContactsData || [];
    
    // Initialize Twilio client to check for new contacts
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Twilio credentials not configured' },
        { status: 500 }
      );
    }
    
    const client = twilio(accountSid, authToken);
    
    // Build query parameters to get ALL calls from Twilio
    const queryParams: {
      direction: string;
      limit: number;
      to?: string;
    } = {
      direction: 'inbound',
      limit: 1000
    };
    
    if (phoneNumber) {
      queryParams.to = phoneNumber;
    }
    
    // Fetch ALL incoming calls from Twilio
    const calls = await client.calls.list(queryParams);
    
    // Collect all unique phone numbers from Twilio
    const twilioContacts = new Map<string, { phone: string; firstCall: Date; lastCall: Date; totalCalls: number }>();
    
    calls.forEach((call) => {
      if (call.from && !shouldExcludeNumber(call.from)) {
        const phone = call.from;
        const callDate = new Date(call.dateCreated);
        
        if (twilioContacts.has(phone)) {
          const contact = twilioContacts.get(phone)!;
          contact.totalCalls += 1;
          if (callDate < contact.firstCall) {
            contact.firstCall = callDate;
          }
          if (callDate > contact.lastCall) {
            contact.lastCall = callDate;
          }
        } else {
          twilioContacts.set(phone, {
            phone,
            firstCall: callDate,
            lastCall: callDate,
            totalCalls: 1
          });
        }
      }
    });
    
    // Find new contacts (in Twilio but not in our database)
    const storedPhoneNumbers = new Set(storedContacts.map(c => c.phone));
    const newContacts = Array.from(twilioContacts.values()).filter(
      contact => !storedPhoneNumbers.has(contact.phone)
    );
    
    // Get last sync timestamp
    const lastSyncTimestamp = await kv.get('contacts:last_sync') as string | null;
    const lastSyncDate = lastSyncTimestamp ? new Date(lastSyncTimestamp) : null;
    
    return NextResponse.json({
      contacts: storedContacts.sort((a, b) => new Date(b.lastCall).getTime() - new Date(a.lastCall).getTime()),
      totalContacts: storedContacts.length,
      newContactsFromTwilio: newContacts.length,
      lastSyncDate: lastSyncDate?.toISOString() || null,
      newContacts: newContacts.map(c => ({
        phone: c.phone,
        firstCall: c.firstCall.toISOString(),
        lastCall: c.lastCall.toISOString(),
        totalCalls: c.totalCalls
      }))
    });
    
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Sync new contacts, clear database, or export
export async function POST(request: NextRequest) {
  try {
    const { action, phoneNumber } = await request.json();
    
    if (action === 'clear') {
      // Clear the entire contact database
      await kv.del('contacts:database');
      await kv.del('contacts:last_sync');
      
      return NextResponse.json({
        success: true,
        message: 'Contact database cleared successfully'
      });
    }
    
    if (action === 'sync') {
      // Sync new contacts from Twilio to our database
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      
      if (!accountSid || !authToken) {
        return NextResponse.json(
          { error: 'Twilio credentials not configured' },
          { status: 500 }
        );
      }
      
      const client = twilio(accountSid, authToken);
      
      // Get all calls from Twilio
      const queryParams: {
        direction: string;
        limit: number;
        to?: string;
      } = {
        direction: 'inbound',
        limit: 1000
      };
      
      if (phoneNumber) {
        queryParams.to = phoneNumber;
      }
      
      const calls = await client.calls.list(queryParams);
      
      // Process Twilio contacts
      const twilioContacts = new Map<string, { phone: string; firstCall: Date; lastCall: Date; totalCalls: number }>();
      
             calls.forEach((call) => {
         if (call.from && !shouldExcludeNumber(call.from)) {
           const phone = call.from;
           const callDate = new Date(call.dateCreated);
           
           if (twilioContacts.has(phone)) {
             const contact = twilioContacts.get(phone)!;
             contact.totalCalls += 1;
             if (callDate < contact.firstCall) {
               contact.firstCall = callDate;
             }
             if (callDate > contact.lastCall) {
               contact.lastCall = callDate;
             }
           } else {
             twilioContacts.set(phone, {
               phone,
               firstCall: callDate,
               lastCall: callDate,
               totalCalls: 1
             });
           }
         }
       });
      
      // Get existing contacts from our database
      const storedContactsData = await kv.get('contacts:database') as StoredContact[] | null;
      const storedContacts = storedContactsData || [];
      const storedPhoneNumbers = new Set(storedContacts.map(c => c.phone));
      
      // Find new contacts to add
      const newContacts = Array.from(twilioContacts.values()).filter(
        contact => !storedPhoneNumbers.has(contact.phone)
      );
      
      // Add new contacts to our database
      const now = new Date().toISOString();
      const contactsToAdd: StoredContact[] = newContacts.map(contact => ({
        phone: contact.phone,
        firstCall: contact.firstCall.toISOString(),
        lastCall: contact.lastCall.toISOString(),
        totalCalls: contact.totalCalls,
        dateAdded: now
      }));
      
      // Update our database
      const updatedContacts = [...storedContacts, ...contactsToAdd];
      await kv.set('contacts:database', updatedContacts);
      await kv.set('contacts:last_sync', now);
      
      return NextResponse.json({
        success: true,
        syncTimestamp: now,
        newContactsAdded: contactsToAdd.length,
        totalContacts: updatedContacts.length
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Error syncing contacts:', error);
    return NextResponse.json(
      { error: 'Failed to sync contacts' },
      { status: 500 }
    );
  }
} 