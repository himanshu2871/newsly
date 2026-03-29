import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOPICS = [
  { label: '🔥 Latest',        value: 'latest' },
  { label: '⭐ My Feed',        value: 'preferred' },
  { label: '🇮🇳 India',         value: 'india' },
  { label: '💻 Technology',    value: 'technology' },
  { label: '⚽ Sports',        value: 'sports' },
  { label: '🏛️ Politics',      value: 'politics' },
  { label: '💰 Finance',       value: 'finance' },
  { label: '🎬 Entertainment', value: 'entertainment' },
  { label: '🏥 Health',        value: 'health' },
  { label: '🔬 Science',       value: 'science' },
];

const TopicFilter = ({ activeTopic, onTopicChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const filterRef = useRef(null);
  const activeLabel = TOPICS.find((t) => t.value === activeTopic)?.label || 'Topics';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative z-50 flex justify-center md:justify-start" ref={filterRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 text-gray-800 dark:text-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-blue-400 hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all"
      >
        <span className="text-base sm:text-lg">☰</span>
        <span className="font-medium text-xs sm:text-sm whitespace-nowrap truncate max-w-[80px] sm:max-w-none">{activeLabel}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-0 origin-bottom-left bottom-full mb-3 w-56 sm:w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 dark:border-gray-700/50 overflow-hidden z-50 py-2"
            >
              <div className="max-h-80 overflow-y-auto scrollbar-hide">
                {TOPICS.map((topic) => (
                  <button
                    key={topic.value}
                    onClick={() => {
                      onTopicChange(topic.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3 text-sm transition-colors ${
                      activeTopic === topic.value
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
                    }`}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopicFilter;