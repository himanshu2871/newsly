import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import SkeletonCard from '../components/SkeletonCard';
import { getLatestNews, getNewsByTopic, getIndiaNews, searchNews, getPreferences } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTopic = searchParams.get('topic') || 'latest';

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [userTopics, setUserTopics] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const prevTopicRef = useRef(activeTopic);
  useEffect(() => {
    if (prevTopicRef.current !== activeTopic) {
      setPage(1);
      setSearchQuery('');
      setSearchInput('');
      prevTopicRef.current = activeTopic;
    }
  }, [activeTopic]);

  useEffect(() => {
    const loadPreferences = async () => {
      if (user) {
        try {
          const res = await getPreferences();
          const topics = res.data.preferences?.topics || [];
          setUserTopics(topics);
        } catch { /* fallback */ }
      }
      setPrefsLoaded(true);
    };
    loadPreferences();
  }, [user]);

  useEffect(() => {
    if (!prefsLoaded) return;
    fetchArticles(activeTopic, page, searchQuery);
  }, [activeTopic, page, prefsLoaded, searchQuery]);

  const fetchArticles = async (topic, pageNum = 1, query = '') => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      let allArticles = [];

      if (query) {
        const res = await searchNews(query, pageNum);
        allArticles = res.data.articles || [];
        setTotal(res.data.total || 0);

      } else if (topic === 'preferred' && userTopics.length > 0) {
        const requests = userTopics.map(t =>
          t === 'india' ? getIndiaNews(pageNum) : getNewsByTopic(t, pageNum)
        );
        const results = await Promise.all(requests);
        const merged = [];
        const maxLen = Math.max(...results.map(r => r.data.articles?.length || 0));
        for (let i = 0; i < maxLen; i++) {
          results.forEach(r => {
            const article = r.data.articles?.[i];
            if (article && article.title !== '[Removed]') merged.push(article);
          });
        }
        const seen = new Set();
        allArticles = merged.filter(a => {
          if (seen.has(a.url)) return false;
          seen.add(a.url);
          return true;
        });
        setTotal(allArticles.length + 20);

      } else if (topic === 'latest' || topic === 'preferred') {
        const res = await getLatestNews();
        allArticles = res.data.articles || [];
        setTotal(allArticles.length + 20);

      } else if (topic === 'india') {
        const res = await getIndiaNews(pageNum);
        allArticles = res.data.articles || [];
        setTotal(res.data.total || 0);

      } else {
        const res = await getNewsByTopic(topic, pageNum);
        allArticles = res.data.articles || [];
        setTotal(res.data.total || 0);
      }

      setArticles(allArticles);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearchQuery(searchInput.trim());
    setPage(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchInput('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / 20);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="w-full">

      {/* Hero strip — greeting + search */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {/* Greeting */}
        <div className="mb-5 text-center">
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {getGreeting()}{user ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening in the world today.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border transition-all duration-300 shadow-[0_4px_24px_rgb(0,0,0,0.06)] ${
            searchFocused
              ? 'border-blue-400/60 dark:border-blue-500/50 shadow-[0_0_0_3px_rgb(59,130,246,0.12)]'
              : 'border-white/60 dark:border-gray-700/50'
          }`}>
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search"
              className="flex-1 min-w-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-sm"
            />
            <AnimatePresence>
              {searchInput && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0 transition"
                >
                  <X size={16} />
                </motion.button>
              )}
            </AnimatePresence>
            <button
              type="submit"
              className="flex-shrink-0 px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold transition shadow-sm"
            >
              Search
            </button>
          </div>
        </form>

        {/* Active search pill */}
        <AnimatePresence>
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center justify-center gap-2 mt-3"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/80 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-700/40 text-xs font-medium text-blue-700 dark:text-blue-300 backdrop-blur-md">
                <Search size={12} /> <span>"{searchQuery}"</span>
                <button onClick={clearSearch} className="ml-1 hover:text-blue-900 dark:hover:text-blue-100 transition"><X size={12} /></button>
              </span>
              {total > 0 && (
                <span className="text-xs text-gray-400 dark:text-gray-500">{total} results</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* News Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : articles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24 bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-3xl border border-white/50 dark:border-gray-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <Search size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            No articles found. Try a different topic or search.
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
        >
          {articles.map((article, i) => (
            <NewsCard key={`${article.url}-${i}`} article={article} />
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && !searchQuery && activeTopic !== 'latest' && activeTopic !== 'preferred' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-4 mt-12 pb-12"
        >
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2.5 rounded-xl border border-white/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl text-sm font-medium text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-white/70 dark:hover:bg-gray-800/70 transition shadow-sm"
          >
            ← Previous
          </button>
          <span className="px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 text-sm font-semibold text-gray-700 dark:text-gray-300">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-5 py-2.5 rounded-xl border border-white/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl text-sm font-medium text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-white/70 dark:hover:bg-gray-800/70 transition shadow-sm"
          >
            Next →
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Home;