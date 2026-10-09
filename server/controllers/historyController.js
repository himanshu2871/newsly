const axios = require('axios');
const { groq, model } = require('../config/groq');

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
    if (!historicContext) {
      throw new Error('Wikipedia returned no historical events for today.');
    }

    const prompt = `You are an expert historian. Below are historical events from Wikipedia that happened on this exact calendar day:

${historicContext}

From this list, pick up to 10 diverse events. Do not invent events or years. For each selected event, include its number as eventIndex and write a concise 1-2 sentence summary as if citing an encyclopedia. Do not use conversational filler.

Return only a valid JSON object with this shape:
{"events":[{"eventIndex":1,"topic":"Science","summary":"..."}]}`;

    const completion = await groq.chat.completions.create({
      model,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('Groq returned no historical summaries.');
    const result = JSON.parse(raw);
    if (!Array.isArray(result.events)) {
      throw new Error('Groq returned historical events in an invalid format.');
    }
    if (result.events.length === 0) {
      throw new Error('Groq returned no historical events.');
    }

    const sourceEvents = events.slice(0, 30);
    const parsedEvents = result.events.map((event) => {
      const eventIndex = Number(event.eventIndex);
      if (!Number.isInteger(eventIndex) || eventIndex < 1 || eventIndex > sourceEvents.length) {
        throw new Error(`Groq returned an invalid event index: ${event.eventIndex}`);
      }
      return {
        year: sourceEvents[eventIndex - 1].year,
        topic: event.topic,
        summary: event.summary,
      };
    });

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
