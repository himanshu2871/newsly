const pool = require('../config/db');

const getPreferences = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM preferences WHERE user_id = $1',
    [userId]
  );
  return result.rows[0];
};

const upsertPreferences = async (userId, topics) => {
  const result = await pool.query(
    `INSERT INTO preferences (user_id, topics)
     VALUES ($1, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET topics = $2
     RETURNING *`,
    [userId, topics]
  );
  return result.rows[0];
};

module.exports = { getPreferences, upsertPreferences };