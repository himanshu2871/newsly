import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/bookmarks', label: 'Bookmarks', icon: '🔖' },
  { path: '/preferences', label: 'Preferences', icon: '⚙️' },
];

const PillNavigation = () => {
  const location = useLocation();

  return (
    <div className="flex bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-full border border-white/50 dark:border-gray-700/50 p-1 relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] items-center">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`relative flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 md:px-5 md:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors z-10 ${
              isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="pill-bubble"
                className="absolute inset-0 bg-white/80 dark:bg-white/10 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] border border-white/60 dark:border-white/5 -z-10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="text-base">{item.icon}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default PillNavigation;
