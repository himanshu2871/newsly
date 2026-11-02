import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Sun, Clock } from 'lucide-react';


const MotionDiv = motion.div;
const PillNavigation = () => {
  const location = useLocation();

  const navItems = [
    { path: `/?topic=${localStorage.getItem('newsly_topic') || 'latest'}`, matchPath: '/', label: 'Home', icon: <Home size={16} /> },
    { path: '/dailynews', matchPath: '/dailynews', label: 'Daily Brief', icon: <Sun size={16} /> },
    { path: '/history', matchPath: '/history', label: 'History', icon: <Clock size={16} /> },
  ];

  return (
    <div className="relative flex w-full items-center rounded-full border border-white/50 bg-white/60 p-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/60 sm:w-auto">
      {navItems.map((item) => {
        const isActive = location.pathname === item.matchPath;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`relative z-10 flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5 text-[9px] font-medium transition-colors sm:flex-initial sm:flex-row sm:gap-2 sm:px-2.5 sm:py-1.5 sm:text-xs md:px-5 md:py-2 md:text-sm ${
              isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {isActive && (
              <MotionDiv
                layoutId="pill-bubble"
                className="absolute inset-0 bg-white/80 dark:bg-white/10 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] border border-white/60 dark:border-white/5 -z-10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="flex items-center">{item.icon}</span>
            <span className="truncate sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default PillNavigation;
