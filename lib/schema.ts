export interface Event {
  ts: string;
  type: string;
  payload: unknown;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  messages: Message[];
}

export interface PyramidSummary {
  headline: string;
  keyArguments: string;
  ask: string;
}

export interface EvaluationReport {
  overallScore: number;
  dimensionScores: {
    problemDefinition: number;
    stakeholderManagement: number;
    analyticalThinking: number;
    communication: number;
    prioritization: number;
    technicalUnderstanding: number;
    designSensitivity: number;
    dataDriven: number;
    executionFocus: number;
    leadership: number;
  };
  summary: string;
  highlights: string[];
  redFlags: string[];
  finalDeliverable: string;
  pyramidSummary: PyramidSummary;
}

export interface Session {
  id: string;
  createdAt: string;
  candidateId: string;
  events: Event[];
  conversations: {
    sarah: Conversation;
    marcus: Conversation;
    priya: Conversation;
  };
  deliverableTitle: string;
  deliverableMarkdown: string;
  pyramidSummary: PyramidSummary | null;
  evaluationReport: EvaluationReport | null;
}

export const AGENT_MODEL = "claude-sonnet-4-6";
export const EVALUATOR_MODEL = "claude-opus-4-7";
