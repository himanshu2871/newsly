import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Bookmarks from './pages/Bookmarks';
import Preferences from './pages/Preferences';
import ScrollToTop from './components/ScrollToTop';
import NotFound from './pages/NotFound';
import BackToTop from './components/BackToTop';
import DashboardLayout from './components/DashboardLayout';
import History from './pages/History';
import DailyNews from './pages/DailyNews';


const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
          
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
            <Route path="/preferences" element={<ProtectedRoute><Preferences /></ProtectedRoute>} />
            <Route path="/history" element={<History />} />
            <Route path="/dailynews" element={<DailyNews />} />
          </Route>


        </Routes>
      </AnimatePresence>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          {/* Ambient Global Background */}
          <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-500">
            {/* Animated Mesh Blobs */}
            <div 
              className="fixed top-[-10%] left-[10%] w-96 h-96 lg:w-[600px] lg:h-[600px] rounded-full bg-blue-400/50 dark:bg-blue-600/40 blur-[80px] lg:blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-blob opacity-80" 
              style={{animationDelay: '0s'}} 
            />
            <div 
              className="fixed top-[20%] right-[0%] w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full bg-purple-400/50 dark:bg-purple-600/40 blur-[80px] lg:blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-blob opacity-80" 
              style={{animationDelay: '2s', animationDuration: '12s'}} 
            />
            <div 
              className="fixed bottom-[-10%] left-[30%] w-[400px] h-[400px] lg:w-[700px] lg:h-[700px] rounded-full bg-indigo-400/50 dark:bg-indigo-600/40 blur-[80px] lg:blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-blob opacity-80" 
              style={{animationDelay: '4s', animationDuration: '14s'}} 
            />

            {/* Foreground Application */}
            <div className="relative z-10 min-h-screen flex flex-col pt-16">
              <AppRoutes />
              <BackToTop />
            </div>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;