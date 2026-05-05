export type AgentPersona = 'sarah' | 'marcus' | 'priya';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AgentChat {
  persona: AgentPersona;
  messages: Message[];
}

export interface Session {
  id: string;
  createdAt: number;
  status: 'in_progress' | 'submitted';
  title: string;
  markdown: string;
  agentChats: Record<AgentPersona, Message[]>;
  pyramidSummary?: {
    headline: string;
    keyArguments: string;
    ask: string;
  };
}

export interface EvaluationResult {
  sessionId: string;
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
  pyramidSummary: {
    headline: string;
    keyArguments: string;
    ask: string;
  };
}

export const AGENT_MODEL = "claude-sonnet-4-6";
export const EVALUATOR_MODEL = "claude-opus-4-7";
