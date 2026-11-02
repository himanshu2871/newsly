const { groq, model } = require('../config/groq');

// POST /api/summary
exports.summarizeArticle = async (req, res) => {
  const { title, description, content } = req.body;

  if (!title && !description && !content)
    return res.status(400).json({ error: 'At least one of title, description or content is required' });

  try {
    const completion = await groq.chat.completions.create({
      model,
      max_completion_tokens: 800,
      reasoning_effort: 'low',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: `Write a concise news summary using only the supplied information.
Return a JSON object with a "bullets" array containing exactly 3 complete strings:
1. The main event.
2. Its context or cause.
3. Its impact or what happens next.
Keep each bullet to at most 25 words. Do not invent details or repeat information.

Title: ${title || ''}
Description: ${description || ''}
Content: ${content || ''}`
        }
      ]
    });

    const choice = completion.choices[0];
    if (choice?.finish_reason === 'length') {
      throw new Error('Summary generation reached the output limit.');
    }

    const raw = choice?.message?.content?.trim();
    if (!raw) throw new Error('Groq returned an empty summary.');

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      throw new Error('Groq returned an incomplete summary.');
    }

    if (
      !Array.isArray(result.bullets) ||
      result.bullets.length !== 3 ||
      result.bullets.some(bullet => typeof bullet !== 'string' || !bullet.trim())
    ) {
      throw new Error('Groq returned an incomplete summary.');
    }

    const summary = result.bullets.map(bullet => `• ${bullet.trim()}`).join('\n');
    res.json({ summary });
  } catch (err) {
    console.error('Groq API error:', err.message);
    const message = err.message === 'Summary generation reached the output limit.' ||
      err.message === 'Groq returned an incomplete summary.'
      ? 'The AI returned an incomplete summary. Please try again.'
      : 'The AI summary service is temporarily unavailable. Please try again shortly.';
    res.status(502).json({ error: message });
  }
};