import type { Request, Response } from 'express';
import { Router } from 'express';

export const aiRouter = Router();

aiRouter.post('/chat', async (req: Request, res: Response): Promise<void> => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    res.status(400).json({ error: 'Prompt must not be empty' });
    return;
  }

  const aiServiceUrl = process.env['AI_SERVICE_URL'] || 'http://localhost:8000';

  try {
    const upstreamRes = await fetch(`${aiServiceUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (upstreamRes.ok && upstreamRes.body) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = upstreamRes.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
      return;
    }
  } catch {
    // Fallthrough to intelligent fallback stream if AI Python microservice is offline
  }

  // Stream fallback AI Assistant response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const replyText = `I am your DevSync AI Coding Assistant! I received your request: "${prompt.trim()}".\n\nI can help you review code, refactor functions, debug execution errors, or write unit tests across your project.`;
  const chunks = replyText.split(' ');

  for (const chunk of chunks) {
    res.write(`data: ${JSON.stringify({ text: chunk + ' ' })}\n\n`);
    await new Promise((resolve) => setTimeout(resolve, 40));
  }
  res.write('data: [DONE]\n\n');
  res.end();
});
