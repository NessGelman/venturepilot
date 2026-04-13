import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, ChevronDown, Copy, Check, Trash2, StopCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateSystemPrompt, ChatMessage } from '../utils/ai';

interface DisplayMessage {
  role: 'user' | 'ai';
  content: string;
}

// Map hash routes to readable page names for context-aware system prompt
const PAGE_NAMES: Record<string, string> = {
  '/': 'Dashboard',
  '/strategy': 'Strategy',
  '/pitch': 'Pitch Deck',
  '/plan': 'Business Plan',
  '/bench': 'Market Benchmarks',
  '/investors': 'Investor CRM',
  '/valuation': 'Valuation',
  '/update': 'Investor Update',
};

function getSuggestedPrompts(derived: any, state: any): string[] {
  const runway = derived?.runwayMonths ?? 0;
  const ltvCac = derived?.ltv > 0 && state?.cac > 0 ? derived.ltv / state.cac : 0;
  const burnMultiple = derived?.burnMultiple ?? 0;
  const growth = state?.growth ?? 0;
  const mrr = state?.revenue ?? 0;

  // Survival mode — runway < 6 months
  if (runway > 0 && runway < 6) return [
    'How do I extend runway immediately?',
    'What should I cut first to reduce burn?',
    'Should I raise a bridge round or focus on revenue?',
    'What\'s my fastest path to default alive?',
  ];

  // Bad unit economics
  if (ltvCac > 0 && ltvCac < 1.5) return [
    'Why is my LTV:CAC so low and how do I fix it?',
    'How do I increase average contract value?',
    'Should I raise prices or cut CAC first?',
    'Am I ready to fundraise with these unit economics?',
  ];

  // High burn multiple
  if (burnMultiple > 3 && mrr > 0) return [
    `My burn multiple is ${burnMultiple.toFixed(1)}× — how do I fix this?`,
    'Where should I cut to improve capital efficiency?',
    'What do VCs think of a burn multiple this high?',
    'How do I grow faster without increasing burn?',
  ];

  // Slow growth
  if (growth < 5 && mrr > 0) return [
    'How do I reignite growth from this baseline?',
    'What growth channels make sense at my stage?',
    'Is my churn killing my growth?',
    'What should I focus on to hit 10% MoM?',
  ];

  // Healthy / fundraise-ready
  if (runway >= 12 && ltvCac >= 3) return [
    'Am I ready to raise a Series A?',
    'How should I position my metrics to VCs?',
    'What valuation range should I target?',
    'What questions will investors ask me?',
  ];

  // Default
  return [
    'How should I think about my runway?',
    'Am I ready to raise?',
    'How do I improve my LTV:CAC?',
    'What should my pitch focus on?',
  ];
}

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^[-•→]\s/.test(line)) {
      const items: JSX.Element[] = [];
      while (i < lines.length && /^[-•→]\s/.test(lines[i])) {
        const html = lines[i].slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        items.push(<li key={i} dangerouslySetInnerHTML={{ __html: html }} />);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="ml-4 list-disc space-y-0.5 mb-2">{items}</ul>);
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: JSX.Element[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const html = lines[i].replace(/^\d+\.\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        items.push(<li key={i} dangerouslySetInnerHTML={{ __html: html }} />);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="ml-4 list-decimal space-y-0.5 mb-2">{items}</ol>);
      continue;
    }

    if (line.trim() === '') { i++; continue; }

    const html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    elements.push(<p key={i} className="mb-1.5 last:mb-0 min-h-[1em]" dangerouslySetInnerHTML={{ __html: html }} />);
    i++;
  }

  return elements;
}

