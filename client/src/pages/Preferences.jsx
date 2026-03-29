import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getPreferences, updatePreferences } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ALL_TOPICS = [
  { label: '💻 Technology',    value: 'technology' },
  { label: '⚽ Sports',        value: 'sports' },
  { label: '🏛️ Politics',      value: 'politics' },
  { label: '💰 Finance',       value: 'finance' },
  { label: '🎬 Entertainment', value: 'entertainment' },
  { label: '🏥 Health',        value: 'health' },
  { label: '🔬 Science',       value: 'science' },
  { label: '🇮🇳 India',         value: 'india' },
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
      .catch(() => setSelected(['technology', 'science', 'business']))
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
    if (selected.length === 0) {
      alert('Please select at least one topic');
      return;
    }
    setSaving(true);
    try {
      await updatePreferences(selected);
      setSaved(true);
      setTimeout(() => navigate('/'), 1000);
    } catch {
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto pb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto pb-8">

      {/* Topics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {ALL_TOPICS.map((topic) => {
          const isSelected = selected.includes(topic.value);
          return (
            <motion.button
              key={topic.value}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggleTopic(topic.value)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all backdrop-blur-md shadow-sm ${
                isSelected
                  ? 'border-blue-400/50 bg-white/70 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                  : 'border-white/50 dark:border-gray-700/50 bg-white/40 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 hover:border-white/80 dark:hover:border-gray-600'
              }`}
            >
              <span className="text-2xl">{topic.label.split(' ')[0]}</span>
              <div>
                <p className="font-medium text-sm">
                  {topic.label.split(' ').slice(1).join(' ')}
                </p>
                {isSelected && (
                  <p className="text-xs text-blue-500 dark:text-blue-400">Following</p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected count */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
        {selected.length} topic{selected.length !== 1 ? 's' : ''} selected
      </p>

      {/* Save Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        disabled={saving || selected.length === 0}
        className={`w-full py-3 rounded-xl font-semibold text-white transition backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.1)] ${
          saved
            ? 'bg-green-500/90 dark:bg-green-600/90'
            : 'bg-blue-600/90 hover:bg-blue-700/90 disabled:bg-blue-400/50'
        }`}
      >
        {saving ? 'Saving...' : saved ? '✅ Saved! Redirecting...' : 'Save Preferences'}
      </motion.button>
    </div>
  );
};

export default Preferences;