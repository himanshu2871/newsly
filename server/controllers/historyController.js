const axios = require('axios');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Simple in-memory cache to save API tokens
let cachedHistory = {
  dateString: null,
  content: null
};

// GET /api/history/today
exports.getTodayInHistory = async (req, res) => {
  try {
    const today = new Date();
    const currentDateString = today.toDateString(); // e.g. "Thu Mar 29 2026"

    // Return cached response if we already fetched today
    if (cachedHistory.dateString === currentDateString && cachedHistory.content) {
      return res.json({ events: cachedHistory.content });
    }

    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    // Fetch from Wikipedia On This Day API
    const wikiResponse = await axios.get(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${mm}/${dd}`, {
      headers: {
        'User-Agent': 'NewslyApp/1.0 (Integration for History Summary Feature)'
      }
    });

    const events = wikiResponse.data.events || [];
    // Pass a broad set of events to let Groq pick diverse ones
    const historicContext = events.slice(0, 30).map((e, i) => `[${i + 1}] Year ${e.year}: ${e.text}`).join('\n');

    const prompt = `You are an expert historian. Below are historical events from Wikipedia that happened on this exact calendar day:

${historicContext}

From this list, pick exactly 10 events that are the most diverse — covering different domains such as science, politics, sports, art & culture, war, technology, exploration, economy, nature, medicine, etc. For each selected event, write a concise 1-2 sentence summary as if citing an encyclopedia. Do not use conversational filler.

Respond ONLY in this exact JSON array format (no markdown, no extra text):
[
  { "year": 1234, "topic": "Science", "summary": "..." },
  { "year": 1234, "topic": "Politics", "summary": "..." },
  ...(10 total)
]`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1200,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const raw = completion.choices[0].message.content.trim();

    // Parse JSON from Groq response
    let parsedEvents;
    try {
      parsedEvents = JSON.parse(raw);
    } catch {
      // If Groq wraps in markdown fences, strip them
      const match = raw.match(/\[[\s\S]*\]/);
      parsedEvents = match ? JSON.parse(match[0]) : [];
    }

    // Update cache
    cachedHistory = {
      dateString: currentDateString,
      content: parsedEvents
    };

    res.json({ events: parsedEvents });

  } catch (err) {
    console.error('Groq API error (History):', err.message);
    res.status(500).json({ error: 'Failed to fetch historical events.' });
  }
};
