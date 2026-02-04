import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { getWatchHistory } from '../services/watch';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [watchHistory, setWatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWatchHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getWatchHistory(10, 0);
        setWatchHistory(data.items || []);
      } catch (err) {
        setError('Failed to load watch history');
        console.error('Watch history error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchHistory();
  }, []);

  const handleResumeWatch = (item) => {
    if (item.media_type === 'movie') {
      navigate(`/watch/movie/${item.tmdb_id}`);
    } else if (item.media_type === 'tv' && item.season_number && item.episode_number) {
      navigate(`/watch/tv/${item.tmdb_id}?season=${item.season_number}&episode=${item.episode_number}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPosition = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-netflix-black pb-20 md:pb-0">
      <Navbar />

      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-netflix-gray-dark rounded-lg p-4 md:p-8 mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">Profile</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Username</p>
                <p className="text-white text-lg md:text-xl font-semibold">{user?.username || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-1">Member Since</p>
                <p className="text-white text-lg md:text-xl font-semibold">
                  {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-netflix-gray-dark rounded-lg p-4 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Recent Watch History</h2>

            {loading ? (
              <div className="text-center py-8">
                <Spinner size="md" />
              </div>
            ) : error ? (
              <ErrorMessage message={error} />
            ) : watchHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No watch history yet. Start watching something!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {watchHistory.map((item, index) => (
                  <div
                    key={`${item.tmdb_id}-${item.media_type}-${item.season_number}-${item.episode_number}-${index}`}
                    className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 bg-black bg-opacity-30 rounded-lg hover:bg-opacity-50 transition cursor-pointer gap-3"
                    onClick={() => handleResumeWatch(item)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 md:gap-3 mb-2">
                        <span className="bg-netflix-red px-2 py-1 rounded text-xs font-semibold text-white uppercase">
                          {item.media_type}
                        </span>
                        <p className="text-white text-sm md:text-base font-medium">
                          TMDB ID: {item.tmdb_id}
                          {item.media_type === 'tv' && item.season_number && item.episode_number && (
                            <span className="text-gray-400 ml-2">
                              S{item.season_number}E{item.episode_number}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400">
                        <span>Position: {formatPosition(item.last_position)}</span>
                        <span className="hidden md:inline">•</span>
                        <span>Watched: {formatDate(item.watched_at)}</span>
                      </div>
                    </div>
                    <button className="btn-primary px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm w-full md:w-auto">
                      ▶ Resume
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 md:mt-8 bg-netflix-gray-dark rounded-lg p-4 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Statistics</h2>
            <div className="text-gray-400">
              <p className="mb-2">📊 Total items watched: <span className="text-white font-semibold">{watchHistory.length}</span></p>
              <p className="text-sm text-gray-500 mt-4">More detailed statistics coming soon...</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default Profile;
