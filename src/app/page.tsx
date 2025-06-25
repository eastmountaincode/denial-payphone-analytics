'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('hoss');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded credentials check
    if (username === 'hoss' && password === 'doodoo') {
      router.push('/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="bg-black px-4 sm:px-6 lg:px-8" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="flex flex-col justify-center items-center h-full py-12">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-black border border-white py-8 px-6 sm:px-10 shadow-lg rounded-lg mx-4 sm:mx-0">
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
              <h2 className="text-center text-3xl font-extrabold text-white">
                Sign in to Dashboard
              </h2>
              <p className="mt-2 text-center text-sm text-white">
                Access your Twilio call analytics
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-white">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-white sm:text-sm bg-black text-white"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-white sm:text-sm bg-black text-white"
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-white rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
