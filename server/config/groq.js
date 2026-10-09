const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const model = 'openai/gpt-oss-120b';

module.exports = { groq, model };
