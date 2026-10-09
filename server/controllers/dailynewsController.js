const axios = require('axios');
const { groq, model } = require('../config/groq');

// In-memory cache — refreshes once per day
let cachedBrief = {
  dateString: null,
  content: null
};

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
        country: process.env.NEWS_COUNTRY || 'us',
        pageSize: 20,
        apiKey: process.env.NEWS_API_KEY,
      }
    });

    const articles = (data.articles || [])
      .filter(a => a.title && a.title !== '[Removed]')
      .slice(0, 20);

    if (articles.length === 0) {
      throw new Error('NewsAPI returned no usable headlines.');
    }

    const articleContext = articles.map((a, i) =>
      `[${i + 1}] Title: ${a.title}\nDescription: ${a.description || 'No description provided.'}\nSource: ${a.source?.name || 'Unknown'}`
    ).join('\n\n');

    const prompt = `You are a professional news editor writing today's morning briefing. Below are today's top headlines. The number in brackets is each article's articleIndex:

${articleContext}

Select up to 10 significant and diverse stories from the supplied articles. Do not invent stories or article indices.

For each story, generate:
- A short punchy headline (max 10 words)
- A 2-sentence summary written in a journalistic, engaging style
- A category label (e.g. Technology, Politics, Science, Sports, Business, Health, Entertainment, World)
- An importance level: "Top Story", "Major", or "Notable"

Return only a valid JSON object with this shape:
{"stories":[{"articleIndex":1,"headline":"...","summary":"...","category":"...","importance":"Top Story"}]}`;

    const completion = await groq.chat.completions.create({
      model,
      max_tokens: 1800,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }]
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('Groq returned an empty daily brief.');
    const result = JSON.parse(raw);
    if (!Array.isArray(result.stories)) {
      throw new Error('Groq returned a daily brief without a stories array.');
    }
    if (result.stories.length === 0) {
      throw new Error('Groq returned no stories for the daily brief.');
    }

    const parsed = result.stories.map((item) => {
      const articleIndex = Number(item.articleIndex);
      if (!Number.isInteger(articleIndex) || articleIndex < 1 || articleIndex > articles.length) {
        throw new Error(`Groq returned an invalid article index: ${item.articleIndex}`);
      }
      const article = articles[articleIndex - 1];
      return {
        ...item,
        source: article.source?.name || 'Unknown',
        url: article.url || null,
        image: article.urlToImage || null,
      };
    });

    cachedBrief = { dateString: currentDateString, content: parsed };

    res.json({ brief: parsed, date: currentDateString });

  } catch (err) {
    console.error('Daily Brief error:', err.message);
    res.status(500).json({ error: `Failed to generate daily brief: ${err.message}` });
  }
};
