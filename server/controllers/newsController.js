const axios = require('axios');
const TOPICS = require('../config/topics');

const fetchNews = async (params) => {
    const {data} = await axios.get('https://newsapi.org/v2/everything',{
        params: {
            ...params,
            apiKey: process.env.NEWS_API_KEY,
            language: 'en',
            pageSize: 20,
        }
    });
    return data;
};

// GET /api/news?topic=technology&page=1
exports.getNewsByTopic = async (req,res) => {
    const { topic = 'technology', page = 1} = req.query;
    try {
        const data = await fetchNews({
            q: topic,
            sortBy: 'publishedAt',
            page,
        });
        res.json({ articles: data.articles, total: data.totalResults});
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetchnews'});
    }
};

// GET /api/news/latest
exports.getLatestNews = async (req, res) => {
  try {
    const { data } = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        language: 'en',
        pageSize: 20,
        apiKey: process.env.NEWS_API_KEY,
      }
    });
    res.json({ articles: data.articles });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch latest news' });
  }
};

// GET /api/news/search?q=keyword
exports.searchNews = async (req, res) => {
  const { q, page = 1 } = req.query;
  if (!q) return res.status(400).json({ error: 'Search query is required' });
  try {
    const data = await fetchNews({
      q,
      sortBy: 'relevancy',
      page,
    });
    res.json({ articles: data.articles, total: data.totalResults });
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
};

// GET /api/news/india
exports.getIndiaNews = async (req, res) => {
  const { page = 1 } = req.query;
  try {
    const data = await fetchNews({
      q: 'India',
      sortBy: 'publishedAt',
      page,
    });
    res.json({ articles: data.articles, total: data.totalResults });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch India news' });
  }
};

// GET /api/news/topics
exports.getTopics = async (req, res) => {
  res.json({ topics: TOPICS });
};