export default function AIPanel() {
  const app = useApp();
  const { ai, addToast } = app;
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const conversationHistoryRef = useRef<ChatMessage[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [hasFirstChunk, setHasFirstChunk] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [displayMessages, isStreaming, scrollToBottom]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const currentPage = PAGE_NAMES[location.pathname] ?? '';

  const copyMessage = useCallback((content: string, idx: number) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
      addToast('Copied!', 'success');
    });
  }, [addToast]);

  const clearChat = useCallback(() => {
    setDisplayMessages([]);
    conversationHistoryRef.current = [];
  }, []);

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userText = text.trim();
    setInput('');
    setIsOpen(true);

    setDisplayMessages(prev => [...prev, { role: 'user', content: userText }]);
    conversationHistoryRef.current = [
      ...conversationHistoryRef.current,
      { role: 'user', content: userText },
    ];

    setIsStreaming(true);
    setHasFirstChunk(false);

    if (!ai.isReady) await ai.initialize();
    const session = ai.getSession();

    if (!session || session.backend === 'none') {
      setDisplayMessages(prev => [...prev, {
        role: 'ai',
        content: 'AI is unavailable — check your internet connection and try again.',
      }]);
      setIsStreaming(false);
      return;
    }

    const systemPrompt = generateSystemPrompt(app.state, app.derived, currentPage);
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistoryRef.current,
    ];

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (session.chatStreaming) {
        setDisplayMessages(prev => [...prev, { role: 'ai', content: '' }]);
        let finalContent = '';

        await session.chatStreaming(messages, (partial) => {
          finalContent = partial;
          setHasFirstChunk(true);
          setDisplayMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'ai', content: partial };
            return updated;
          });
        }, controller.signal);

        if (finalContent) {
          conversationHistoryRef.current = [
            ...conversationHistoryRef.current,
            { role: 'assistant', content: finalContent },
          ];
        }
      } else {
        const reply = await session.chat(messages, controller.signal);
        const content = reply || "I didn't get a response — try again.";
        setDisplayMessages(prev => [...prev, { role: 'ai', content }]);
        conversationHistoryRef.current = [
          ...conversationHistoryRef.current,
          { role: 'assistant', content },
        ];
      }
    } catch (err: any) {
      const isAbort = err?.name === 'AbortError';
      setDisplayMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === 'ai' && last.content === '') {
          // Replace the empty placeholder
          updated[updated.length - 1] = {
            role: 'ai',
            content: isAbort ? '_(response stopped)_' : `Error: ${err.message || 'Something went wrong'}`,
          };
        } else if (!isAbort) {
          updated.push({ role: 'ai', content: `Error: ${err.message || 'Something went wrong'}` });
        }
        return updated;
      });
      if (!isAbort) {
        // Remove failed user turn from history
        conversationHistoryRef.current = conversationHistoryRef.current.slice(0, -1);
      }
    } finally {
      setIsStreaming(false);
      setHasFirstChunk(false);
      abortControllerRef.current = null;
    }
  }, [ai, isStreaming, app.state, app.derived, currentPage]);

  useEffect(() => {
    const fn = (e: any) => {
      setIsOpen(true);
      if (e.detail?.prompt) handleSend(e.detail.prompt);
    };
    window.addEventListener('open-ai-panel', fn);
    return () => window.removeEventListener('open-ai-panel', fn);
  }, [handleSend]);

  // Abort in-flight request when panel unmounts
  useEffect(() => {
    return () => { abortControllerRef.current?.abort(); };
  }, []);

  const showTypingDots = isStreaming && !hasFirstChunk;
  const isEmpty = displayMessages.length === 0;
  const suggestedPrompts = getSuggestedPrompts(app.derived, app.state);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close AI advisor' : 'Open AI advisor'}
        aria-expanded={isOpen}
        className="fixed bottom-6 right-6 z-[200] flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--accent)] text-white font-bold shadow-glow hover:shadow-[0_0_25px_var(--accent-glow)] transition-all card-hover hover:-translate-y-1"
      >
        <Sparkles size={18} aria-hidden="true" />
        Ask AI
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-48px)] h-[560px] max-h-[75vh] bg-[var(--bg-glass)] backdrop-blur-md border border-[var(--border)] rounded-2xl shadow-elevated z-[200] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--border)] flex justify-between items-center bg-[rgba(255,255,255,0.02)] shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles size={15} className="text-[var(--accent-light)] shrink-0" />
                <h3 className="font-bold text-sm text-[var(--text-primary)] truncate">VenturePilot AI</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap shrink-0 ${
                  ai.status.ready
                    ? 'bg-[var(--green-dim)] text-[var(--green)]'
                    : ai.status.loading
                    ? 'bg-[rgba(59,130,246,0.15)] text-[rgba(59,130,246,0.9)]'
                    : 'bg-[rgba(255,255,255,0.06)] text-[var(--text-muted)]'
                }`}>
                  {ai.status.loading ? 'Connecting…' : (ai.status.modelName || 'Offline')}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!isEmpty && (
                  <button
                    onClick={clearChat}
                    aria-label="Clear conversation"
                    title="Clear chat"
                    className="p-1.5 hover:bg-[rgba(255,255,255,0.08)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close AI advisor"
                  className="p-1.5 hover:bg-[rgba(255,255,255,0.08)] rounded-lg text-[var(--text-muted)] transition-colors"
                >
                  <ChevronDown size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">

              {/* Empty state — metric-aware suggested prompts */}
              {isEmpty && (
                <div className="flex flex-col gap-3 h-full justify-center">
                  <div className="text-center mb-1">
                    <Sparkles size={28} className="text-[var(--accent-light)] mx-auto mb-2 opacity-70" />
                    <p className="text-[var(--text-primary)] font-semibold text-sm">Your AI advisor is ready</p>
                    <p className="text-[var(--text-muted)] text-xs mt-1">
                      {currentPage ? `Advising on ${currentPage}` : 'Ask anything about your startup'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleSend(prompt)}
                        disabled={isStreaming}
                        className="text-left px-3 py-2 rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.07)] hover:border-[var(--border-accent)] text-[12px] text-[var(--text-secondary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {displayMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed relative group ${
                    msg.role === 'user'
                      ? 'bg-[var(--accent)] text-white rounded-br-sm'
                      : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[var(--text-primary)] rounded-bl-sm'
                  }`}>
                    {msg.role === 'ai' ? renderMarkdown(msg.content) : msg.content}
                    {msg.content && (
                      <button
                        onClick={() => copyMessage(msg.content, idx)}
                        className={`absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full border shadow-sm transition-all sm:opacity-0 sm:group-hover:opacity-100 ${
                          msg.role === 'user'
                            ? 'bg-[var(--accent)] border-[rgba(255,255,255,0.3)] text-white'
                            : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)]'
                        }`}
                        aria-label="Copy message"
                      >
                        {copiedIdx === idx ? <Check size={10} style={{ color: 'var(--green)' }} /> : <Copy size={10} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing dots — only before first chunk */}
              {showTypingDots && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-bl-sm flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[var(--border)] bg-[rgba(0,0,0,0.1)] shrink-0">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="flex items-center gap-2 relative"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isStreaming ? 'Waiting for response…' : 'Ask your advisor…'}
                  disabled={isStreaming}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-full px-4 py-2.5 text-[13px] focus:outline-none focus:border-[var(--border-accent)] pr-10 disabled:opacity-60"
                />
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={stopStreaming}
                    aria-label="Stop response"
                    className="absolute right-1 text-[rgba(239,68,68,0.8)] p-2 hover:bg-[rgba(255,255,255,0.05)] rounded-full transition-colors"
                  >
                    <StopCircle size={15} aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    aria-label="Send message"
                    className="absolute right-1 text-[var(--accent-light)] p-2 hover:bg-[rgba(255,255,255,0.05)] rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                  >
                    <Send size={15} aria-hidden="true" />
                  </button>
                )}
              </form>
              <p className="text-[9px] text-center text-[var(--text-muted)] font-medium mt-1.5">
                {ai.status.backend === 'chrome'
                  ? 'Powered by Gemini Nano · Runs locally'
                  : 'Powered by Pollinations AI · Free · No account needed'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
