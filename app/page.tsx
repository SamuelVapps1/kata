import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-5xl font-bold text-white mb-6">
          Stop interviewing PMs. Watch them ship.
        </h1>
        <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
          A 60-minute PM Kata where candidates scope a fake client engagement, work with AI stakeholders, and generate an evidence-based hiring report.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Link href="/session/demo">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition-colors cursor-pointer">
              <h2 className="text-2xl font-semibold text-white mb-4">
                I'm a Candidate
              </h2>
              <p className="text-slate-400 mb-6">
                Enter the 60-minute PM Kata sandbox and complete the LegalCo scoping challenge.
              </p>
              <div className="text-blue-400 font-medium">
                Start candidate test →
              </div>
            </div>
          </Link>

          <Link href="/hr">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition-colors cursor-pointer">
              <h2 className="text-2xl font-semibold text-white mb-4">
                I'm Hiring Manager / HR
              </h2>
              <p className="text-slate-400 mb-6">
                Review candidate reports, understand the scoring system, and check AI integration status.
              </p>
              <div className="text-blue-400 font-medium">
                Open HR dashboard →
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
