import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import http from 'http';
import { rateLimit } from 'express-rate-limit';
import { generateFallbackResponse } from '../utils/aiFallback';

function createServerInstance(maxRequests = 20) {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  const testLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: maxRequests,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again after a minute.' },
  });

  app.post('/api/ai/advisor', testLimiter, (req, res) => {
    const { query, businessContext } = req.body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length > 2000) {
      res.status(400).json({ error: 'Query must be 2000 characters or fewer' });
      return;
    }

    const heuristic = generateFallbackResponse(trimmedQuery, businessContext);
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

  return app;
}

describe('AI Advisor API Contract & Security Validations', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = createServerInstance(20);
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address() as any;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('rejects requests with missing, empty, or non-string query with HTTP 400', async () => {
    // Missing query
    const res1 = await fetch(`${baseUrl}/api/ai/advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessContext: {} }),
    });
    const body1 = await res1.json();
    expect(res1.status).toBe(400);
    expect(body1.error).toBe('Query is required');

    // Empty query string
    const res2 = await fetch(`${baseUrl}/api/ai/advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '', businessContext: {} }),
    });
    const body2 = await res2.json();
    expect(res2.status).toBe(400);
    expect(body2.error).toBe('Query is required');

    // Whitespace-only query string
    const res3 = await fetch(`${baseUrl}/api/ai/advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '   \n\t  ', businessContext: {} }),
    });
    const body3 = await res3.json();
    expect(res3.status).toBe(400);
    expect(body3.error).toBe('Query is required');

    // Non-string query (e.g. number)
    const res4 = await fetch(`${baseUrl}/api/ai/advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 12345, businessContext: {} }),
    });
    const body4 = await res4.json();
    expect(res4.status).toBe(400);
    expect(body4.error).toBe('Query is required');
  });

  it('accepts query of exactly 2000 characters and rejects query of 2001 characters', async () => {
    // 2000 characters query -> accepted
    const query2000 = 'a'.repeat(2000);
    const resValid = await fetch(`${baseUrl}/api/ai/advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query2000, businessContext: {} }),
    });
    const bodyValid = await resValid.json();
    expect(resValid.status).toBe(200);
    expect(bodyValid.source).toBe('heuristic_engine');

    // 2001 characters query -> rejected with 400
    const query2001 = 'a'.repeat(2001);
    const resInvalid = await fetch(`${baseUrl}/api/ai/advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query2001, businessContext: {} }),
    });
    const bodyInvalid = await resInvalid.json();
    expect(resInvalid.status).toBe(400);
    expect(bodyInvalid.error).toBe('Query must be 2000 characters or fewer');
  });

  it('enforces 64kb payload limit via express.json configuration', async () => {
    // Create a payload larger than 64kb (~70kb string)
    const largeString = 'x'.repeat(70 * 1024);

    const res = await fetch(`${baseUrl}/api/ai/advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'test', data: largeString }),
    });

    // Express body-parser with limit: '64kb' returns HTTP 413
    expect(res.status).toBe(413);
  });

  it('rate limits requests exceeding maximum allowed threshold and returns HTTP 429', async () => {
    // Isolated server with max 3 requests for fast testing
    const limitedApp = createServerInstance(3);
    const limitedServer = http.createServer(limitedApp);
    let limitedUrl = '';

    await new Promise<void>((resolve) => {
      limitedServer.listen(0, '127.0.0.1', () => {
        const addr = limitedServer.address() as any;
        limitedUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });

    try {
      // 1st request -> success
      const res1 = await fetch(`${limitedUrl}/api/ai/advisor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'Check stock' }),
      });
      expect(res1.status).toBe(200);

      // 2nd request -> success
      const res2 = await fetch(`${limitedUrl}/api/ai/advisor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'Check margin' }),
      });
      expect(res2.status).toBe(200);

      // 3rd request -> success
      const res3 = await fetch(`${limitedUrl}/api/ai/advisor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'Check discounts' }),
      });
      expect(res3.status).toBe(200);

      // 4th request -> exceeds limit -> HTTP 429
      const res4 = await fetch(`${limitedUrl}/api/ai/advisor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'Excess request' }),
      });
      const body4 = await res4.json();
      expect(res4.status).toBe(429);
      expect(body4.error).toContain('Too many requests');
    } finally {
      await new Promise<void>((resolve) => limitedServer.close(() => resolve()));
    }
  });

  it('accepts valid query with telemetry context and returns structured response', async () => {
    const context = {
      totalRevenue: 24500,
      grossMarginPct: 61.2,
      lowStockCount: 3,
      outOfStockCount: 0,
    };

    const res = await fetch(`${baseUrl}/api/ai/advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'What is our current inventory stockout risk?',
        businessContext: context,
        history: [],
      }),
    });

    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.source).toBe('heuristic_engine');
    expect(body.message).toContain('Inventory Priorities');
    expect(body.message).toContain('3 product(s) at or below their reorder points');
    expect(Array.isArray(body.suggestedActions)).toBe(true);
    expect(body.suggestedActions.length).toBeGreaterThan(0);
  });

  it('returns appropriate guidance for margin and profit queries', async () => {
    const context = {
      totalRevenue: 50000,
      grossMarginPct: 48.5,
    };

    const res = await fetch(`${baseUrl}/api/ai/advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'How can we improve our profit margin and pricing?',
        businessContext: context,
      }),
    });

    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.message).toContain('Product Margin Leaders');
    expect(body.message).toContain('48.5%');
  });
});
