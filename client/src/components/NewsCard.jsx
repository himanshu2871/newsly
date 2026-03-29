import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { summarizeArticle, saveBookmark, deleteBookmark, checkBookmark } from '../services/api';

const NewsCard = ({ article }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  // Check bookmark status from DB on mount
  useEffect(() => {
    if (!user || !article.url) return;
    checkBookmark(article.url)
      .then(res => {
        setBookmarked(res.data.isBookmarked);
        setBookmarkId(res.data.id);
      })
      .catch(() => {});
  }, [user, article.url]);

  const handleSummary = async () => {
    if (summary) {
      setShowSummary(!showSummary);
      return;
    }
    setSummaryLoading(true);
    try {
      const res = await summarizeArticle({
        title: article.title,
        description: article.description,
        content: article.content,
      });
      setSummary(res.data.summary);
      setShowSummary(true);
    } catch {
      setSummary('Failed to generate summary. Please try again.');
      setShowSummary(true);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) return alert('Please login to bookmark articles');
    try {
      if (bookmarked && bookmarkId) {
        await deleteBookmark(bookmarkId);
        setBookmarked(false);
        setBookmarkId(null);
      } else {
        const res = await saveBookmark({
          article_url: article.url,
          title: article.title,
          description: article.description,
          image_url: article.urlToImage,
          source: article.source?.name,
          published_at: article.publishedAt,
          ai_summary: summary || null,
        });
        setBookmarked(true);
        setBookmarkId(res.data.bookmark?.id);
      }
    } catch {
      alert('Failed to update bookmark');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const bullets = summary
    .split('\n')
    .map(b => b.replace(/^[\s\-*•▪◦‑–—]+/, '').trim())
    .filter(b => b);

  if (!article.title || article.title === '[Removed]') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 dark:border-gray-700/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      {article.urlToImage && (
        <img
          src={article.urlToImage}
          alt={article.title}
          className="w-full h-48 object-cover"
          onError={(e) => e.target.style.display = 'none'}
        />
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Source + Date */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300 bg-white/60 dark:bg-blue-900/40 backdrop-blur-md border border-white/40 dark:border-blue-800/50 px-2.5 py-1 rounded-full shadow-sm">
            {article.source?.name || 'Unknown'}
          </span>
          <span className="text-xs text-gray-400">
            {formatDate(article.publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm leading-snug mb-2 flex-1">
          {article.title}
        </h3>

        {/* Description */}
        {article.description && (
          <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed line-clamp-3 mb-4">
            {article.description}
          </p>
        )}

        {/* AI Summary */}
        {showSummary && summary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 bg-white/40 dark:bg-black/20 backdrop-blur-lg border border-white/40 dark:border-white/5 rounded-xl shadow-inner"
          >
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
              ✨ AI Summary
            </p>
            <ul className="space-y-2 mt-2">
              {bullets.map((b, i) => {
                const textColors = [
                  'text-indigo-700 dark:text-indigo-300',
                  'text-emerald-700 dark:text-emerald-300',
                  'text-rose-700 dark:text-rose-300'
                ];
                const dotColors = [
                  'bg-indigo-500 dark:bg-indigo-400',
                  'bg-emerald-500 dark:bg-emerald-400',
                  'bg-rose-500 dark:bg-rose-400'
                ];
                return (
                  <li key={i} className="flex gap-2 items-start">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${dotColors[i % dotColors.length]}`} />
                    <span className={`text-xs leading-relaxed font-medium ${textColors[i % textColors.length]}`}>
                      {b}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto">
          <button
            onClick={handleSummary}
            disabled={summaryLoading}
            className="flex-1 text-xs py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition"
          >
            {summaryLoading ? '⏳ Summarizing...' : showSummary ? '🙈 Hide Summary' : '✨ AI Summary'}
          </button>

          <button
            onClick={handleBookmark}
            className={`p-2 rounded-xl border transition ${
              bookmarked
                ? 'bg-yellow-50/80 dark:bg-yellow-900/30 backdrop-blur-md border border-yellow-300 dark:border-yellow-700/50 text-yellow-500 shadow-sm'
                : 'bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 text-gray-500 hover:text-yellow-500 shadow-sm'
            }`}
          >
            {bookmarked ? '🔖' : '📑'}
          </button>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 text-gray-500 hover:text-blue-600 transition shadow-sm"
          >
            🔗
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default NewsCard;