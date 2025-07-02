'use client';

import React, { useState, useEffect } from 'react';
import { HiArrowDownTray, HiUsers, HiArrowPath, HiTrash, HiInboxStack, HiSparkles, HiCheckCircle } from 'react-icons/hi2';

interface Contact {
  phone: string;
  firstCall: string;
  lastCall: string;
  totalCalls: number;
  dateAdded: string;
}

interface ContactData {
  contacts: Contact[];
  totalContacts: number;
  newContactsFromTwilio: number;
  lastSyncDate: string | null;
}

interface ContactExportProps {
  phoneNumber: string;
}

export default function ContactExport({ phoneNumber }: ContactExportProps) {
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchContactData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contacts?phone=${encodeURIComponent(phoneNumber)}`);
      if (response.ok) {
        const data = await response.json();
        setContactData(data);
      } else {
        console.error('Failed to fetch contact data');
      }
    } catch (error) {
      console.error('Error fetching contact data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!confirm('Are you sure you want to clear all saved contacts? This cannot be undone.')) {
      return;
    }
    
    try {
      setClearing(true);
      
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' })
      });
      
      if (response.ok) {
        // Refresh data after clearing
        await fetchContactData();
      } else {
        console.error('Failed to clear database');
      }
      
    } catch (error) {
      console.error('Error clearing database:', error);
    } finally {
      setClearing(false);
    }
  };

  const handleSyncContacts = async () => {
    if (!contactData) return;
    
    try {
      setSyncing(true);
      
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync', phoneNumber })
      });
      
      if (response.ok) {
        // Refresh data after sync
        await fetchContactData();
      } else {
        console.error('Failed to sync contacts');
      }
      
    } catch (error) {
      console.error('Error syncing contacts:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleExportCSV = async () => {
    if (!contactData) return;
    
    try {
      setExporting(true);
      
      // Create CSV content from OUR database
      const csvHeaders = ['Phone Number', 'First Call', 'Last Call', 'Total Calls', 'Date Added'];
      const csvRows = contactData.contacts.map(contact => [
        contact.phone,
        new Date(contact.firstCall).toLocaleDateString(),
        new Date(contact.lastCall).toLocaleDateString(),
        contact.totalCalls.toString(),
        new Date(contact.dateAdded).toLocaleDateString()
      ]);
      
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `contacts_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchContactData();
  }, [phoneNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="bg-black border border-white rounded-lg p-6">
        <div className="flex justify-center items-center h-32">
          <div className="text-white">Loading contact data...</div>
        </div>
      </div>
    );
  }

  if (!contactData) {
    return (
      <div className="bg-black border border-white rounded-lg p-6">
        <div className="flex justify-center items-center h-32">
          <div className="text-red-400">Failed to load contact data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black border border-white rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <HiUsers className="text-white text-2xl" />
          <h3 className="text-xl font-semibold text-white">Contact Database</h3>
        </div>
        
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={handleClearDatabase}
            disabled={clearing || contactData.totalContacts === 0}
            className={`flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-md font-medium transition-colors text-sm whitespace-nowrap ${
              clearing || contactData.totalContacts === 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
            }`}
          >
            <HiTrash className="text-sm" />
            <span>{clearing ? 'Clearing...' : 'Clear DB'}</span>
          </button>
          
          <button
            onClick={handleSyncContacts}
            disabled={syncing}
            className={`flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition-colors text-sm whitespace-nowrap ${
              syncing
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : contactData.newContactsFromTwilio > 0
                  ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 cursor-pointer'
            }`}
          >
            <HiArrowPath className={`text-sm ${syncing ? 'animate-spin' : ''}`} />
            <span>
              {syncing ? 'Syncing...' : 
               contactData.newContactsFromTwilio > 0 ? 
                 `Sync ${contactData.newContactsFromTwilio} New` : 
                 'Sync Contacts'
              }
            </span>
          </button>
          
          <button
            onClick={handleExportCSV}
            disabled={exporting || contactData.totalContacts === 0}
            className={`flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition-colors text-sm whitespace-nowrap ${
              exporting || contactData.totalContacts === 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-white text-black hover:bg-gray-200 cursor-pointer'
            }`}
          >
            <HiArrowDownTray className="text-sm" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-black border border-gray-600 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {contactData.totalContacts}
          </div>
          <div className="text-xs text-gray-300">Saved Contacts</div>
        </div>
        
        <div className="bg-black border border-gray-600 rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold mb-1 ${
            contactData.newContactsFromTwilio > 0 ? 'text-green-400' : 'text-gray-400'
          }`}>
            {contactData.newContactsFromTwilio}
          </div>
          <div className="text-xs text-gray-300">New in Twilio</div>
        </div>
        
        <div className="bg-black border border-gray-600 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-300 mb-1">Last Sync</div>
          <div className="text-xs text-white">
            {contactData.lastSyncDate 
              ? new Date(contactData.lastSyncDate).toLocaleDateString()
              : 'Never'
            }
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-400">
        <p className="mb-2 flex items-center gap-2">
          <HiInboxStack className="text-gray-400" />
          <strong>{contactData.totalContacts}</strong> contacts permanently saved
        </p>
        {contactData.newContactsFromTwilio > 0 ? (
          <p className="text-green-400 flex items-center gap-2">
            <HiSparkles className="text-green-400" />
            <strong>{contactData.newContactsFromTwilio}</strong> new contacts available from Twilio - click Sync to save them!
          </p>
        ) : (
          <p className="text-gray-500 flex items-center gap-2">
            <HiCheckCircle className="text-gray-500" />
            All Twilio contacts are synced
          </p>
        )}
      </div>
    </div>
  );
} 