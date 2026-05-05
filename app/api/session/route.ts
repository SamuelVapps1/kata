import { NextRequest, NextResponse } from 'next/server';
import { createSession, getSession, updateSession } from '@/lib/session-store';
import { Session, PyramidSummary } from '@/lib/schema';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const session = getSession(id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidateId } = body as { candidateId?: string };

    const newSession = createSession(candidateId || 'anonymous');
    return NextResponse.json(newSession);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, deliverableTitle, deliverableMarkdown, pyramidSummary } = body as {
      id: string;
      deliverableTitle?: string;
      deliverableMarkdown?: string;
      pyramidSummary?: PyramidSummary;
    };

    if (!id) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const updates: Partial<Session> = {};
    if (deliverableTitle !== undefined) updates.deliverableTitle = deliverableTitle;
    if (deliverableMarkdown !== undefined) updates.deliverableMarkdown = deliverableMarkdown;
    if (pyramidSummary !== undefined) updates.pyramidSummary = pyramidSummary;

    const updated = updateSession(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
