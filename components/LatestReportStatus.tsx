'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LatestReportStatus() {
  const [hasReport, setHasReport] = useState(false);

  useEffect(() => {
    // Check if there's a report in localStorage
    const report = localStorage.getItem('pmkata-report-demo');
    setHasReport(!!report);
  }, []);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-white mb-2">Latest Candidate Evaluation</h2>
      <p className="text-slate-400 text-sm mb-4">
        Demo mode stores the latest candidate session in this browser so the hiring manager can review what was submitted. In production, this would move to authenticated server-side persistence.
      </p>
      {hasReport ? (
        <div className="space-y-3">
          <div className="text-green-400 font-medium">Latest demo candidate report available</div>
          <Link href="/report/demo">
            <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-sm transition-colors cursor-pointer">
              Open latest report
            </div>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-yellow-400 font-medium">No candidate evaluation generated yet</div>
          <Link href="/session/demo">
            <div className="inline-block px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 font-medium text-sm transition-colors cursor-pointer">
              Run candidate test
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
