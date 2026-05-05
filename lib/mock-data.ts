import { Session, EvaluationResult, AgentPersona } from './types';

export const mockBrief = `# Client Brief: FinTech Mobile App Refresh

**Client:** NovaBank
**Project:** Mobile Banking App Redesign
**Timeline:** 6 months
**Budget:** $500,000

## Background
NovaBank's current mobile app was built 4 years ago. User engagement has dropped 35% in the last year. Customer complaints focus on:
- Slow navigation
- Outdated UI
- Missing key features compared to competitors
- Poor accessibility

## Objectives
1. Improve user engagement by 40%
2. Reduce support tickets by 25%
3. Launch 3 new features: biometric login, spending insights, bill split
4. Improve App Store rating from 2.8 to 4.5+

## Constraints
- Must maintain legacy backend API compatibility
- Compliance team requires 4-week security review
- Limited design resources (1 designer available 50% time)
- Engineering team is 3 developers, already at capacity

## Key Stakeholders
- Sarah Chen (Product Owner): Budget holder, focused on business metrics
- Marcus Rodriguez (Tech Lead): Concerned about technical debt and timeline
- Priya Sharma (Designer): Advocating for complete redesign, worried about scope

## Success Metrics
- DAU/MAU ratio increase
- Task completion rate
- Time to complete key tasks
- NPS score
- App Store rating`;

export const mockDiscoveryTranscript = `**Initial Discovery Call - March 15, 2025**

Sarah Chen: "We need to move fast. Competitors are eating our lunch. I want this done in 4 months, not 6."

Marcus Rodriguez: "4 months is impossible with our current team. We'd need to cut scope significantly. Also, the legacy API doesn't support biometric auth - we'd need to rebuild that layer."

Priya Sharma: "If we cut scope, we can't deliver the experience users expect. I recommend a phased approach - core refresh now, features later. But I need more design time."

Sarah: "Phased approach means we don't hit the engagement targets this quarter. That's a problem for my stakeholders."

Marcus: "I can maybe free up one dev if we pause the internal dashboard project, but that has its own risks."

Priya: "What if we use a design system to speed things up? I've been researching options."`;

export const mockInternalEmail = `From: Marcus Rodriguez <marcus@novabank.com>
To: Sarah Chen, Priya Sharma
Subject: Technical constraints for mobile refresh

Hi team,

After reviewing the current codebase, I need to flag some technical risks:

1. The legacy API layer doesn't support OAuth 2.0, which biometric login requires. This is a 3-week effort minimum.

2. Our current analytics implementation would need a complete overhaul to support the spending insights feature.

3. We're using an outdated version of React Native. Upgrading alone would take 2 weeks and carries integration risks.

Given these constraints, I recommend we either:
- Extend timeline to 8 months, or
- Reduce scope to just UI refresh + one feature

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
