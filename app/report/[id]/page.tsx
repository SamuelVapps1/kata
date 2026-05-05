'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { EvaluationResult } from '@/lib/types';
import { createMockEvaluation } from '@/lib/mock-data';

const DIMENSION_LABELS: Record<keyof EvaluationResult['dimensionScores'], string> = {
  problemDefinition: 'Problem Definition',
  stakeholderManagement: 'Stakeholder Management',
  analyticalThinking: 'Analytical Thinking',
  communication: 'Communication',
  prioritization: 'Prioritization',
  technicalUnderstanding: 'Technical Understanding',
  designSensitivity: 'Design Sensitivity',
  dataDriven: 'Data Driven',
  executionFocus: 'Execution Focus',
  leadership: 'Leadership',
};

const DIMENSION_EVIDENCE: Record<keyof EvaluationResult['dimensionScores'], string> = {
  problemDefinition: 'Candidate demonstrated ability to identify core business problems and frame them appropriately for stakeholders.',
  stakeholderManagement: 'Effectively navigated conflicting priorities between business, technical, and design stakeholders.',
  analyticalThinking: 'Showed structured approach to breaking down complex problems into manageable components.',
  communication: 'Articulated ideas clearly and adapted messaging for different stakeholder audiences.',
  prioritization: 'Made trade-off decisions based on business impact and technical feasibility.',
  technicalUnderstanding: 'Demonstrated awareness of technical constraints and architectural implications.',
  designSensitivity: 'Considered user experience implications and design consistency in decisions.',
  dataDriven: 'Used quantitative and qualitative data to support recommendations.',
  executionFocus: 'Maintained practical focus on deliverability and implementation considerations.',
  leadership: 'Showed initiative in driving alignment and facilitating decision-making.',
};

function getRecommendation(score: number): { text: string; color: string } {
  if (score >= 80) return { text: 'STRONG RECOMMEND TO HIRE', color: 'text-green-700 bg-green-50 border-green-600' };
  if (score >= 65) return { text: 'RECOMMEND TO HIRE', color: 'text-blue-700 bg-blue-50 border-blue-600' };
  if (score >= 50) return { text: 'CONSIDER WITH RESERVATIONS', color: 'text-yellow-700 bg-yellow-50 border-yellow-600' };
  return { text: 'DO NOT RECOMMEND', color: 'text-red-700 bg-red-50 border-red-600' };
}

