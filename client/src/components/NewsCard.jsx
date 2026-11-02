import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { summarizeArticle, saveBookmark, deleteBookmark, checkBookmark } from '../services/api';
import { Bookmark, Sparkles, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';

const MotionDiv = motion.div;

const NewsCard = ({ article }) => {
  const { user } = useAuth();
  const [imageSrc, setImageSrc] = useState(article.urlToImage || '');
  const [shouldSearchImage, setShouldSearchImage] = useState(!article.urlToImage);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    if (!shouldSearchImage) return undefined;

    const findRelatedImage = async () => {
      try {
        const params = new URLSearchParams({
          action: 'query',
          generator: 'search',
          gsrsearch: `filetype:bitmap ${article.title}`,
          gsrnamespace: '6',
          gsrlimit: '5',
          prop: 'imageinfo',
          iiprop: 'url',
          iiurlwidth: '640',
          format: 'json',
          origin: '*',
        });
        const response = await fetch(
          `https://commons.wikimedia.org/w/api.php?${params}`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error(`Wikimedia image search failed: ${response.status}`);

        const data = await response.json();
        const pages = Object.values(data.query?.pages || {});
        const image = pages.find(page => page.thumbnail?.source)?.thumbnail?.source;
        if (active && image) setImageSrc(image);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Related image lookup failed:', error);
        }
      }
    };

    findRelatedImage();

    return () => {
      active = false;
      controller.abort();
    };
  }, [article.title, shouldSearchImage]);

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
    setSummaryError('');
    setShowSummary(true);
    setSummaryLoading(true);
    try {
      const res = await summarizeArticle({
        title: article.title,
        description: article.description,
        content: article.content,
      });
      setSummary(res.data.summary);
    } catch (error) {
      setSummaryError(
        error.response?.data?.error || 'Failed to generate summary. Please try again.'
      );
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
    <MotionDiv
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.35 }}
      className="group h-[460px] [perspective:1200px] hover:-translate-y-0.5 transition-transform duration-300"
    >
      <MotionDiv
        animate={{ rotateY: showSummary ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative h-full w-full rounded-2xl shadow-sm hover:shadow-[0_12px_40px_rgb(0,0,0,0.10)] dark:hover:shadow-[0_12px_40px_rgb(0,0,0,0.35)] transition-shadow duration-300"
      >
        <div
          style={{ backfaceVisibility: 'hidden' }}
          className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/60"
        >
          <div className="relative h-48 w-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
            {imageSrc && (
              <>
                <img
                  src={imageSrc}
                  alt={article.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={() => {
                    setImageSrc('');
                    if (article.urlToImage && imageSrc === article.urlToImage) {
                      setShouldSearchImage(true);
                    }
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
              </>
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full border border-white/40 bg-white/60 px-2.5 py-1 text-xs font-medium text-blue-700 shadow-sm backdrop-blur-md dark:border-blue-800/50 dark:bg-blue-900/40 dark:text-blue-300">
                {article.source?.name || 'Unknown'}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(article.publishedAt)}
              </span>
            </div>

            <h3 className="mb-2 min-h-[4.5rem] line-clamp-4 text-sm font-semibold leading-snug text-gray-900 dark:text-white">
              {article.title}
            </h3>

            <p className="mb-4 min-h-[3.375rem] line-clamp-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              {article.description || ''}
            </p>

            <div className="mt-auto flex items-center gap-2">
              <button
                onClick={handleSummary}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
              >
                <Sparkles size={13} /> AI Summary
              </button>

              <button
                onClick={handleBookmark}
                title={bookmarked ? 'Remove bookmark' : 'Save bookmark'}
                className="rounded-xl border border-white/50 bg-white/40 p-2 shadow-sm backdrop-blur-sm transition dark:border-gray-700/50 dark:bg-gray-800/40"
              >
                <Bookmark
                  size={16}
                  className={bookmarked
                    ? 'fill-blue-500 text-blue-500'
                    : 'fill-transparent text-gray-500 hover:text-blue-500'
                  }
                />
              </button>

              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/50 bg-white/40 p-2 text-gray-500 shadow-sm backdrop-blur-sm transition hover:text-blue-600 dark:border-gray-700/50 dark:bg-gray-800/40"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>

        <div
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/70 p-5 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/70"
        >
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Summary</h3>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {summaryLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 size={16} className="animate-spin" />
                Generating summary...
              </div>
            ) : summaryError ? (
              <p className="text-sm text-red-600 dark:text-red-400">{summaryError}</p>
            ) : (
              <ul className="space-y-4">
                {bullets.map((bullet, index) => {
                  const textColors = [
                    'text-indigo-700 dark:text-indigo-300',
                    'text-emerald-700 dark:text-emerald-300',
                    'text-rose-700 dark:text-rose-300',
                  ];
                  const dotColors = [
                    'bg-indigo-500 dark:bg-indigo-400',
                    'bg-emerald-500 dark:bg-emerald-400',
                    'bg-rose-500 dark:bg-rose-400',
                  ];

                  return (
                    <li key={index} className="flex items-start gap-2">
                      <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${dotColors[index % dotColors.length]}`} />
                      <span className={`text-sm leading-relaxed font-medium ${textColors[index % textColors.length]}`}>
                        {bullet}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <button
            onClick={() => setShowSummary(false)}
            className="mt-4 flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-white/80 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={14} /> Back to article
          </button>
        </div>
      </MotionDiv>
    </MotionDiv>
  );
};

export default NewsCard;