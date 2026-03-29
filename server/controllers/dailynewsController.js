const axios = require('axios');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// In-memory cache — refreshes once per day
let cachedBrief = {
  dateString: null,
  content: null
};

const BRIEF_TOPICS = ['technology', 'politics', 'science', 'sports', 'business', 'health', 'entertainment', 'world'];

// GET /api/dailynews/brief
exports.getDailyBrief = async (req, res) => {
  try {
    const today = new Date();
    const currentDateString = today.toDateString();

    if (cachedBrief.dateString === currentDateString && cachedBrief.content) {
      return res.json({ brief: cachedBrief.content, date: currentDateString });
    }

    // Fetch top headlines from NewsAPI
    const { data } = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        language: 'en',
        pageSize: 20,
        apiKey: process.env.NEWS_API_KEY,
      }
    });

    const articles = (data.articles || [])
      .filter(a => a.title && a.description && a.title !== '[Removed]')
      .slice(0, 20);

    const articleContext = articles.map((a, i) =>
      `[${i + 1}] Title: ${a.title}\nDescription: ${a.description || ''}\nSource: ${a.source?.name || 'Unknown'}`
    ).join('\n\n');

    const prompt = `You are a professional news editor writing today's morning briefing. Below are today's top headlines:

${articleContext}

From these articles, select the 10 most significant and diverse stories (cover different topics: technology, politics, science, sports, business, health, world affairs, etc.).

For each story, generate:
- A short punchy headline (max 10 words)
- A 2-sentence summary written in a journalistic, engaging style
- A category label (e.g. Technology, Politics, Science, Sports, Business, Health, Entertainment, World)
- An importance level: "Top Story", "Major", or "Notable"

Respond ONLY in this exact JSON array format (no markdown, no extra text):
[
  {
    "headline": "...",
    "summary": "...",
    "category": "...",
    "importance": "Top Story",
    "source": "..."
  }
]`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1800,
      messages: [{ role: 'user', content: prompt }]
    });

    const raw = completion.choices[0].message.content.trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\[[\s\S]*\]/);
      parsed = match ? JSON.parse(match[0]) : [];
    }

    // Enrich with original article URLs for linking
    parsed = parsed.map((item, i) => ({
      ...item,
      url: articles[i]?.url || null,
      image: articles[i]?.urlToImage || null,
    }));

    cachedBrief = { dateString: currentDateString, content: parsed };

    res.json({ brief: parsed, date: currentDateString });

  } catch (err) {
    console.error('Daily Brief error:', err.message);
    res.status(500).json({ error: 'Failed to generate daily brief.' });
  }
};
