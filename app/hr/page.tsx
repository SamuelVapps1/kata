import Link from 'next/link';

export default function HRDashboard() {
  const hasApiKey = process.env.ANTHROPIC_API_KEY ? true : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">
            ← Back to home
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-white mb-6">
          PM Kata Hiring Manager Dashboard
        </h1>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">How it works</h2>
          <p className="text-slate-300 leading-relaxed">
            PM Kata turns a take-home assignment into an observable PM simulation. Candidates work through a LegalCo client brief, interact with three stakeholder agents, draft a scoping recommendation, and submit a pyramid summary. The system then produces a hiring manager report.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-2">AI Integration Status</h2>
            <div className={hasApiKey ? "text-green-400 font-medium mb-2" : "text-yellow-400 font-medium mb-2"}>
              {hasApiKey ? "Live AI enabled" : "Demo mode: mock persona responses active"}
            </div>
            <p className="text-slate-400 text-sm">
              To enable live agents in the full version, set ANTHROPIC_API_KEY in Vercel environment variables.
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Demo mode fallback</h2>
            <div className="text-slate-400 text-sm">
              If no live evaluation has been generated, the report page shows representative demo data.
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link href="/session/demo">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors cursor-pointer">
              <h2 className="text-lg font-semibold text-white mb-2">Candidate Sandbox</h2>
              <p className="text-slate-400 text-sm mb-4">
                Open the candidate sandbox and run the LegalCo PM Kata.
              </p>
              <div className="text-blue-400 font-medium">Open sandbox →</div>
            </div>
          </Link>

          <Link href="/report/demo">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors cursor-pointer">
              <h2 className="text-lg font-semibold text-white mb-2">Hiring Manager Report</h2>
              <p className="text-slate-400 text-sm mb-4">
                Open the hiring manager report. If no live evaluation has been generated, the report page shows representative demo data.
              </p>
              <div className="text-blue-400 font-medium">Open report →</div>
            </div>
          </Link>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Evaluation Rubric</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="text-slate-300">
              <div className="font-medium text-white">zero_to_launch</div>
              <div className="text-sm text-slate-400">Ability to ship from concept to launch</div>
            </div>
            <div className="text-slate-300">
              <div className="font-medium text-white">solution_architecture_fluency</div>
              <div className="text-sm text-slate-400">Understanding of system design</div>
            </div>
            <div className="text-slate-300">
              <div className="font-medium text-white">structured_discovery</div>
              <div className="text-sm text-slate-400">Systematic problem exploration</div>
            </div>
            <div className="text-slate-300">
              <div className="font-medium text-white">client_engagement_ownership</div>
              <div className="text-sm text-slate-400">Managing stakeholder relationships</div>
            </div>
            <div className="text-slate-300">
              <div className="font-medium text-white">commercial_discipline</div>
              <div className="text-sm text-slate-400">Business acumen and pricing</div>
            </div>
            <div className="text-slate-300">
              <div className="font-medium text-white">ai_native_operating_model</div>
              <div className="text-sm text-slate-400">Working effectively with AI tools</div>
            </div>
            <div className="text-slate-300">
              <div className="font-medium text-white">t_shaped_range</div>
              <div className="text-sm text-slate-400">Breadth and depth of skills</div>
            </div>
            <div className="text-slate-300">
              <div className="font-medium text-white">project_order_knowledge_discipline</div>
              <div className="text-sm text-slate-400">Organizational execution</div>
            </div>
            <div className="text-slate-300">
              <div className="font-medium text-white">pyramid_communication</div>
              <div className="text-sm text-slate-400">Clear, structured messaging</div>
            </div>
            <div className="text-slate-300">
              <div className="font-medium text-white">high_agency</div>
              <div className="text-sm text-slate-400">Proactive problem-solving</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Scope Cuts</h2>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start">
              <span className="text-slate-400 mr-2">•</span>
              No auth
            </li>
            <li className="flex items-start">
              <span className="text-slate-400 mr-2">•</span>
              No database
            </li>
            <li className="flex items-start">
              <span className="text-slate-400 mr-2">•</span>
              One LegalCo brief
            </li>
            <li className="flex items-start">
              <span className="text-slate-400 mr-2">•</span>
              Server-side AI key only
            </li>
            <li className="flex items-start">
              <span className="text-slate-400 mr-2">•</span>
              Demo-safe fallback behavior
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
