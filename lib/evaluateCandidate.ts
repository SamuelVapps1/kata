import { EvaluationResult, DimensionScore } from './types';

export interface CandidateSnapshot {
  id: string;
  updatedAt: string;
  title: string;
  deliverableMarkdown: string;
  workbench: {
    recommendation: string;
    keyAssumptions: string;
    scopeCuts: string;
    risksTradeoffs: string;
  };
  pyramid: {
    headline: string;
    keyArguments: string;
    ask: string;
  };
  conversations?: Record<string, any[]>;
  events?: any[];
}

function createDimensionScore(score: number, evidence: string, rationale: string): DimensionScore {
  return { score, evidence, rationale };
}

function extractEvidence(text: string, keywords: string[]): string {
  const lowerText = text.toLowerCase();
  for (const keyword of keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      const index = lowerText.indexOf(keyword.toLowerCase());
      const start = Math.max(0, index - 20);
      const end = Math.min(text.length, index + keyword.length + 50);
      return text.substring(start, end).trim();
    }
  }
  return 'No direct evidence found in candidate submission.';
}

export function evaluateCandidate(snapshot: CandidateSnapshot): EvaluationResult {
  const { title, deliverableMarkdown, workbench, pyramid } = snapshot;
  const allText = `${title} ${deliverableMarkdown} ${workbench.recommendation} ${workbench.keyAssumptions} ${workbench.scopeCuts} ${workbench.risksTradeoffs} ${pyramid.headline} ${pyramid.keyArguments} ${pyramid.ask}`.toLowerCase();
  
  // Base scores
  let scores: Record<string, number> = {
    zero_to_launch: 2,
    solution_architecture_fluency: 2,
    structured_discovery: 2,
    client_engagement_ownership: 2,
    commercial_discipline: 2,
    ai_native_operating_model: 2,
    t_shaped_range: 2,
    project_order_knowledge_discipline: 2,
    pyramid_communication: 2,
    high_agency: 2,
  };

  // zero_to_launch: evidence of focused workflow/scope cut/MVP
  if (allText.includes('mvp') || allText.includes('scope') || allText.includes('phase') || 
      allText.includes('workflow') || allText.includes('8 weeks') || allText.includes('12 weeks')) {
    scores.zero_to_launch += 1;
  }
  if (workbench.scopeCuts.length > 20 || allText.includes('not building') || allText.includes('defer')) {
    scores.zero_to_launch += 1;
  }
  if (workbench.recommendation.length > 50 && (allText.includes('ship') || allText.includes('launch'))) {
    scores.zero_to_launch += 1;
  }

  // solution_architecture_fluency: technical terms
  const techKeywords = ['retrieval', 'rag', 'ocr', 'eval', 'pipeline', 'api', 'architecture', 'integration', 
                        'database', 'service', 'endpoint', 'model', 'embedding', 'vector', 'index'];
  const techCount = techKeywords.filter(k => allText.includes(k)).length;
  if (techCount >= 1) scores.solution_architecture_fluency += 1;
  if (techCount >= 3) scores.solution_architecture_fluency += 1;
  if (techCount >= 5) scores.solution_architecture_fluency += 1;

  // structured_discovery: questions/unknowns/constraints/stakeholders
  if (allText.includes('?') || allText.includes('question') || allText.includes('unknown') || 
      allText.includes('constraint') || allText.includes('assumption')) {
    scores.structured_discovery += 1;
  }
  if (workbench.keyAssumptions.length > 30) {
    scores.structured_discovery += 1;
  }
  if (deliverableMarkdown.split('\n').length > 10) {
    scores.structured_discovery += 1;
  }

  // client_engagement_ownership: stakeholder mentions
  const stakeholderKeywords = ['ceo', 'board', 'legal', 'stakeholder', 'expectation', 'pushback', 'client', 'sarah', 'marcus', 'priya'];
  const stakeholderCount = stakeholderKeywords.filter(k => allText.includes(k)).length;
  if (stakeholderCount >= 1) scores.client_engagement_ownership += 1;
  if (stakeholderCount >= 3) scores.client_engagement_ownership += 1;
  if (stakeholderCount >= 5) scores.client_engagement_ownership += 1;

  // commercial_discipline: business terms
  const businessKeywords = ['budget', 'fixed-bid', 'roi', 'margin', 'arr', 'business value', 'cost', 'timeline', 'tradeoff', 'revenue'];
  const businessCount = businessKeywords.filter(k => allText.includes(k)).length;
  if (businessCount >= 1) scores.commercial_discipline += 1;
  if (businessCount >= 3) scores.commercial_discipline += 1;
  if (businessCount >= 5) scores.commercial_discipline += 1;

  // ai_native_operating_model: agent/AI references
  const aiKeywords = ['sarah', 'marcus', 'priya', 'agent', 'ai', 'delegation', 'automat', 'copilot'];
  const aiCount = aiKeywords.filter(k => allText.includes(k)).length;
  if (aiCount >= 1) scores.ai_native_operating_model += 1;
  if (aiCount >= 3) scores.ai_native_operating_model += 1;
  if (aiCount >= 5) scores.ai_native_operating_model += 1;

  // t_shaped_range: cross-disciplinary coverage
  const engineeringKeywords = ['api', 'database', 'service', 'architecture', 'technical', 'code', 'deploy'];
  const designKeywords = ['design', 'ux', 'ui', 'user', 'interface', 'workflow', 'experience'];
  const businessKeywords2 = ['business', 'revenue', 'cost', 'roi', 'margin', 'customer', 'market'];
  const deliveryKeywords = ['timeline', 'milestone', 'launch', 'ship', 'sprint', 'deadline'];
  
  const hasEngineering = engineeringKeywords.some(k => allText.includes(k));
  const hasDesign = designKeywords.some(k => allText.includes(k));
  const hasBusiness = businessKeywords2.some(k => allText.includes(k));
  const hasDelivery = deliveryKeywords.some(k => allText.includes(k));
  
  const disciplineCount = [hasEngineering, hasDesign, hasBusiness, hasDelivery].filter(Boolean).length;
  if (disciplineCount >= 2) scores.t_shaped_range += 1;
  if (disciplineCount >= 3) scores.t_shaped_range += 1;
  if (disciplineCount >= 4) scores.t_shaped_range += 1;

  // project_order_knowledge_discipline: structured workbench + headings
  const workbenchFilled = Object.values(workbench).filter(v => v.length > 20).length;
  if (workbenchFilled >= 2) scores.project_order_knowledge_discipline += 1;
  if (workbenchFilled >= 3) scores.project_order_knowledge_discipline += 1;
  if (deliverableMarkdown.includes('##') && deliverableMarkdown.split('##').length > 3) {
    scores.project_order_knowledge_discipline += 1;
  }

  // pyramid_communication: pyramid fields filled
  if (pyramid.headline.length > 10) scores.pyramid_communication += 1;
  if (pyramid.keyArguments.length > 20) scores.pyramid_communication += 1;
  if (pyramid.ask.length > 10) scores.pyramid_communication += 1;

  // high_agency: decisive recommendation + explicit scope cuts
  const decisiveWords = ['should', 'recommend', 'propose', 'build', 'ship', 'focus on'];
  const hasDecisive = decisiveWords.some(w => workbench.recommendation.toLowerCase().includes(w));
  if (hasDecisive) scores.high_agency += 1;
  if (workbench.scopeCuts.length > 30) scores.high_agency += 1;
  if (allText.includes('not include') || allText.includes('out of scope') || allText.includes('defer')) {
    scores.high_agency += 1;
  }

  // Clamp scores 1-5
  Object.keys(scores).forEach(key => {
    scores[key] = Math.max(1, Math.min(5, scores[key]));
  });

  // Calculate overall score (1-5 scale converted to 1-100)
  const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / 10;
  const overallScore = Math.round(avgScore * 20);

  // Generate evidence and rationale for each dimension
  const dimensionScores: EvaluationResult['dimensionScores'] = {
    zero_to_launch: createDimensionScore(
      scores.zero_to_launch,
      extractEvidence(deliverableMarkdown, ['MVP', 'scope', 'phase', 'workflow']),
      scores.zero_to_launch >= 4 
        ? 'Candidate demonstrates strong focus on shipping with clear scope definition and phased approach.'
        : scores.zero_to_launch >= 3 
        ? 'Candidate shows awareness of launch constraints with some scope considerations.'
        : 'Limited evidence of zero-to-launch thinking or scope prioritization.'
    ),
    solution_architecture_fluency: createDimensionScore(
      scores.solution_architecture_fluency,
      extractEvidence(deliverableMarkdown, techKeywords.slice(0, 3)),
      scores.solution_architecture_fluency >= 4 
        ? 'Candidate demonstrates strong technical fluency with multiple architecture concepts discussed.'
        : scores.solution_architecture_fluency >= 3 
        ? 'Candidate shows reasonable technical understanding with relevant architecture mentions.'
        : 'Limited technical architecture discussion or concepts.'
    ),
    structured_discovery: createDimensionScore(
      scores.structured_discovery,
      extractEvidence(workbench.keyAssumptions, ['assumption', 'constraint', 'unknown']),
      scores.structured_discovery >= 4 
        ? 'Candidate demonstrates systematic discovery with clear articulation of assumptions and unknowns.'
        : scores.structured_discovery >= 3 
        ? 'Candidate shows some structured thinking about constraints and assumptions.'
        : 'Limited evidence of structured discovery or explicit assumption articulation.'
    ),
    client_engagement_ownership: createDimensionScore(
      scores.client_engagement_ownership,
      extractEvidence(deliverableMarkdown, ['stakeholder', 'client', 'Sarah', 'board']),
      scores.client_engagement_ownership >= 4 
        ? 'Candidate demonstrates strong stakeholder awareness and client engagement focus.'
        : scores.client_engagement_ownership >= 3 
        ? 'Candidate shows reasonable stakeholder consideration in their approach.'
        : 'Limited evidence of stakeholder management or client engagement thinking.'
    ),
    commercial_discipline: createDimensionScore(
      scores.commercial_discipline,
      extractEvidence(deliverableMarkdown, ['budget', 'ROI', 'cost', 'timeline']),
      scores.commercial_discipline >= 4 
        ? 'Candidate demonstrates strong commercial acumen with clear business value articulation.'
        : scores.commercial_discipline >= 3 
        ? 'Candidate shows some commercial awareness in their recommendations.'
        : 'Limited evidence of commercial discipline or business value consideration.'
    ),
    ai_native_operating_model: createDimensionScore(
      scores.ai_native_operating_model,
      extractEvidence(deliverableMarkdown, ['Sarah', 'Marcus', 'Priya', 'agent', 'AI']),
      scores.ai_native_operating_model >= 4 
        ? 'Candidate demonstrates AI-native thinking with effective use of agent collaboration.'
        : scores.ai_native_operating_model >= 3 
        ? 'Candidate shows some awareness of AI tools and collaboration patterns.'
        : 'Limited evidence of AI-native operating model or agent delegation.'
    ),
    t_shaped_range: createDimensionScore(
      scores.t_shaped_range,
      extractEvidence(deliverableMarkdown, ['engineering', 'design', 'business']),
      scores.t_shaped_range >= 4 
        ? 'Candidate demonstrates strong cross-disciplinary range across engineering, design, business, and delivery.'
        : scores.t_shaped_range >= 3 
        ? 'Candidate shows reasonable breadth across multiple disciplines.'
        : 'Limited evidence of cross-disciplinary thinking or T-shaped range.'
    ),
    project_order_knowledge_discipline: createDimensionScore(
      scores.project_order_knowledge_discipline,
      extractEvidence(deliverableMarkdown, ['##', 'section', 'structure']),
      scores.project_order_knowledge_discipline >= 4 
        ? 'Candidate demonstrates strong project order with well-structured workbench and deliverable organization.'
        : scores.project_order_knowledge_discipline >= 3 
        ? 'Candidate shows reasonable organizational discipline in their work.'
        : 'Limited evidence of structured project order or organizational discipline.'
    ),
    pyramid_communication: createDimensionScore(
      scores.pyramid_communication,
      extractEvidence(pyramid.headline, ['headline', 'ask']),
      scores.pyramid_communication >= 4 
        ? 'Candidate demonstrates strong pyramid communication with clear headline, arguments, and ask.'
        : scores.pyramid_communication >= 3 
        ? 'Candidate shows reasonable structured communication in pyramid format.'
        : 'Limited evidence of pyramid communication or structured messaging.'
    ),
    high_agency: createDimensionScore(
      scores.high_agency,
      extractEvidence(workbench.recommendation, ['recommend', 'should', 'build']),
      scores.high_agency >= 4 
        ? 'Candidate demonstrates high agency with decisive recommendations and explicit scope decisions.'
        : scores.high_agency >= 3 
        ? 'Candidate shows some decisiveness in their recommendations.'
        : 'Limited evidence of high agency or decisive action orientation.'
    ),
  };

  // Generate highlights and red flags
  const highlights: string[] = [];
  const redFlags: string[] = [];

  if (scores.zero_to_launch >= 4) highlights.push('Strong focus on shipping with clear MVP scope definition');
  if (scores.solution_architecture_fluency >= 4) highlights.push('Demonstrates solid technical architecture understanding');
  if (scores.client_engagement_ownership >= 4) highlights.push('Shows strong stakeholder management awareness');
  if (scores.high_agency >= 4) highlights.push('Makes decisive recommendations with explicit tradeoffs');
  if (scores.pyramid_communication >= 4) highlights.push('Communicates with clear pyramid structure');

  if (scores.zero_to_launch <= 2) redFlags.push('Limited focus on launch or scope prioritization');
  if (scores.solution_architecture_fluency <= 2) redFlags.push('Weak technical architecture discussion');
  if (scores.commercial_discipline <= 2) redFlags.push('Limited commercial or business value articulation');
  if (scores.pyramid_communication <= 2) redFlags.push('Unclear or incomplete pyramid communication');
  if (deliverableMarkdown.length < 200) redFlags.push('Deliverable content is minimal or underdeveloped');

  // Ensure at least 3 highlights and 3 red flags
  while (highlights.length < 3) {
    highlights.push('Completed the candidate exercise with structured deliverable');
  }
  while (redFlags.length < 3) {
    redFlags.push('Could strengthen evidence in additional dimensions');
  }

  // Generate summary
  const summary = `Candidate submitted ${title || 'a deliverable'} with ${deliverableMarkdown.length} characters of content. ` +
    `The PM Workbench shows ${workbenchFilled}/4 fields meaningfully filled. ` +
    `Overall performance demonstrates ${avgScore >= 3.5 ? 'strong' : avgScore >= 2.5 ? 'moderate' : 'developing'} PM capabilities ` +
    `with particular strength in ${Object.entries(scores).filter(([k, v]) => v >= 4).map(([k]) => k.replace(/_/g, ' ')).slice(0, 2).join(' and ') || 'several areas'}.`;

  return {
    sessionId: snapshot.id,
    overallScore,
    dimensionScores,
    summary,
    highlights: highlights.slice(0, 3),
    redFlags: redFlags.slice(0, 3),
    finalDeliverable: deliverableMarkdown || 'No deliverable content provided.',
    pyramidSummary: pyramid,
    workbench,
  };
}
