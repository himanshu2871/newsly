const { groq, model } = require('../config/groq');

// POST /api/summary
exports.summarizeArticle = async (req, res) => {
  const { title, description, content } = req.body;

  if (!title && !description && !content)
    return res.status(400).json({ error: 'At least one of title, description or content is required' });

  try {
    const completion = await groq.chat.completions.create({
      model,
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `Summarize this news article in exactly 3 bullet points.
Each bullet point MUST cover a completely different aspect of the article:
- Bullet 1: What happened (the main event/fact)
- Bullet 2: How or why it happened (context, reason, or key details)
- Bullet 3: What's the impact or what happens next (outcome, reaction, or future implications)

Be concise, factual and easy to understand.
Do not repeat the same information across bullet points.
Do not include any intro text, just the 3 bullet points starting with "•".

Title: ${title || ''}
Description: ${description || ''}
Content: ${content || ''}`
        }
      ]
    });

    const summary = completion.choices[0]?.message?.content?.trim();
    if (!summary) throw new Error('Groq returned an empty summary.');
    res.json({ summary });
  } catch (err) {
    console.error('Groq API error:', err.message);
    res.status(500).json({ error: 'Summary generation failed' });
  }
};