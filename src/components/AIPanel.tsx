import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function AIPanel() {
  const app = useApp();
  const { ai } = app;
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hi! I am your AI advisor. How can I help you improve your metrics today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;
    
    setInput('');
    setIsOpen(true);
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsTyping(true);

    if (!ai.isReady && ai.status.backend !== 'none') {
      await ai.initialize();
    }

    try {
      if (ai.session) {
        // Build rich context
        const context = `
          Context:
          Startup Idea: ${app.idea}
          Industry: ${app.industry}
          Stage: ${app.stage}
          Founder: ${app.founder}
          Product: ${app.productDescription}
          Target Customer: ${app.targetCustomer}
          
          Financials:
          ARR: $${(app.revenue * 12).toLocaleString()}
          Burn: $${app.burn.toLocaleString()} / mo
          Gross Margin: ${app.grossMargin}%
          NDR: ${app.ndr}%
          Cash: $${app.capital.toLocaleString()}
          Target Raise: $${app.targetRaise.toLocaleString()}
          
          Metrics:
          Runway: ${app.derived.runwayMonths} months
          Burn Multiple: ${app.derived.burnMultiple}x
          Rule of 40: ${app.derived.ruleOf40}%
          LTV/CAC: ${(app.derived.ltv / app.cac).toFixed(2)}x
          
          Instructions:
          Be a senior venture capital advisor. Be concise. Use markdown.
          If the user's metrics are poor, be direct but constructive.
          
          Question: ${text}
        `;

        if (ai.session.backend === 'chrome' && ai.session.promptStreaming) {
          setMessages(prev => [...prev, { role: 'ai', content: '' }]);
          await ai.session.promptStreaming(context, (partial) => {
            setMessages(prev => {
              const newMsgs = [...prev];
              newMsgs[newMsgs.length - 1] = { role: 'ai', content: partial };
              return newMsgs;
            });
          });
        } else {
          const reply = await ai.session.prompt(context);
          const finalReply = reply || "AI running in offline mode: Review your burn rate ($"+app.burn.toLocaleString()+") and ensure your LTV/CAC remains above 3.0x.";
          setMessages(prev => [...prev, { role: 'ai', content: finalReply }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: "AI is currently running in template mode. Review your dashboards for dynamic metrics." }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'ai', content: `Sorry, an error occurred: ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  }, [ai, isTyping, app]);

  useEffect(() => {
    const fn = (e: any) => {
      setIsOpen(true);
      if (e.detail?.prompt) {
        handleSend(e.detail.prompt);
      }
    };
    window.addEventListener('open-ai-panel', fn);
    return () => window.removeEventListener('open-ai-panel', fn);
  }, [handleSend]);

  const renderMarkdownText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      let html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (html.startsWith('- ')) {
        return <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: html.substring(2) }} />;
      }
      return <p key={i} className="mb-2 last:mb-0 min-h-[1em]" dangerouslySetInnerHTML={{ __html: html }} />;
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[200] flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--accent)] text-white font-bold shadow-glow hover:shadow-[0_0_25px_var(--accent-glow)] transition-all card-hover hover:-translate-y-1"
      >
        <Sparkles size={18} /> Ask AI
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-48px)] h-[550px] max-h-[70vh] bg-[var(--bg-glass)] backdrop-blur-md border border-[var(--border)] rounded-2xl shadow-elevated z-[200] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--border)] flex justify-between items-center bg-[rgba(255,255,255,0.02)]">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[var(--accent-light)]" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">VenturePilot AI</h3>
                <span className="px-2 py-0.5 rounded-full bg-[var(--green-dim)] text-[var(--green)] text-[10px] font-bold uppercase whitespace-nowrap">
                  {ai.status.modelName || 'Connecting'}
                </span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-[rgba(255,255,255,0.1)] rounded-lg text-[var(--text-muted)] transition-colors">
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Loading Bar */}
            {ai.status.loading && ai.status.backend === 'webllm' && (
              <div className="px-4 py-2 bg-[rgba(30,64,175,0.1)] border-b border-[rgba(30,64,175,0.3)]">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="text-[var(--text-secondary)] font-medium">Downloading AI model...</span>
                  <span className="text-[var(--accent-light)] font-bold">{ai.status.progress}%</span>
                </div>
                <div className="w-full h-1 bg-[var(--bg-card)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-light)] transition-all duration-300" style={{ width: `${ai.status.progress}%` }} />
                </div>
              </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed relative ${
                    msg.role === 'user' 
                      ? 'bg-[var(--accent)] text-white rounded-br-sm' 
                      : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[var(--text-primary)] rounded-bl-sm'
                  }`}>
                    {msg.role === 'ai' ? renderMarkdownText(msg.content) : msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl p-3 px-4 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[var(--text-primary)] rounded-bl-sm flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-[var(--border)] bg-[rgba(0,0,0,0.1)]">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="flex items-center gap-2 relative"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for strategic advice..."
                  className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-full px-4 py-2.5 text-[13px] focus:outline-none focus:border-[var(--border-accent)] pr-10"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1 text-[var(--accent-light)] p-2 hover:bg-[rgba(255,255,255,0.05)] rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </form>
              <p className="text-[9px] text-center text-[var(--text-muted)] font-medium mt-2">
                Powered by {ai.status.backend === 'chrome' ? 'Chrome AI' : 'WebLLM'} · Runs locally, never leaves device
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
