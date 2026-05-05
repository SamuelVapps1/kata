'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { mockBrief, mockDiscoveryTranscript, mockInternalEmail } from '@/lib/mock-data';
import { Message as ApiMessage, Session } from '@/lib/schema';

type LeftTab = 'brief' | 'discovery' | 'email';
type AgentPersona = 'sarah' | 'marcus' | 'priya';
type RightTab = AgentPersona;
type UIMessage = ApiMessage & { id: string; timestamp: number };

function toUIMessage(message: ApiMessage, index: number): UIMessage {
  return {
    ...message,
    id: `${message.role}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
  };
}

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [leftTab, setLeftTab] = useState<LeftTab>('brief');
  const [rightTab, setRightTab] = useState<RightTab>('sarah');
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [messages, setMessages] = useState<Record<AgentPersona, UIMessage[]>>({
    sarah: [], marcus: [], priya: []
  });
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showPyramid, setShowPyramid] = useState(false);
  const [pyramidData, setPyramidData] = useState({ headline: '', keyArguments: '', ask: '' });
  const [lastSnapshot, setLastSnapshot] = useState<string>('');
  const [pmWorkbench, setPmWorkbench] = useState({
    recommendation: '',
    keyAssumptions: '',
    scopeCuts: '',
    risksTradeoffs: ''
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (title || markdown) {
        saveSession();
        // Log editor snapshot
        console.log('[Editor Snapshot]', {
          timestamp: Date.now(),
          titleLength: title.length,
          markdownLength: markdown.length,
          preview: markdown.substring(0, 100)
        });
        setLastSnapshot(markdown);
      }
    }, 2000);
    return () => clearTimeout(saveTimer);
  }, [title, markdown]);

  const loadSession = async () => {
    try {
      const response = await fetch(`/api/session?id=${sessionId}`);
      if (response.ok) {
        const session = await response.json();
        const typedSession = session as Session;
        setTitle(typedSession.deliverableTitle || '');
        setMarkdown(typedSession.deliverableMarkdown || '');
        setMessages({
          sarah: typedSession.conversations.sarah.messages.map(toUIMessage),
          marcus: typedSession.conversations.marcus.messages.map(toUIMessage),
          priya: typedSession.conversations.priya.messages.map(toUIMessage),
        });
      } else {
        // Create new session if not found
        const createResponse = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create' })
        });
        if (createResponse.ok) {
          const newSession = await createResponse.json();
          router.replace(`/session/${newSession.id}`);
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const saveSession = async () => {
    setSaving(true);
    try {
      await fetch('/api/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sessionId,
          deliverableTitle: title,
          deliverableMarkdown: markdown,
        })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save session:', error);
    } finally {
      setSaving(false);
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || sending) return;
    
    setSending(true);
    const userMessage: UIMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: chatInput,
      timestamp: Date.now()
    };
    
    setMessages(prev => ({
      ...prev,
      [rightTab]: [...prev[rightTab], userMessage]
    }));
    setChatInput('');

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, agent: rightTab, message: chatInput })
      });
      const data = await response.json();
      const assistantMessage = toUIMessage(data.message as ApiMessage, messages[rightTab].length);
      setMessages(prev => ({
        ...prev,
        [rightTab]: [...prev[rightTab], assistantMessage]
      }));
    } catch (error) {
      console.error('Failed to send message:', error);
      // Fallback response
      const fallback: UIMessage = {
        id: 'fallback',
        role: 'assistant',
        content: 'I understand your point. Could you elaborate on how this approach addresses the constraints we discussed?',
        timestamp: Date.now()
      };
      setMessages(prev => ({
        ...prev,
        [rightTab]: [...prev[rightTab], fallback]
      }));
    } finally {
      setSending(false);
    }
  };

  const handleLeftTabChange = (tab: LeftTab) => {
    console.log('[Tab Switch]', {
      panel: 'left',
      from: leftTab,
      to: tab,
      timestamp: Date.now()
    });
    setLeftTab(tab);
  };

  const handleRightTabChange = (tab: RightTab) => {
    console.log('[Tab Switch]', {
      panel: 'right',
      from: rightTab,
      to: tab,
      timestamp: Date.now()
    });
    setRightTab(tab);
  };

  const handleSubmit = () => {
    setShowPyramid(true);
  };

  const submitFinal = async () => {
    try {
      await fetch('/api/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sessionId,
          deliverableTitle: title,
          deliverableMarkdown: markdown,
          pyramidSummary: pyramidData,
        })
      });
    } catch (error) {
      console.error('Failed to submit session data:', error);
      // Continue anyway - report page will use fallback data
    }
    // Always redirect to report page, even if save fails
    router.push(`/report/${sessionId}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const insertRecommendationTemplate = () => {
    const template = `\n## Recommendation\nShip one workflow in 8 weeks: contract Q&A over LegalCo's own corpus.\n\n## Why this scope\n- It supports the board demo.\n- It validates the "deep on your contracts" positioning.\n- It avoids redlining/drafting complexity before retrieval quality is proven.\n`;
    setMarkdown(prev => prev + template);
  };

  const insertRiskTemplate = () => {
    const template = `\n## Risks and tradeoffs\n| Risk | Impact | Mitigation |\n|---|---|---|\n| Poor OCR quality | Retrieval answers may be unreliable | Start with curated design-partner corpus |\n| Scope creep | Demo breaks under real usage | Cut to one workflow |\n| No eval harness | Cannot trust answers | Build basic eval set in week 1 |\n`;
    setMarkdown(prev => prev + template);
  };

  const insertPyramidTemplate = () => {
    const template = `\n## Pyramid summary\nHeadline: Build a focused contract Q&A copilot for the board demo, not a generic legal AI suite.\n\nKey arguments:\n1. One workflow gives LegalCo a credible demo in 8 weeks.\n2. Retrieval quality is the core technical risk.\n3. Design partners need proof on their own contracts, not feature breadth.\n\nAsk:\nApprove a focused MVP scope: contract Q&A first, redlining/drafting later.\n`;
    setMarkdown(prev => prev + template);
  };

  const getLeftContent = () => {
    switch (leftTab) {
      case 'brief':
        return <ReactMarkdown className="prose max-w-none">{mockBrief}</ReactMarkdown>;
      case 'discovery':
        return <div className="whitespace-pre-wrap font-mono text-sm">{mockDiscoveryTranscript}</div>;
      case 'email':
        return <div className="whitespace-pre-wrap font-mono text-sm">{mockInternalEmail}</div>;
    }
  };

  const agentNames = {
    sarah: 'Sarah - Client',
    marcus: 'Marcus - Engineer',
    priya: 'Priya - Designer'
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">PM Kata</h1>
        <div className="flex items-center gap-6">
          <div className={`font-mono text-lg tracking-wide ${timeLeft < 300 ? 'text-red-400' : 'text-zinc-300'}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-zinc-500">
            {saving ? 'Saving...' : saved ? 'Saved' : ''}
          </div>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-zinc-100 text-zinc-900 rounded hover:bg-zinc-200 font-medium text-sm transition-colors"
          >
            Submit
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - 28% */}
        <div className="w-[28%] bg-zinc-900 border-r border-zinc-800 flex flex-col">
          <div className="flex border-b border-zinc-800">
            {(['brief', 'discovery', 'email'] as LeftTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => handleLeftTabChange(tab)}
                className={`flex-1 px-4 py-3 text-xs font-medium capitalize tracking-wide ${
                  leftTab === tab 
                    ? 'text-zinc-100 border-b-2 border-zinc-100 bg-zinc-800' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-auto p-5">
            <div className="prose prose-invert prose-sm max-w-none">
              {getLeftContent()}
            </div>
          </div>
        </div>

        {/* Center Panel - 44% */}
        <div className="w-[44%] flex flex-col bg-zinc-950">
          <div className="bg-zinc-900 border-b border-zinc-800 p-5">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your solution title..."
              className="w-full text-lg font-medium bg-transparent border-0 focus:outline-none focus:ring-0 text-zinc-100 placeholder-zinc-600"
            />
          </div>
          
          {/* PM Workbench */}
          <div className="bg-zinc-900 border-b border-zinc-800 p-4">
            <div className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wider">PM Workbench</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <textarea
                  value={pmWorkbench.recommendation}
                  onChange={(e) => setPmWorkbench({...pmWorkbench, recommendation: e.target.value})}
                  placeholder="What should LegalCo actually build in 8 weeks?"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent resize-none h-16"
                />
              </div>
              <div>
                <textarea
                  value={pmWorkbench.keyAssumptions}
                  onChange={(e) => setPmWorkbench({...pmWorkbench, keyAssumptions: e.target.value})}
                  placeholder="What assumptions are you making about users, data, scope, or timeline?"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent resize-none h-16"
                />
              </div>
              <div>
                <textarea
                  value={pmWorkbench.scopeCuts}
                  onChange={(e) => setPmWorkbench({...pmWorkbench, scopeCuts: e.target.value})}
                  placeholder="What are you explicitly NOT building in v1?"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent resize-none h-16"
                />
              </div>
              <div>
                <textarea
                  value={pmWorkbench.risksTradeoffs}
                  onChange={(e) => setPmWorkbench({...pmWorkbench, risksTradeoffs: e.target.value})}
                  placeholder="What could break the plan, and how would you mitigate it?"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent resize-none h-16"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={insertRecommendationTemplate}
                className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
              >
                Insert recommendation template
              </button>
              <button
                onClick={insertRiskTemplate}
                className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
              >
                Insert risk/tradeoff template
              </button>
              <button
                onClick={insertPyramidTemplate}
                className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
              >
                Insert pyramid summary draft
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex border-b border-zinc-800 bg-zinc-900">
              <button
                onClick={() => setShowPreview(false)}
                className={`px-5 py-3 text-xs font-medium tracking-wide ${
                  !showPreview 
                    ? 'text-zinc-100 border-b-2 border-zinc-100' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className={`px-5 py-3 text-xs font-medium tracking-wide ${
                  showPreview 
                    ? 'text-zinc-100 border-b-2 border-zinc-100' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Preview
              </button>
            </div>
            <div className="flex-1 overflow-auto p-5 bg-zinc-950">
              {showPreview ? (
                <div className="prose prose-invert prose-zinc max-w-none">
                  <ReactMarkdown>{markdown}</ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="Write your solution in markdown..."
                  className="w-full h-full bg-transparent border-0 focus:outline-none resize-none font-mono text-sm text-zinc-300 placeholder-zinc-600"
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - 28% */}
        <div className="w-[28%] bg-zinc-900 border-l border-zinc-800 flex flex-col">
          <div className="flex border-b border-zinc-800">
            {(['sarah', 'marcus', 'priya'] as RightTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => handleRightTabChange(tab)}
                className={`flex-1 px-2 py-3 text-xs font-medium capitalize tracking-wide ${
                  rightTab === tab 
                    ? 'text-zinc-100 border-b-2 border-zinc-100 bg-zinc-800' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
              {agentNames[rightTab]}
            </div>
            <div className="space-y-3">
              {messages[rightTab].map(msg => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-zinc-800 ml-6 border border-zinc-700' 
                      : 'bg-zinc-800 mr-6 border border-zinc-700'
                  }`}
                >
                  <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">
                    {msg.role === 'user' ? 'You' : agentNames[rightTab]}
                  </div>
                  <div className="text-sm text-zinc-200 leading-relaxed">{msg.content}</div>
                </div>
              ))}
              {sending && (
                <div className="p-3 rounded-lg bg-zinc-800 mr-6 border border-zinc-700">
                  <div className="text-sm text-zinc-500">Typing...</div>
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-zinc-800 p-4 bg-zinc-900">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent"
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={sending || !chatInput.trim()}
                className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-lg hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-500 font-medium text-sm transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pyramid Modal */}
      {showPyramid && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl">
            <h2 className="text-xl font-semibold mb-4 text-zinc-100 tracking-tight">Pyramid Summary</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-300">Headline</label>
                <input
                  type="text"
                  value={pyramidData.headline}
                  onChange={(e) => setPyramidData({...pyramidData, headline: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent"
                  placeholder="One-sentence headline"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-300">Key Arguments</label>
                <textarea
                  value={pyramidData.keyArguments}
                  onChange={(e) => setPyramidData({...pyramidData, keyArguments: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 h-24 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent resize-none"
                  placeholder="3-4 key arguments"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-300">Ask</label>
                <textarea
                  value={pyramidData.ask}
                  onChange={(e) => setPyramidData({...pyramidData, ask: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 h-20 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent resize-none"
                  placeholder="What are you asking for?"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPyramid(false)}
                className="px-5 py-2.5 border border-zinc-700 rounded-lg hover:bg-zinc-800 text-zinc-300 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitFinal}
                className="px-5 py-2.5 bg-zinc-100 text-zinc-900 rounded-lg hover:bg-zinc-200 font-medium text-sm transition-colors"
              >
                Submit & View Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
