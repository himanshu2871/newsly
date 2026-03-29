import { Outlet, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import TopicFilter from './TopicFilter';
import PillNavigation from './PillNavigation';

const DashboardLayout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Persist topic across page navigations using localStorage
  const savedTopic = localStorage.getItem('newsly_topic') || 'latest';
  const activeTopic = searchParams.get('topic') || savedTopic;

  const handleTopicChange = (topicId) => {
    localStorage.setItem('newsly_topic', topicId);
    navigate(`/?topic=${topicId}`);
  };

  return (
    <div className="min-h-screen flex flex-col pt-4 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 w-full">
        {/* Dynamic Page Content */}
        <div className="relative z-10 w-full pb-28">
          <Outlet />
        </div>
      </div>

      {/* Floating Bottom Dashboard Control Bar */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] sm:w-auto flex flex-row items-center justify-between gap-2 sm:gap-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-[2rem] border border-white/50 dark:border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-2 py-2 sm:px-4 sm:py-3">
        <div className="flex-shrink-0">
          <TopicFilter 
            activeTopic={activeTopic} 
            onTopicChange={handleTopicChange} 
          />
        </div>
        <div className="flex-shrink-0">
          <PillNavigation />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
