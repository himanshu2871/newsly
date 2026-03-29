const { addBookmark, getBookmarks, removeBookmark, isBookmarked } = require('../models/bookmarkModel');

// GET /api/bookmarks
exports.getUserBookmarks = async (req, res) => {
  try {
    const bookmarks = await getBookmarks(req.user.id);
    res.json({ bookmarks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};

// POST /api/bookmarks
exports.saveBookmark = async (req, res) => {
  const { article_url, title, description, image_url, source, published_at, ai_summary } = req.body;

  if (!article_url || !title)
    return res.status(400).json({ error: 'article_url and title are required' });

  try {
    // Check if already bookmarked
    const existing = await isBookmarked(req.user.id, article_url);
    if (existing)
      return res.status(409).json({ error: 'Article already bookmarked', id: existing.id });

    const bookmark = await addBookmark(req.user.id, {
      article_url, title, description,
      image_url, source, published_at, ai_summary
    });

    res.status(201).json({ bookmark });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save bookmark' });
  }
};

// DELETE /api/bookmarks/:id
exports.deleteBookmark = async (req, res) => {
  try {
    const deleted = await removeBookmark(req.user.id, req.params.id);
    if (!deleted)
      return res.status(404).json({ error: 'Bookmark not found' });

    res.json({ message: 'Bookmark removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete bookmark' });
  }
};

// GET /api/bookmarks/check?url=...
exports.checkBookmark = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const bookmark = await isBookmarked(req.user.id, url);
    res.json({ isBookmarked: !!bookmark, id: bookmark?.id || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check bookmark' });
  }
};