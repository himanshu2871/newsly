const pool = require('../config/db');

const addBookmark = async (userId, article) => {
  const { article_url, title, description, image_url, source, published_at, ai_summary } = article;
  const result = await pool.query(
    `INSERT INTO bookmarks (user_id, article_url, title, description, image_url, source, published_at, ai_summary)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (user_id, article_url) DO NOTHING
     RETURNING *`,
    [userId, article_url, title, description, image_url, source, published_at, ai_summary]
  );
  return result.rows[0];
};

const getBookmarks = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM bookmarks WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

const removeBookmark = async (userId, bookmarkId) => {
  const result = await pool.query(
    'DELETE FROM bookmarks WHERE id = $1 AND user_id = $2 RETURNING *',
    [bookmarkId, userId]
  );
  return result.rows[0];
};

const isBookmarked = async (userId, articleUrl) => {
  const result = await pool.query(
    'SELECT id FROM bookmarks WHERE user_id = $1 AND article_url = $2',
    [userId, articleUrl]
  );
  return result.rows[0] || null;
};

module.exports = { addBookmark, getBookmarks, removeBookmark, isBookmarked };