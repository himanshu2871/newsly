import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDailyBrief } from '../services/api';

const CATEGORY_STYLES = {
  'Technology':    { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',    icon: '💻' },
  'Politics':      { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', icon: '🏛️' },
  'Science':       { color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',    icon: '🔬' },
  'Sports':        { color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', icon: '⚽' },
  'Business':      { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: '💼' },
  'Health':        { color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',    icon: '🏥' },
  'Entertainment': { color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',    icon: '🎬' },
  'World':         { color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300', icon: '🌍' },
};

const IMPORTANCE_STYLE = {
  'Top Story': 'bg-red-500 text-white',
  'Major':     'bg-orange-400 text-white',
  'Notable':   'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const getCategoryStyle = (cat) =>
  CATEGORY_STYLES[cat] || { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: '📰' };

const SkeletonCard = ({ featured }) => (
  <div className={`rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-white/50 dark:border-gray-700/40 p-5 animate-pulse ${featured ? 'sm:col-span-2' : ''}`}>
    <div className="flex items-center gap-2 mb-3">
      <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded-full" />
    </div>
    <div className="space-y-2 mb-3">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
      {featured && <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />}
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
    </div>
  </div>
);

const BriefCard = ({ item, index }) => {
  const catStyle = getCategoryStyle(item.category);
  const importanceStyle = IMPORTANCE_STYLE[item.importance] || IMPORTANCE_STYLE['Notable'];
  const isTopStory = item.importance === 'Top Story';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`group relative rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${isTopStory ? 'sm:col-span-2' : ''}`}
    >
      {/* Top accent line */}
      {isTopStory && (
        <div className="h-1 w-full bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400" />
      )}

      <div className="p-5">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${importanceStyle}`}>
            {item.importance}
          </span>
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 ${catStyle.color}`}>
            <span>{catStyle.icon}</span>
            {item.category}
          </span>
          {item.source && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto font-medium">
              {item.source}
            </span>
          )}
        </div>

        {/* Headline */}
        <h2 className={`font-bold text-gray-900 dark:text-gray-50 mb-2 leading-snug ${isTopStory ? 'text-xl sm:text-2xl' : 'text-base'}`}>
          {item.headline}
        </h2>

        {/* Summary */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {item.summary}
        </p>

        {/* Read more link */}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Read full story →
          </a>
        )}
      </div>
    </motion.div>
  );
};

const DailyNews = () => {
  const [brief, setBrief] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState('');

  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    getDailyBrief()
      .then(res => {
        setBrief(res.data.brief || []);
        setDate(res.data.date || '');
      })
      .catch(() => setError('Could not load the daily brief. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 pb-36">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-orange-500 dark:text-orange-400 mb-1">
          ☀️ Morning Briefing
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 dark:from-orange-400 dark:via-red-400 dark:to-pink-400">
          Daily News Brief
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
          {dateLabel} · AI-curated from today's top headlines
        </p>
      </motion.div>

      {/* Error state */}
      {error && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-4xl mb-3">😕</p>
          <p>{error}</p>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} featured={i === 0} />)
          : brief.map((item, i) => <BriefCard key={i} item={item} index={i} />)
        }
      </div>
    </div>
  );
};

export default DailyNews;
