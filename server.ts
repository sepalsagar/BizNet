import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { generateFallbackResponse } from './src/utils/aiFallback';

dotenv.config();

const PORT = 3000;

// Rate limiter for AI Advisor endpoint: 20 requests per minute per IP
const aiAdvisorLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Max 20 requests per windowMs per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again after a minute.' },
});

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'BizNet API',
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // AI Advisor Endpoint with rate limiting & input boundaries
  app.post('/api/ai/advisor', aiAdvisorLimiter, async (req, res) => {
    const { query, businessContext, history } = req.body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length > 2000) {
      res.status(400).json({ error: 'Query must be 2000 characters or fewer' });
      return;
    }

    const ai = getGenAI();

    // If Gemini is configured, run through Gemini 2.5 Flash
    if (ai) {
      try {
        const systemInstruction = `You are BizNet Copilot, an elite Chief Operating Officer, Financial Strategist, and Supply Chain Expert advising small and growing businesses.
You have real-time access to the company's operational dataset provided below in JSON.
Always cite concrete numbers, percentages, product names, customer segments, and supplier details from this data.
Keep your analysis structured, clear, and actionable. Use markdown formatting with bold metrics, bullet points, and concise section headers.
Avoid vague corporate buzzwords. Focus on cash flow, gross margin %, stockout prevention, and pragmatic operational tactics.

CURRENT BUSINESS TELEMETRY CONTEXT:
${JSON.stringify(businessContext || {}, null, 2)}
`;

        const contents: any[] = [];
        if (history && Array.isArray(history)) {
          for (const msg of history.slice(-6)) {
            if (msg.role === 'user' || msg.role === 'model') {
              contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
              });
            }
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: query }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });

        const text = response.text || 'Unable to generate analysis. Please try again.';

        // Generate tailored follow-up action suggestions
        const actions = [
          'Review low stock products',
          'Simulate 5% margin increase',
          'Optimize reorder schedule',
        ];

        res.json({
          message: text,
          suggestedActions: actions,
          source: 'gemini-2.5-flash',
        });
        return;
      } catch (err: any) {
        console.error('Gemini API call failed, falling back to heuristic engine:', err);
        // Fall through to heuristic response seamlessly
      }
    }

    // Heuristic intelligent fallback engine
    const heuristic = generateFallbackResponse(trimmedQuery, businessContext, history);
    res.json({
      ...heuristic,
      source: 'heuristic_engine',
    });
  });

  // Global error handler for JSON parsing and payload limits
  app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.type === 'entity.too.large' || err.status === 413) {
      res.status(413).json({ error: 'Payload too large: maximum request body is 64kb' });
      return;
    }
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({ error: 'Invalid JSON payload' });
      return;
    }
    next(err);
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BizNet server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
