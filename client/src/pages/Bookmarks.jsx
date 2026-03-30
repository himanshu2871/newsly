import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getBookmarks, deleteBookmark, summarizeArticle } from '../services/api';
import { Bookmark, Inbox, Sparkles, EyeOff, Loader2, ExternalLink, Trash2, Home, ArrowLeft } from 'lucide-react';

const Bookmarks = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState({});
  const [summaryLoading, setSummaryLoading] = useState({});
  const [showSummary, setShowSummary] = useState({});

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await getBookmarks();
      setBookmarks(res.data.bookmarks || []);
    } catch {
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBookmark(id);
      setBookmarks(prev => prev.filter(b => b.id !== id));
    } catch {
      alert('Failed to remove bookmark');
    }
  };

  const handleSummary = async (bookmark) => {
    if (summaries[bookmark.id]) {
      setShowSummary(prev => ({ ...prev, [bookmark.id]: !prev[bookmark.id] }));
      return;
    }
    if (bookmark.ai_summary) {
      setSummaries(prev => ({ ...prev, [bookmark.id]: bookmark.ai_summary }));
      setShowSummary(prev => ({ ...prev, [bookmark.id]: true }));
      return;
    }
    setSummaryLoading(prev => ({ ...prev, [bookmark.id]: true }));
    try {
      const res = await summarizeArticle({
        title: bookmark.title,
        description: bookmark.description,
      });
      setSummaries(prev => ({ ...prev, [bookmark.id]: res.data.summary }));
      setShowSummary(prev => ({ ...prev, [bookmark.id]: true }));
    } catch {
      setSummaries(prev => ({ ...prev, [bookmark.id]: 'Failed to generate summary.' }));
    } finally {
      setSummaryLoading(prev => ({ ...prev, [bookmark.id]: false }));
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto pb-8">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto pb-8">

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-1">Library</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2"><Bookmark size={28} className="text-blue-500" /> Bookmarks</h1>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm"
        >
          <ArrowLeft size={16} /> Home
        </Link>
      </div>


      {bookmarks.length === 0 ? (
        <div className="text-center py-20 bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-3xl border border-white/50 dark:border-gray-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <Inbox size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 text-md font-medium mb-2">
            No bookmarks yet
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            Save articles from the home feed to read them later
          </p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <motion.div
                key={bookmark.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-300"
              >
                {/* Top section — image + content side by side */}
                <div className="flex gap-4 p-5 pb-3">
                  {/* Image */}
                  {bookmark.image_url && (
                    <img
                      src={bookmark.image_url}
                      alt={bookmark.title}
                      className="w-28 h-24 object-cover rounded-xl flex-shrink-0"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {bookmark.source && (
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300 bg-white/60 dark:bg-blue-900/40 backdrop-blur-md border border-white/40 dark:border-blue-800/50 px-2.5 py-1 rounded-full shadow-sm">
                            {bookmark.source}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          Saved {formatDate(bookmark.created_at)}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-gray-900 dark:text-white font-semibold text-sm leading-snug mb-1 line-clamp-2">
                      {bookmark.title}
                    </h3>

                    {bookmark.description && (
                      <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2">
                        {bookmark.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* AI Summary */}
                <AnimatePresence>
                  {showSummary[bookmark.id] && summaries[bookmark.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-5 pb-3"
                    >
                      <div className="p-3 bg-white/40 dark:bg-black/20 backdrop-blur-lg border border-white/40 dark:border-white/5 rounded-xl shadow-inner">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                          <Sparkles size={12} /> AI Summary
                        </p>
                        {summaries[bookmark.id].split('\n').filter(Boolean).map((b, i) => (
                          <p key={i} className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                            {b}
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions — full width at the bottom */}
                <div className="grid grid-cols-3 border-t border-white/30 dark:border-white/5">
                  <button
                    onClick={() => handleSummary(bookmark)}
                    disabled={summaryLoading[bookmark.id]}
                    className="text-xs py-3 text-blue-600 dark:text-blue-400 hover:bg-white/40 dark:hover:bg-gray-800/40 disabled:opacity-50 font-medium transition border-r border-white/30 dark:border-white/5"
                  >
                    {summaryLoading[bookmark.id]
                      ? <><Loader2 size={13} className="inline animate-spin mr-1" />Loading...</>
                      : showSummary[bookmark.id]
                        ? <><EyeOff size={13} className="inline mr-1" />Hide</>
                        : <><Sparkles size={13} className="inline mr-1" />Summary</>}
                  </button>

                  <a
                    href={bookmark.article_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs py-3 text-center text-gray-600 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-gray-800/40 transition border-r border-white/30 dark:border-white/5"
                  >
                    <ExternalLink size={13} className="inline mr-1" />Read
                  </a>

                  <button
                    onClick={() => handleDelete(bookmark.id)}
                    className="text-xs py-3 text-red-500 hover:bg-white/40 dark:hover:bg-red-900/20 transition"
                  >
                    <Trash2 size={13} className="inline mr-1" />Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Bookmarks;