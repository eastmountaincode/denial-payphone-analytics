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
    <div className="bg-black px-4 sm:px-6 lg:px-8 flex flex-col justify-start items-center pt-20 pb-12" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-black border border-white py-8 px-6 sm:px-10 shadow-lg rounded-lg mx-4 sm:mx-0">
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
              <h2 className="text-center text-3xl font-extrabold text-white">
                LSSN Secure Login
              </h2>
              <p className="mt-2 text-center text-sm text-white">
                Requests will be answered in the order they are received.
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
                  Clock In
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => alert('What else have you forgotten? Uncapitalized _______')}
                className="text-sm text-white hover:text-gray-300 underline transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}
