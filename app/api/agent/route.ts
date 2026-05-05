import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AGENT_MODEL } from '@/lib/schema';
import { getSession, addEvent } from '@/lib/session-store';
import { AGENT_PROMPTS } from '@/lib/prompts';
import { Message } from '@/lib/schema';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MOCK_RESPONSES: Record<string, string> = {
  sarah: "I understand the timeline pressure, but we need to be realistic about what we can deliver. Have you considered which features would have the biggest impact on our engagement metrics? I'm particularly interested in the spending insights feature - do you think we can deliver that within the constraints?",
  marcus: "From a technical perspective, I'm concerned about the legacy API compatibility requirement. The current architecture wasn't built for the features you're proposing. We might need to consider a phased migration approach. What's your take on the technical trade-offs here?",
  priya: "I'm excited about the design possibilities, but I'm worried about delivering a cohesive experience with limited design resources. Have you thought about how we can maintain design consistency while moving quickly? Perhaps we could leverage an existing design system to accelerate our work?"
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, agent, message } = body as {
      sessionId: string;
      agent: 'sarah' | 'marcus' | 'priya';
      message: string;
    };

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Add user message to conversation
    const userMessage: Message = {
      role: 'user',
      content: message,
    };
    session.conversations[agent].messages.push(userMessage);

    addEvent(sessionId, {
      type: 'user_message_sent',
      payload: { agent, message },
    });

    let response: string;

    // Try to get AI response, fall back to mock on failure
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const systemPrompt = AGENT_PROMPTS[agent];
        const chatHistory = session.conversations[agent].messages.map(m => ({
          role: m.role,
          content: m.content,
        }));

        addEvent(sessionId, {
          type: 'agent_message_sent',
          payload: { agent, messageCount: chatHistory.length },
        });

        const msg = await anthropic.messages.create({
          model: AGENT_MODEL,
          max_tokens: 500,
          system: systemPrompt,
          messages: chatHistory,
        });

        response = msg.content[0].type === 'text' ? msg.content[0].text : MOCK_RESPONSES[agent];

        addEvent(sessionId, {
          type: 'agent_message_received',
          payload: { agent, responseLength: response.length },
        });
      } catch (aiError) {
        console.error('Anthropic error, using fallback:', aiError);
        addEvent(sessionId, {
          type: 'agent_error',
          payload: { agent, error: String(aiError) },
        });
        response = MOCK_RESPONSES[agent];
      }
    } else {
      response = MOCK_RESPONSES[agent];
    }

    // Add assistant response to conversation
    const assistantMessage: Message = {
      role: 'assistant',
      content: response,
    };
    session.conversations[agent].messages.push(assistantMessage);

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('Error in agent route:', error);
    return NextResponse.json({
      message: {
        role: 'assistant',
        content: "I apologize, but I'm having trouble responding right now. Let's continue our conversation.",
      },
    });
  }
}
