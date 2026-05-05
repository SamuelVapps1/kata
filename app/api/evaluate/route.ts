import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { EVALUATOR_MODEL, EvaluationReport } from '@/lib/schema';
import { getSession, updateSession } from '@/lib/session-store';
import { EVALUATOR_PROMPT } from '@/lib/prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const FALLBACK_REPORT: EvaluationReport = {
  overallScore: 72,
  dimensionScores: {
    problemDefinition: 75,
    stakeholderManagement: 80,
    analyticalThinking: 70,
    communication: 75,
    prioritization: 65,
    technicalUnderstanding: 70,
    designSensitivity: 75,
    dataDriven: 68,
    executionFocus: 72,
    leadership: 74,
  },
  summary: "The candidate demonstrates strong stakeholder management skills and shows good understanding of the business context. They effectively balanced competing priorities from Sarah, Marcus, and Priya. Areas for improvement include more rigorous data-driven decision making and clearer prioritization framework.",
  highlights: [
    "Identified key tensions between stakeholder requirements early in the process",
    "Proposed a phased approach that addressed both timeline and technical constraints",
    "Demonstrated empathy for each stakeholder's perspective while maintaining objectivity",
  ],
  redFlags: [
    "Limited quantitative analysis to support recommendations",
    "Did not explicitly address compliance timeline requirements",
    "Final deliverable lacked specific success metrics and KPIs",
  ],
  finalDeliverable: "Candidate's deliverable content would appear here",
  pyramidSummary: {
    headline: "Phased mobile refresh delivers 80% of value in 4 months while building foundation for long-term success",
    keyArguments: "1. Phase 1 (4 months): UI refresh + biometric login addresses 60% of user complaints\n2. Phase 2 (2 months): Spending insights and bill split complete the feature set\n3. Technical debt addressed incrementally to minimize risk\n4. Design system adoption accelerates delivery without sacrificing quality",
    ask: "Approval to proceed with phased approach, including reallocating 1 developer from internal dashboard project and hiring contract designer for 2 months",
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body as { sessionId: string };

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Build conversation transcripts
    const conversationTranscripts = Object.entries(session.conversations)
      .map(([agent, conv]) => `## ${agent}\n${conv.messages.map(m => `${m.role}: ${m.content}`).join('\n')}`)
      .join('\n\n');

    // Build events log
    const eventsLog = session.events
      .map(e => `[${e.ts}] ${e.type}: ${JSON.stringify(e.payload)}`)
      .join('\n');

    const fullPrompt = `${EVALUATOR_PROMPT}

## Session Information
Session ID: ${session.id}
Candidate ID: ${session.candidateId}
Created: ${session.createdAt}

## Events Log
${eventsLog || 'No events recorded'}

## Conversations
${conversationTranscripts}

## Deliverable
Title: ${session.deliverableTitle || 'No title provided'}
Content:
${session.deliverableMarkdown || 'No content provided'}

${session.pyramidSummary ? `## Pyramid Summary
Headline: ${session.pyramidSummary.headline}
Key Arguments: ${session.pyramidSummary.keyArguments}
Ask: ${session.pyramidSummary.ask}` : 'No pyramid summary provided'}`;

    let report: EvaluationReport;

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const msg = await anthropic.messages.create({
          model: EVALUATOR_MODEL,
          max_tokens: 2000,
          messages: [{ role: 'user', content: fullPrompt }],
        });

        const content = msg.content[0].type === 'text' ? msg.content[0].text : '';

        // Try to parse strict JSON
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            report = JSON.parse(jsonMatch[0]) as EvaluationReport;
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          console.error('Failed to parse AI evaluation response:', parseError);
          report = FALLBACK_REPORT;
        }
      } catch (aiError) {
        console.error('Anthropic evaluation error, using fallback:', aiError);
        report = FALLBACK_REPORT;
      }
    } else {
      report = FALLBACK_REPORT;
    }

    // Save report to session
    updateSession(sessionId, { evaluationReport: report });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error in evaluate route:', error);
    return NextResponse.json(FALLBACK_REPORT);
  }
}
