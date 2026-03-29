import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLink = "text-sm transition font-medium";
  const activeClass = "text-blue-600 dark:text-blue-400";
  const inactiveClass = "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400";

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 dark:bg-[#0B0F19]/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">

        {/* Logo and Time */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link to="/" className="flex-shrink-0">
            <img 
              src="/newsly.png" 
              alt="Newsly Logo" 
              className="w-8 h-8 sm:w-9 sm:h-9 object-cover rounded-xl shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10" 
            />
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <Link to="/" className="text-xl sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 leading-none">
              Newsly
            </Link>
            <div className="flex items-center sm:border-l sm:border-gray-300 sm:dark:border-gray-700 sm:pl-3 mt-1 sm:mt-0">
              <span className="text-[10px] sm:text-sm font-bold sm:font-medium text-gray-400 dark:text-gray-500 uppercase sm:normal-case tracking-widest sm:tracking-normal whitespace-nowrap leading-none sm:leading-normal">
                {currentTime.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-5">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {user ? (
            <>
              <Link to="/bookmarks" className={`${navLink} ${isActive('/bookmarks') ? activeClass : inactiveClass}`}>
                Bookmarks
              </Link>
              <Link to="/preferences" className={`${navLink} ${isActive('/preferences') ? activeClass : inactiveClass}`}>
                Preferences
              </Link>
              <span className="text-sm text-gray-400 dark:text-gray-500">
                Hi, {user.name.split(' ')[0]} 👋
              </span>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`${navLink} ${isActive('/login') ? activeClass : inactiveClass}`}>
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile: hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
<AnimatePresence>
  {menuOpen && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="md:hidden border-t border-gray-200/50 dark:border-white/10 bg-white/70 dark:bg-[#0B0F19]/70 backdrop-blur-xl px-4 py-4 space-y-3"
    >
      <div className="flex items-center justify-between pb-2 border-b border-gray-200/50 dark:border-white/10 mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Theme</span>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm font-medium"
        >
          {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {user ? (
        <>
          <p className="text-sm text-gray-400 dark:text-gray-500 pb-1">
            Hi, {user.name.split(' ')[0]} 👋
          </p>
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 py-2"
          >
            🏠 Home
          </Link>
          <Link
            to="/bookmarks"
            onClick={() => setMenuOpen(false)}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 py-2"
          >
            🔖 Bookmarks
          </Link>
          <Link
            to="/preferences"
            onClick={() => setMenuOpen(false)}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 py-2"
          >
            ⚙️ Preferences
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm font-medium text-red-500 hover:text-red-600 py-2"
          >
            🚪 Logout
          </button>
        </>
      ) : (
        <>
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 py-2"
          >
            🏠 Home
          </Link>
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 py-2"
          >
            Login
          </Link>
          <Link
            to="/register"
            onClick={() => setMenuOpen(false)}
            className="block w-full text-center text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Register
          </Link>
        </>
      )}
    </motion.div>
  )}
</AnimatePresence>
    </nav>
  );
};

export default Navbar;