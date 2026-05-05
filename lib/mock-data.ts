import { Session, EvaluationResult, AgentPersona } from './types';

export const mockBrief = `# Client Brief: LegalCo Case Management AI Copilot

**Client:** LegalCo
**Project:** Case Management Workflow Upgrade
**Timeline:** 12 weeks
**Budget:** $350,000

## Background
LegalCo's case operations rely on fragmented tools across email, spreadsheets, and legacy matter tracking. Intake-to-resolution cycle time has increased 28% over the last 2 quarters. Team pain points:
- Duplicate data entry across systems
- Slow document retrieval during active matters
- Inconsistent matter status visibility
- Manual handoffs causing missed SLAs

## Objectives
1. Reduce matter cycle time by 30%
2. Improve first-response SLA adherence from 72% to 92%
3. Launch AI-assisted intake summarization, risk flagging, and timeline views
4. Increase internal CSAT from 3.1 to 4.3+

## Constraints
- Must integrate with existing document repository and billing export format
- Compliance team requires auditability of AI-generated suggestions
- Limited design capacity (1 designer at 50% allocation)
- Engineering team has 3 developers with ongoing BAU load

## Key Stakeholders
- Sarah Chen (Client Proxy): Focused on outcomes, cost, and timeline confidence
- Marcus Rodriguez (Engineering Lead): Focused on delivery risk and system constraints
- Priya Sharma (Design Lead): Focused on workflow clarity and adoption

## Success Metrics
- Intake-to-resolution cycle time
- SLA compliance %
- Rework rate on intake packets
- User satisfaction from legal ops teams
- Escalation volume per matter`;

export const mockDiscoveryTranscript = `**Initial Discovery Call - March 15, 2026**

Sarah Chen: "We need this in-market this quarter. Leadership wants measurable cycle-time improvement in 12 weeks."

Marcus Rodriguez: "Twelve weeks is aggressive with current staffing. We can ship, but only if we phase scope. Also, audit logging for AI actions is non-negotiable."

Priya Sharma: "If we overpack phase one, adoption will suffer. We should prioritize intake clarity and status visibility first."

Sarah: "I can defend phased delivery if the first release clearly improves SLA compliance."

Marcus: "I can free one developer if we defer the internal dashboard cleanup, but that increases maintenance risk."

Priya: "We should reuse the existing design system and limit new components to critical workflow gaps."`;

export const mockInternalEmail = `From: Marcus Rodriguez <marcus@legalco.com>
To: Sarah Chen, Priya Sharma
Subject: Technical constraints for LegalCo workflow upgrade

Hi team,

After reviewing the current codebase, I need to flag some technical risks:

1. Current matter service has no event log model for AI recommendations. Audit trail implementation is a 2-3 week effort.

2. Document retrieval API has unstable response times under load; AI-assisted summarization depends on this path.

3. Billing export format is tightly coupled to legacy status codes; any workflow changes must preserve mapping rules.

Given these constraints, I recommend we either:
- Keep phase one to intake summary + timeline visibility + SLA alerts, or
- Extend timeline by 4 weeks to include risk flagging in first release

Let me know your thoughts.

Marcus`;

export const mockAgentResponses: Record<AgentPersona, string> = {
  sarah: "I understand the timeline pressure, but we need to be realistic about what we can deliver. Have you considered which features would have the biggest impact on our engagement metrics? I'm particularly interested in the spending insights feature - do you think we can deliver that within the constraints?",
  marcus: "From a technical perspective, I'm concerned about the legacy API compatibility requirement. The current architecture wasn't built for the features you're proposing. We might need to consider a phased migration approach. What's your take on the technical trade-offs here?",
  priya: "I'm excited about the design possibilities, but I'm worried about delivering a cohesive experience with limited design resources. Have you thought about how we can maintain design consistency while moving quickly? Perhaps we could leverage an existing design system to accelerate our work?"
};

export function createMockSession(id: string): Session {
  return {
    id,
    createdAt: Date.now(),
    status: 'in_progress',
    title: '',
    markdown: '',
    agentChats: {
      sarah: [],
      marcus: [],
      priya: []
    }
  };
}

export function createMockEvaluation(sessionId: string): EvaluationResult {
  return {
    sessionId,
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
      leadership: 74
    },
    summary: "The candidate demonstrates strong stakeholder management skills and shows good understanding of the business context. They effectively balanced competing priorities from Sarah, Marcus, and Priya. Areas for improvement include more rigorous data-driven decision making and clearer prioritization framework.",
    highlights: [
      "Identified key tensions between stakeholder requirements early in the process",
      "Proposed a phased approach that addressed both timeline and technical constraints",
      "Demonstrated empathy for each stakeholder's perspective while maintaining objectivity"
    ],
    redFlags: [
      "Limited quantitative analysis to support recommendations",
      "Did not explicitly address compliance timeline requirements",
      "Final deliverable lacked specific success metrics and KPIs"
    ],
    finalDeliverable: "# NovaBank Mobile App Refresh - Product Strategy\n\n## Executive Summary\n\nOur approach balances business urgency with technical reality through a phased delivery model.",
    pyramidSummary: {
      headline: "Phased mobile refresh delivers 80% of value in 4 months while building foundation for long-term success",
      keyArguments: "1. Phase 1 (4 months): UI refresh + biometric login addresses 60% of user complaints\n2. Phase 2 (2 months): Spending insights and bill split complete the feature set\n3. Technical debt addressed incrementally to minimize risk\n4. Design system adoption accelerates delivery without sacrificing quality",
      ask: "Approval to proceed with phased approach, including reallocating 1 developer from internal dashboard project and hiring contract designer for 2 months"
    }
  };
}

// In-memory session storage
const sessions = new Map<string, Session>();

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function saveSession(session: Session): void {
  sessions.set(session.id, session);
}

export function createSession(): Session {
  const id = Math.random().toString(36).substring(2, 9);
  const session = createMockSession(id);
  saveSession(session);
  return session;
}