function ScoreTable({ evaluation }: { evaluation: EvaluationResult }) {
  const dimensions = Object.entries(evaluation.dimensionScores) as [keyof EvaluationResult['dimensionScores'], number][];
  
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b-2 border-gray-200">
          <th className="text-left py-2 px-3 font-semibold text-gray-700">Dimension</th>
          <th className="text-center py-2 px-3 font-semibold text-gray-700">Score</th>
          <th className="text-left py-2 px-3 font-semibold text-gray-700">Evidence & Rationale</th>
        </tr>
      </thead>
      <tbody>
        {dimensions.map(([key, score]) => (
          <tr key={key} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="py-2 px-3 font-medium text-gray-900">{DIMENSION_LABELS[key]}</td>
            <td className="py-2 px-3 text-center">
              <span className={`inline-block px-2 py-1 rounded font-bold ${
                score >= 80 ? 'bg-green-100 text-green-800' :
                score >= 65 ? 'bg-blue-100 text-blue-800' :
                score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {score}
              </span>
            </td>
            <td className="py-2 px-3 text-gray-600 text-xs">{DIMENSION_EVIDENCE[key]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ReportPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    loadEvaluation();
  }, [sessionId]);

  const loadEvaluation = async () => {
    setLoading(true);
    // Always show demo banner for /report/demo
    const isDemoSession = sessionId === 'demo';
    
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch evaluation');
      }
      
      const data = await response.json();
      setEvaluation(data);
      setIsDemo(isDemoSession);
    } catch (error) {
      console.error('Failed to load evaluation:', error);
      // Fallback to local sample report
      setEvaluation(createMockEvaluation(sessionId));
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700 mb-3"></div>
          <div className="text-slate-600 font-medium">Generating evaluation report...</div>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-600">Unable to load evaluation report</div>
      </div>
    );
  }

  const recommendation = getRecommendation(evaluation.overallScore);
  const dimensions = Object.entries(evaluation.dimensionScores) as [keyof EvaluationResult['dimensionScores'], number][];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center gap-2">
              <span className="text-amber-700 font-semibold text-sm">Demo report — representative evaluator output</span>
              <span className="text-amber-600 text-xs">(shown because no live evaluation has been generated)</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">PM Kata Evaluation</div>
              <h1 className="text-xl font-bold text-slate-900 mt-1">Candidate Assessment Report</h1>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Candidate ID</div>
              <div className="font-mono text-sm text-slate-700">{sessionId}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Executive Summary */}
        <div className="bg-white border border-slate-200 rounded-sm mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="p-6 border-b lg:border-b-0 lg:border-r border-slate-200">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Overall Score</div>
              <div className="text-5xl font-bold text-slate-900">{evaluation.overallScore}</div>
              <div className="text-xs text-slate-500 mt-1">out of 100</div>
            </div>
            <div className="p-6 border-b lg:border-b-0 lg:border-r border-slate-200">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Recommendation</div>
              <div className={`inline-block px-4 py-2 border-l-4 font-bold text-sm ${recommendation.color}`}>
                {recommendation.text}
              </div>
            </div>
            <div className="p-6">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Summary</div>
              <p className="text-sm text-slate-700 leading-relaxed">{evaluation.summary}</p>
            </div>
          </div>
        </div>

        {/* Dimension Scores */}
        <div className="bg-white border border-slate-200 rounded-sm mb-6">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Dimension Scores</h2>
          </div>
          <div className="p-6">
            <ScoreTable evaluation={evaluation} />
          </div>
        </div>

        {/* Detailed Score Cards with Evidence */}
        <div className="bg-white border border-slate-200 rounded-sm mb-6">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Detailed Assessment</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {dimensions.map(([key, score]) => (
              <div key={key} className="p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-slate-900">{DIMENSION_LABELS[key]}</h3>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        score >= 80 ? 'bg-green-100 text-green-800' :
                        score >= 65 ? 'bg-blue-100 text-blue-800' :
                        score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {score}/100
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{DIMENSION_EVIDENCE[key]}</p>
                  </div>
                  <div className="w-24 flex-shrink-0">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          score >= 80 ? 'bg-green-600' :
                          score >= 65 ? 'bg-blue-600' :
                          score >= 50 ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights and Red Flags */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border border-slate-200 rounded-sm">
            <div className="px-6 py-4 border-b border-slate-200 bg-green-50">
              <h2 className="text-sm font-bold text-green-900 uppercase tracking-wider">Key Strengths</h2>
            </div>
            <div className="p-4">
              <ul className="space-y-3">
                {evaluation.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-700 leading-relaxed">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-sm">
            <div className="px-6 py-4 border-b border-slate-200 bg-red-50">
              <h2 className="text-sm font-bold text-red-900 uppercase tracking-wider">Areas of Concern</h2>
            </div>
            <div className="p-4">
              <ul className="space-y-3">
                {evaluation.redFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-700 leading-relaxed">{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Pyramid Summary */}
        <div className="bg-white border border-slate-200 rounded-sm mb-6">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Pyramid Summary</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Headline</div>
                <div className="bg-slate-50 border-l-4 border-slate-700 p-4 text-sm text-slate-800 font-medium">
                  {evaluation.pyramidSummary.headline}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Key Arguments</div>
                <div className="bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {evaluation.pyramidSummary.keyArguments}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">The Ask</div>
                <div className="bg-amber-50 border-l-4 border-amber-600 p-4 text-sm text-slate-800">
                  {evaluation.pyramidSummary.ask}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Deliverable */}
        <div className="bg-white border border-slate-200 rounded-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Candidate's Final Deliverable</h2>
          </div>
          <div className="p-6">
            <div className="prose prose-sm max-w-none bg-slate-50 p-6 border border-slate-100">
              <ReactMarkdown>{evaluation.finalDeliverable}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
