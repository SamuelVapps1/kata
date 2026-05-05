'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const startKata = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' }),
      });
      const session = await response.json();
      router.push(`/session/${session.id}`);
    } catch (error) {
      console.error('Failed to create session:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h1 className="text-5xl font-bold text-white mb-6">PM Kata</h1>
        <p className="text-xl text-slate-300 mb-4">
          A 60-minute sandbox for evaluating AI-native senior PM candidates
        </p>
        <p className="text-slate-400 mb-12">
          You'll receive a client brief, work in a markdown editor, chat with three AI personas,
          and submit a final deliverable. The system will generate a comprehensive evaluation report.
        </p>
        <button
          onClick={startKata}
          disabled={loading}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white text-lg font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Starting...' : 'Start PM Kata'}
        </button>
        <div className="mt-12 grid grid-cols-3 gap-6 text-slate-400">
          <div>
            <div className="text-3xl mb-2">👩‍💼</div>
            <div className="font-medium text-white">Sarah</div>
            <div className="text-sm">Client</div>
          </div>
          <div>
            <div className="text-3xl mb-2">👨‍💻</div>
            <div className="font-medium text-white">Marcus</div>
            <div className="text-sm">Engineer</div>
          </div>
          <div>
            <div className="text-3xl mb-2">👩‍🎨</div>
            <div className="font-medium text-white">Priya</div>
            <div className="text-sm">Designer</div>
          </div>
        </div>
      </div>
    </div>
  );
}
