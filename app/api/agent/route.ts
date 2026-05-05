import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AGENT_MODEL } from '@/lib/schema';
import { getSession, addEvent } from '@/lib/session-store';
import { AGENT_PROMPTS } from '@/lib/prompts';
import { Message } from '@/lib/schema';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

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

    // Try to get AI response, fall back to demo message on failure or no API key
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

        response = msg.content[0].type === 'text' ? msg.content[0].text : "Set up your secrets in the full version of this app. This is a demo.";

        addEvent(sessionId, {
          type: 'agent_message_received',
          payload: { agent, responseLength: response.length },
        });
      } catch (aiError) {
        console.error('Anthropic error, using demo message:', aiError);
        addEvent(sessionId, {
          type: 'agent_error',
          payload: { agent, error: String(aiError) },
        });
        response = "Set up your secrets in the full version of this app. This is a demo.";
      }
    } else {
      response = "Set up your secrets in the full version of this app. This is a demo.";
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
        content: "Set up your secrets in the full version of this app. This is a demo.",
      },
    });
  }
}
