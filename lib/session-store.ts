import { Session } from './schema';

const sessions = new Map<string, Session>();

export function createSession(candidateId: string): Session {
  const session: Session = {
    id: Math.random().toString(36).substring(2, 15),
    createdAt: new Date().toISOString(),
    candidateId,
    events: [],
    conversations: {
      sarah: { messages: [] },
      marcus: { messages: [] },
      priya: { messages: [] },
    },
    deliverableTitle: '',
    deliverableMarkdown: '',
    pyramidSummary: null,
    evaluationReport: null,
  };
  
  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function updateSession(id: string, updates: Partial<Session>): Session | null {
  const session = sessions.get(id);
  if (!session) return null;
  
  const updated = { ...session, ...updates };
  sessions.set(id, updated);
  return updated;
}

export function addEvent(sessionId: string, event: { type: string; payload: unknown }): void {
  const session = sessions.get(sessionId);
  if (!session) return;
  
  session.events.push({
    ts: new Date().toISOString(),
    type: event.type,
    payload: event.payload,
  });
}
