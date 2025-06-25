'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function HeaderContent() {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-white">
        <span className="inline-block">LSSN Analytics Division</span> <span className="text-sm font-normal align-top">©</span>
      </h1>
      {isDashboard && (
        <div className="flex items-center gap-4">
          <span className="text-white text-sm">Welcome, hoss</span>
          <Link 
            href="/" 
            className="text-white text-sm hover:text-gray-300 underline transition-colors"
          >
            Logout
          </Link>
          <Image 
            src="/web-app-manifest-512x512.png" 
            alt="LSSN Logo" 
            width={32}
            height={32}
            className="h-8 w-8"
          />
        </div>
      )}
    </div>
  );
} 