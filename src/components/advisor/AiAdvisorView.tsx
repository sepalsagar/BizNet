import React, { useState, useRef, useEffect } from 'react';
import Markdown, { Components } from 'react-markdown';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  HelpCircle,
  Lightbulb,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { formatIndianCurrency } from '../../utils/formatters';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  source?: string;
}

const advisorMarkdownComponents: Components = {
  h1: ({ node, ...props }) => (
    <h1 className="text-lg font-bold text-slate-900 mt-3 mb-2 first:mt-0" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="text-base font-bold text-slate-900 mt-3 mb-1.5 first:mt-0" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="text-sm font-bold text-slate-900 mt-2.5 mb-1 first:mt-0" {...props} />
  ),
  h4: ({ node, ...props }) => (
    <h4 className="text-xs font-semibold text-slate-900 mt-1.5 mb-1 first:mt-0" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-semibold text-slate-900" {...props} />
  ),
  em: ({ node, ...props }) => (
    <em className="italic" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="list-disc pl-5 mb-3 space-y-1.5 last:mb-0" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal pl-5 mb-3 space-y-1.5 last:mb-0" {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="leading-relaxed" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-2 border-indigo-500 pl-3 my-2 italic text-slate-600" {...props} />
  ),
  a: ({ node, ...props }) => (
    <a
      className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2 font-medium break-all"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  hr: ({ node, ...props }) => (
    <hr className="my-3 border-slate-200" {...props} />
  ),
  pre: ({ node, children, ...props }) => (
    <pre
      className="p-3 my-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed"
      {...props}
    >
      {React.isValidElement(children) ? React.cloneElement(children as any, { isPre: true }) : children}
    </pre>
  ),
  code: ({ node, className, children, isPre, ...props }: any) => {
    if (isPre) {
      return (
        <code className="font-mono text-slate-100 text-[11px]" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-800 font-mono text-[11px] border border-slate-300/50"
        {...props}
      >
        {children}
      </code>
    );
  },
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto my-2.5">
      <table className="min-w-full text-[11px] border-collapse border border-slate-200 rounded-md overflow-hidden" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => <thead className="bg-slate-100 text-slate-800" {...props} />,
  tbody: ({ node, ...props }) => <tbody className="divide-y divide-slate-200" {...props} />,
  tr: ({ node, ...props }) => <tr className="border-b border-slate-200" {...props} />,
  th: ({ node, ...props }) => <th className="border border-slate-200 px-2.5 py-1.5 font-semibold text-left text-slate-800" {...props} />,
  td: ({ node, ...props }) => <td className="border border-slate-200 px-2.5 py-1.5 text-slate-700" {...props} />,
};

export const AiAdvisorView: React.FC = () => {
  const { 
    products, 
    orders, 
    customers, 
    suppliers, 
    totalRevenue, 
    grossProfit, 
    grossMarginPct, 
    lowStockProducts, 
    outOfStockProducts,
    setActiveTab,
    settings,
    repeatCustomerRate
  } = useBusiness();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: `Hello! I'm your **BizPilot AI Advisor**. I have real-time access to your store telemetry:\n\n• **${products.length} active SKUs** (${lowStockProducts.length} low stock, ${outOfStockProducts.length} out of stock)\n• **${orders.length} completed transactions** with a **${grossMarginPct.toFixed(1)}% gross margin**\n• **${customers.length} customer records** across retail & wholesale\n\nHow can I help you improve cash flow, optimize inventory, or protect margins today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'gemini-2.5-flash',
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      // Build conversation history for multi-turn context
      const history = messages
        .filter(m => m.id !== 'm-1')
        .slice(-6)
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.text,
        }));

      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend.trim(),
          businessContext: {
            companyName: settings.companyName,
            totalRevenue,
            grossProfit,
            grossMarginPct,
            targetMarginPct: settings.targetMarginPct,
            totalProducts: products.length,
            lowStockCount: lowStockProducts.length,
            outOfStockCount: outOfStockProducts.length,
            topLowStock: lowStockProducts.slice(0, 3).map(p => ({ 
              name: p.name, 
              stock: p.stock, 
              reorderPoint: p.reorderPoint,
              id: p.id,
              costPrice: p.costPrice,
              sellingPrice: p.sellingPrice,
              salesCount: p.salesCount,
              supplierName: p.supplierName,
            })),
            products: products.map(p => ({
              id: p.id,
              name: p.name,
              stock: p.stock,
              reorderPoint: p.reorderPoint,
              costPrice: p.costPrice,
              sellingPrice: p.sellingPrice,
              salesCount: p.salesCount,
              supplierName: p.supplierName,
            })),
            recentOrdersCount: orders.length,
            customersCount: customers.length,
            suppliersCount: suppliers.length,
            customerSummary: {
              totalSpent: customers.reduce((sum, customer) => sum + customer.totalSpent, 0),
              repeatCustomerRate,
              vipCount: customers.filter(customer => customer.tier === 'VIP').length,
              wholesaleCount: customers.filter(customer => customer.tier === 'Wholesale').length,
            },
          },
          history,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || typeof data.message !== 'string') {
        throw new Error('Malformed response received from advisor endpoint');
      }

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: data.message,
        suggestedActions: Array.isArray(data.suggestedActions) ? data.suggestedActions : [],
        source: typeof data.source === 'string' ? data.source : 'gemini-2.5-flash',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn('AI Advisor API request failed, utilizing local fallback heuristics:', err);
      // Fallback heuristic reply if network interrupted or Gemini API fails
      const fallbackReply = generateFallbackAdvice(textToSend, {
        lowStockProducts,
        outOfStockProducts,
        grossMarginPct,
        targetMarginPct: settings.targetMarginPct,
      });

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: fallbackReply,
        suggestedActions: [
          'Review low stock products',
          'Open Pricing Simulator',
          'Optimize discount promotions'
        ],
        source: 'heuristic_engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackAdvice = (prompt: string, ctx: any): string => {
    const p = prompt.toLowerCase();
    if (p.includes('reorder') || p.includes('stock') || p.includes('inventory')) {
      const items = ctx.lowStockProducts.concat(ctx.outOfStockProducts).slice(0, 4);
      return `### Inventory Reorder Plan\n\nYou currently have **${ctx.outOfStockProducts.length} items out of stock** and **${ctx.lowStockProducts.length} low stock items**.\n\n**Immediate Actions:**\n${items.map((i: any) => `- **${i.name}** (Current Stock: ${i.stock}, Reorder Pt: ${i.reorderPoint}): Reorder +25 units from ${i.supplierName}`).join('\n')}\n\n*Tip: Go to the Inventory tab to execute one-click reorders directly.*`;
    }
    if (p.includes('margin') || p.includes('profit')) {
      return `### Margin Enhancement Strategy\n\nYour current blended gross margin is **${ctx.grossMarginPct.toFixed(1)}%** compared to your company target of **${ctx.targetMarginPct}%**.\n\n**Key Recommendations:**\n1. **Price Adjustment**: Test a +5% to +8% price increase on inelastic items in our Pricing Simulator.\n2. **Supplier Terms**: Leverage your volume with top suppliers to negotiate a 3–5% discount on COGS.\n3. **Prune Low-Margin Promos**: Restrict discounts to items with margins above 50% to prevent profit bleed.`;
    }
    return `### Strategic Business Assessment\n\nBased on your **${formatIndianCurrency(totalRevenue)}** in sales volume and **${grossMarginPct.toFixed(1)}% gross margin**, your business is operating healthily. Ensure inventory lead times are monitored so stockouts do not choke order growth.\n\nTry testing our **Pricing Simulator** or **Discount Optimizer** to model your next promotional campaign.`;
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const samplePrompts = [
    "Identify urgent inventory reorder priorities",
    "How can we raise our gross margin to 60%?",
    "Evaluate customer retention and repeat purchase rate",
    "Which sales channel delivers the highest profit margin?"
  ];

  return (
    <div className="space-y-8" id="bizpilot-advisor-view">
      {/* Advisor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                Business Intelligence
              </span>
              <span className="text-xs text-slate-500">Context-aware operational advisor</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans mt-1">AI Assistant</h1>
            <p className="text-sm text-slate-500 mt-0.5">Ask questions about inventory, cash flow, pricing, and orders.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pricing')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-2xs"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            <span>Open Pricing Simulator</span>
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col h-[600px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/30">
          {messages.map((m) => {
            const isAssistant = m.sender === 'assistant';
            return (
              <div 
                key={m.id}
                className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
              >
                {isAssistant && (
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}

                <div className={`max-w-2xl rounded-xl px-4 py-3 text-xs leading-relaxed ${
                  isAssistant 
                    ? 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                    : 'bg-slate-900 text-white'
                }`}>
                  {isAssistant ? (
                    <div className="markdown-body font-sans text-xs">
                      <Markdown components={advisorMarkdownComponents}>
                        {m.text}
                      </Markdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap font-sans">
                      {m.text}
                    </div>
                  )}

                  {/* Suggested follow-up actions if provided by server */}
                  {isAssistant && m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-slate-400">Actions:</span>
                      {m.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          type="button"
                          disabled={loading}
                          onClick={() => handleSend(act)}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-[10px] font-medium text-slate-700 shadow-2xs transition-colors"
                        >
                          → {act}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <div className={`mt-2 flex items-center justify-between text-[10px] ${
                    isAssistant ? 'text-slate-400' : 'text-indigo-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span>{m.timestamp}</span>
                      {isAssistant && m.source && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-medium border border-slate-200">
                          {m.source === 'gemini-2.5-flash' ? 'Gemini 2.5' : m.source === 'heuristic_engine' ? 'Heuristic' : 'Offline'}
                        </span>
                      )}
                    </div>
                    {isAssistant && (
                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        className="hover:text-slate-600 p-0.5 transition-colors"
                        title="Copy text"
                      >
                        {copiedId === m.id ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {!isAssistant && (
                  <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-400">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 animate-spin" />
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span>Analyzing store telemetry and generating recommendations...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2.5 bg-white border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
            <Lightbulb className="h-3 w-3" /> Suggested:
          </span>
          {samplePrompts.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 text-[11px] whitespace-nowrap transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200/80 bg-white">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask BizPilot AI anything about your inventory, cash flow, pricing, or orders..."
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-xs focus:border-indigo-500 focus:outline-hidden bg-slate-50/50 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium disabled:opacity-50 transition-colors shadow-2xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Ask Copilot</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
