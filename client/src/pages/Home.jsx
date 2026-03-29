import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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

  // Reset page and search when active topic changes in URL
  const prevTopicRef = useRef(activeTopic);
  useEffect(() => {
    if (prevTopicRef.current !== activeTopic) {
      setPage(1);
      setSearchQuery('');
      setSearchInput('');
      prevTopicRef.current = activeTopic;
    }
  }, [activeTopic]);

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (user) {
        try {
          const res = await getPreferences();
          const topics = res.data.preferences?.topics || [];
          setUserTopics(topics);
        } catch {
          // fallback
        }
      }
      setPrefsLoaded(true);
    };
    loadPreferences();
  }, [user]);

  // Fetch articles when topic/page/search changes
  useEffect(() => {
    if (!prefsLoaded) return;
    fetchArticles(activeTopic, page, searchQuery);
  }, [activeTopic, page, prefsLoaded, searchQuery]);

  const fetchArticles = async (topic, pageNum = 1, query = '') => {
    setLoading(true);
    // Auto-scroll on new data load (pagination or internal filters)
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
    // Note: We don't reset activeTopic here because search operates within the context of the user asking for search results
  };

  const totalPages = Math.ceil(total / 20);

  const getResultsLabel = () => {
    if (searchQuery) return `Showing results for "${searchQuery}" — ${total} articles found`;
    if (activeTopic === 'preferred' && userTopics.length > 0) return `Showing ${articles.length} articles from your preferred topics: ${userTopics.join(', ')}`;
    return `Showing ${articles.length} articles`;
  };

  return (
    <div className="w-full">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8 flex gap-2 max-w-2xl mx-auto">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search news... (e.g. climate change, stock market)"
          className="flex-1 px-4 py-3 rounded-xl border border-white/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-500/70 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
        />
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition text-sm shadow-sm"
        >
          Search
        </button>
      </form>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-4 font-medium">
          {getResultsLabel()}
        </p>
      )}

      {/* News Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-3xl border border-white/50 dark:border-gray-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            No articles found. Try a different topic or search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          {articles.map((article, i) => (
            <NewsCard key={`${article.url}-${i}`} article={article} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && !searchQuery && activeTopic !== 'latest' && activeTopic !== 'preferred' && (
        <div className="flex items-center justify-center gap-4 mt-12 pb-12">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2 rounded-xl border border-white/50 dark:border-gray-700/50 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md text-sm font-medium text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-white/60 dark:hover:bg-gray-800/60 transition shadow-sm"
          >
            ← Previous
          </button>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
             className="px-5 py-2 rounded-xl border border-white/50 dark:border-gray-700/50 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md text-sm font-medium text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-white/60 dark:hover:bg-gray-800/60 transition shadow-sm"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;