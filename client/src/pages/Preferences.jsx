import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPreferences, updatePreferences } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

const ALL_TOPICS = [
  { label: 'Technology',    value: 'technology',    icon: '💻', color: 'from-blue-500/20 to-cyan-500/10 border-blue-400/40 dark:border-blue-600/30 text-blue-700 dark:text-blue-300' },
  { label: 'Sports',        value: 'sports',        icon: '⚽', color: 'from-green-500/20 to-emerald-500/10 border-green-400/40 dark:border-green-600/30 text-green-700 dark:text-green-300' },
  { label: 'Politics',      value: 'politics',      icon: '🏛️', color: 'from-purple-500/20 to-indigo-500/10 border-purple-400/40 dark:border-purple-600/30 text-purple-700 dark:text-purple-300' },
  { label: 'Finance',       value: 'finance',       icon: '💰', color: 'from-amber-500/20 to-yellow-500/10 border-amber-400/40 dark:border-amber-600/30 text-amber-700 dark:text-amber-300' },
  { label: 'Entertainment', value: 'entertainment', icon: '🎬', color: 'from-pink-500/20 to-rose-500/10 border-pink-400/40 dark:border-pink-600/30 text-pink-700 dark:text-pink-300' },
  { label: 'Health',        value: 'health',        icon: '🏥', color: 'from-red-500/20 to-orange-500/10 border-red-400/40 dark:border-red-600/30 text-red-700 dark:text-red-300' },
  { label: 'Science',       value: 'science',       icon: '🔬', color: 'from-cyan-500/20 to-teal-500/10 border-cyan-400/40 dark:border-cyan-600/30 text-cyan-700 dark:text-cyan-300' },
  { label: 'India',         value: 'india',         icon: '🇮🇳', color: 'from-orange-500/20 to-amber-500/10 border-orange-400/40 dark:border-orange-600/30 text-orange-700 dark:text-orange-300' },
];

const Preferences = () => {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getPreferences()
      .then(res => setSelected(res.data.preferences?.topics || []))
      .catch(() => setSelected(['technology', 'science']))
      .finally(() => setLoading(false));
  }, []);

  const toggleTopic = (value) => {
    setSelected(prev =>
      prev.includes(value)
        ? prev.filter(t => t !== value)
        : [...prev, value]
    );
    setSaved(false);
  };

  const handleSave = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      await updatePreferences(selected);
      setSaved(true);
      setTimeout(() => navigate('/'), 1200);
    } catch {
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 pb-36">

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-1">
            Personalization
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            ⚙️ Preferences
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Choose the topics you want in your feed
          </p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm"
        >
          ← Home
        </Link>
      </motion.div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800/60 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Topics Grid */}
          <motion.div
            className="grid grid-cols-2 gap-3 mb-6"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {ALL_TOPICS.map((topic) => {
              const isSelected = selected.includes(topic.value);
              return (
                <motion.button
                  key={topic.value}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleTopic(topic.value)}
                  className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 backdrop-blur-xl overflow-hidden group ${
                    isSelected
                      ? `bg-gradient-to-br ${topic.color} shadow-md`
                      : 'bg-white/40 dark:bg-gray-900/40 border-white/50 dark:border-gray-700/50 hover:bg-white/60 dark:hover:bg-gray-900/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {/* Shine effect on selected */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none rounded-2xl" />
                  )}

                  <span className="text-2xl flex-shrink-0">{topic.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight">{topic.label}</p>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-70"
                        >
                          ✓ Following
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Checkmark badge */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="w-5 h-5 rounded-full bg-white/50 dark:bg-white/20 flex items-center justify-center flex-shrink-0"
                      >
                        <span className="text-[10px]">✓</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Status Bar */}
          <div className="flex items-center justify-between mb-4 px-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-bold text-gray-800 dark:text-gray-200">{selected.length}</span> topic{selected.length !== 1 ? 's' : ''} selected
            </p>
            {selected.length === 0 && (
              <p className="text-xs text-red-500 dark:text-red-400 font-medium">Select at least one topic</p>
            )}
          </div>

          {/* Save Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving || selected.length === 0}
            className={`relative w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all duration-300 overflow-hidden shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
              saved
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/20'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
            <span className="relative">
              {saving ? '⏳ Saving...' : saved ? '✅ Saved! Redirecting...' : 'Save Preferences'}
            </span>
          </motion.button>
        </>
      )}
    </div>
  );
};

export default Preferences;