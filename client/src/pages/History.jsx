import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getTodayInHistory } from '../services/api';

const TOPIC_ICONS = {
  'Science': '🔬',
  'Politics': '🏛️',
  'Sports': '⚽',
  'Art & Culture': '🎨',
  'War & Conflict': '⚔️',
  'Technology': '💻',
  'Exploration': '🧭',
  'Economy': '💰',
  'Nature': '🌿',
};

const TOPIC_COLORS = {
  'Science':       'from-cyan-500/20 to-blue-500/10 border-cyan-400/30 dark:border-cyan-600/30',
  'Politics':      'from-purple-500/20 to-indigo-500/10 border-purple-400/30 dark:border-purple-600/30',
  'Sports':        'from-green-500/20 to-emerald-500/10 border-green-400/30 dark:border-green-600/30',
  'Art & Culture': 'from-pink-500/20 to-rose-500/10 border-pink-400/30 dark:border-pink-600/30',
  'War & Conflict':'from-red-500/20 to-orange-500/10 border-red-400/30 dark:border-red-600/30',
  'Technology':    'from-blue-500/20 to-violet-500/10 border-blue-400/30 dark:border-blue-600/30',
};

const getTopicStyle = (topic) =>
  TOPIC_COLORS[topic] || 'from-gray-500/20 to-slate-500/10 border-gray-400/30 dark:border-gray-600/30';

const getTopicIcon = (topic) =>
  TOPIC_ICONS[topic] || '📜';

const SkeletonCard = () => (
  <div className="rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-white/50 dark:border-gray-700/40 p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-9 h-9 bg-gray-300 dark:bg-gray-700 rounded-full" />
      <div className="space-y-1.5 flex-1">
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
    </div>
  </div>
);

const History = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  useEffect(() => {
    getTodayInHistory()
      .then(res => setEvents(res.data.events || []))
      .catch(() => setError('Could not load historical events. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-1">Today in History</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
          {dateLabel}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
          Significant events that shaped history on this day.
        </p>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-4xl mb-3">😕</p>
          <p>{error}</p>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
          : events.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`rounded-2xl bg-gradient-to-br ${getTopicStyle(event.topic)} border backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition-shadow`}
              >
                {/* Card Header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{getTopicIcon(event.topic)}</span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {event.topic}
                    </p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                      {event.year}
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-serif">
                  {event.summary}
                </p>
              </motion.div>
            ))}
      </div>
    </div>
  );
};

export default History;
