const { getPreferences, upsertPreferences } = require('../models/preferenceModel');
const TOPICS = require('../config/topics');

// GET /api/preferences
exports.getPreferences = async (req, res) => {
  try {
    let prefs = await getPreferences(req.user.id);

    // If no preferences set yet, return defaults
    if (!prefs) {
      prefs = { topics: [] };
    }

    res.json({ preferences: prefs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
};

// PUT /api/preferences
exports.updatePreferences = async (req, res) => {
  const { topics } = req.body;

  if (!topics || !Array.isArray(topics) || topics.length === 0)
    return res.status(400).json({ error: 'Topics must be a non-empty array' });

  // Validate topics against allowed list
  const allowedTopics = TOPICS.map(t => t.value);
  const invalidTopics = topics.filter(t => !allowedTopics.includes(t));
  if (invalidTopics.length > 0)
    return res.status(400).json({ error: `Invalid topics: ${invalidTopics.join(', ')}` });

  try {
    const prefs = await upsertPreferences(req.user.id, topics);
    res.json({ preferences: prefs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};