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

export interface DimensionScore {
  score: number;
  evidence: string;
  rationale: string;
}

export interface EvaluationReport {
  overallScore: number;
  dimensionScores: {
    zero_to_launch: DimensionScore;
    solution_architecture_fluency: DimensionScore;
    structured_discovery: DimensionScore;
    client_engagement_ownership: DimensionScore;
    commercial_discipline: DimensionScore;
    ai_native_operating_model: DimensionScore;
    t_shaped_range: DimensionScore;
    project_order_knowledge_discipline: DimensionScore;
    pyramid_communication: DimensionScore;
    high_agency: DimensionScore;
  };
  summary: string;
  highlights: string[];
  redFlags: string[];
  finalDeliverable: string;
  pyramidSummary: PyramidSummary;
  workbench?: {
    recommendation: string;
    keyAssumptions: string;
    scopeCuts: string;
    risksTradeoffs: string;
  };
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
