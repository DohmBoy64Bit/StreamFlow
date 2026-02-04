import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { getWatchHistory } from '../services/watch';
import { getUserStats } from '../services/stats';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [watchHistory, setWatchHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [historyData, statsData] = await Promise.all([
          getWatchHistory(10, 0),
          getUserStats()
        ]);
        setWatchHistory(historyData.items || []);
        setStats(statsData);
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Profile data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const formatTotalTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return (
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-white">{hours}</span>
          <span className="text-sm text-gray-500 font-bold uppercase tracking-tighter">hrs</span>
          <span className="text-3xl font-black text-white ml-2">{minutes}</span>
          <span className="text-sm text-gray-500 font-bold uppercase tracking-tighter">min</span>
        </div>
      );
    }
    return (
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-white">{minutes || 0}</span>
        <span className="text-sm text-gray-400 font-bold uppercase">min</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-streamflow-navy pb-20 md:pb-0">
      <Navbar />

      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="card p-6 md:p-8 mb-8 border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-streamflow-cyan/5 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-streamflow-cyan/10 transition-all duration-700"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
                  Account <span className="text-streamflow-cyan">Profile</span>
                </h1>
                <p className="text-gray-400 font-medium">Manage your viewing history and statistics</p>
              </div>

              <div className="flex gap-8 md:gap-12 text-sm md:text-base">
                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Username</p>
                  <p className="text-white text-xl font-black tracking-tight">{user?.username || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Member Since</p>
                  <p className="text-white text-xl font-black tracking-tight">
                    {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Watch Time Card */}
              <div className="card p-6 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-streamflow-blue/20 flex items-center justify-center text-streamflow-cyan shadow-cyan-glow/10 shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-black text-white uppercase tracking-wider">Watch Time</h2>
                </div>
                {formatTotalTime(stats?.total_watch_time_seconds || 0)}
                <p className="text-xs text-gray-500 mt-2 font-medium">Total time spent streaming on StreamFlow</p>
              </div>

              {/* Genres Card */}
              <div className="card p-6 border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-streamflow-cyan/10 flex items-center justify-center text-streamflow-cyan shadow-cyan-glow/10 shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-black text-white uppercase tracking-wider">Top Genres</h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {stats?.top_genres && stats.top_genres.length > 0 ? (
                    stats.top_genres.map((genre) => (
                      <div key={genre.id} className="glass-panel px-3 py-1.5 rounded-lg border-white/5 flex items-center gap-2">
                        <span className="text-white text-xs font-bold">{genre.name}</span>
                        <span className="text-streamflow-cyan text-[10px] font-black">{genre.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs italic">Watch more content to see your favorites!</p>
                  )}
                </div>
              </div>

              {/* Rewatched Card */}
              <div className="card p-6 border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-streamflow-blue/10 flex items-center justify-center text-streamflow-blue shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-black text-white uppercase tracking-wider">Most Rewatched</h2>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {stats?.most_rewatched && stats.most_rewatched.length > 0 ? (
                    stats.most_rewatched.map((item) => (
                      <div key={item.tmdb_id} className="w-16 flex-shrink-0 group cursor-pointer" onClick={() => handleResumeWatch(item)}>
                        <div className="aspect-[2/3] rounded-md overflow-hidden border border-white/10 group-hover:border-streamflow-cyan/50 transition-all">
                          {item.poster_path ? (
                            <img src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-[8px] text-gray-500 text-center px-1">No Image</div>
                          )}
                        </div>
                        <p className="text-[10px] text-white font-bold truncate mt-1">{item.title}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs italic">Nothing rewatched yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: History */}
            <div className="lg:col-span-2">
              <div className="card md:p-8 border-white/10 bg-white/[0.01]">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Recent <span className="text-streamflow-cyan">Activity</span>
                  </h2>
                  <div className="px-3 py-1 bg-streamflow-navy border border-white/5 rounded-full">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">History</span>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <Spinner size="md" />
                  </div>
                ) : error ? (
                  <ErrorMessage message={error} />
                ) : watchHistory.length === 0 ? (
                  <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/5">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-bold">Start watching to build your history!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {watchHistory.map((item, index) => (
                      <div
                        key={`${item.tmdb_id}-${item.media_type}-${item.season_number}-${item.episode_number}-${index}`}
                        className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 bg-white/5 rounded-xl hover:bg-white/[0.08] transition-all duration-300 border border-white/5 hover:border-streamflow-cyan/20 cursor-pointer gap-4 group"
                        onClick={() => handleResumeWatch(item)}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Poster Thumbnail */}
                          <div className="relative w-16 h-24 md:w-20 md:h-28 rounded-xl overflow-hidden flex-shrink-0 shadow-lg group-hover:shadow-cyan-glow/20 transition-all duration-300">
                            {item.poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-streamflow-navy-light flex items-center justify-center">
                                <span className="text-gray-600 text-[10px]">No Poster</span>
                              </div>
                            )}

                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white text-base md:text-xl font-black truncate group-hover:text-streamflow-cyan transition-colors duration-300 tracking-tight">
                                {item.title || `TMDB ID: ${item.tmdb_id}`}
                              </h3>
                              <span className="bg-streamflow-cyan/20 border border-streamflow-cyan/30 px-2 py-0.5 rounded text-[9px] font-black text-streamflow-cyan uppercase flex-shrink-0">
                                {item.media_type}
                              </span>
                            </div>

                            {item.media_type === 'tv' && item.season_number && item.episode_number && (
                              <p className="text-streamflow-cyan font-black text-xs md:text-sm mb-1 uppercase tracking-wide opacity-80">
                                S{item.season_number}E{item.episode_number}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] md:text-xs text-gray-500 uppercase font-bold tracking-wider">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-streamflow-blue"></span>
                                <span>{formatPosition(item.last_position)} watched</span>
                              </div>
                              <span className="hidden md:inline text-white/10">|</span>
                              <div className="flex items-center gap-1.5 text-gray-500">
                                <span>{formatDate(item.watched_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button className="btn-primary py-3 px-8 w-full md:w-auto text-xs md:text-sm font-black shadow-cyan-glow-intense/20 flex items-center justify-center gap-2 flex-shrink-0">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          Resume
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
