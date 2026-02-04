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

      <div className="container mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header - Tightened for density */}
          <div className="card p-5 md:p-6 mb-6 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-streamflow-cyan/5 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-streamflow-cyan/10 transition-all duration-1000"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight uppercase">
                  Account <span className="text-streamflow-cyan">Profile</span>
                </h1>
                <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">Diagnostic & Analytics Terminal</p>
              </div>

              <div className="flex gap-10 md:gap-16">
                <div>
                  <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Username</p>
                  <p className="text-white text-[11px] font-black tracking-tight uppercase">{user?.username || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Member Since</p>
                  <div className="flex items-center gap-2">
                    <p className="text-streamflow-cyan text-[11px] font-black uppercase tracking-widest">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column: Stats - High Density */}
            <div className="lg:col-span-1 space-y-4">
              {/* Watch Time Card */}
              <div className="tooltip-container">
                <div className="tooltip-content">
                  Total time spent streaming on StreamFlow
                </div>
                <div className="card p-4 border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-500 relative group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-streamflow-blue/5 blur-2xl rounded-full" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-streamflow-blue/10 flex items-center justify-center text-streamflow-cyan border border-streamflow-blue/20">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Runtime</h2>
                    </div>
                    {formatTotalTime(stats?.total_watch_time_seconds || 0)}
                  </div>
                </div>
              </div>

              {/* Genres Card */}
              <div className="tooltip-container">
                <div className="tooltip-content">
                  Top 5 most watched categories
                </div>
                <div className="card p-4 border-white/5 bg-white/[0.01] relative">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-streamflow-cyan/5 flex items-center justify-center text-streamflow-cyan border border-white/5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Affinity</h2>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {stats?.top_genres && stats.top_genres.length > 0 ? (
                      stats.top_genres.slice(0, 5).map((genre) => (
                        <div key={genre.id} className="bg-white/[0.02] px-2 py-1 rounded border border-white/5 flex items-center gap-2">
                          <span className="text-white text-[9px] font-bold uppercase tracking-tighter">{genre.name}</span>
                          <span className="text-streamflow-cyan text-[9px] font-black">{genre.count}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-[9px] font-black uppercase italic">N/A</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Rewatched Card */}
              <div className="tooltip-container">
                <div className="tooltip-content">
                  Content you enjoy watching multiple times
                </div>
                <div className="card p-4 border-white/5 bg-white/[0.01]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-streamflow-blue/5 flex items-center justify-center text-streamflow-blue border border-white/5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Recurring</h2>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {stats?.most_rewatched && stats.most_rewatched.length > 0 ? (
                      stats.most_rewatched.map((item) => (
                        <div key={item.tmdb_id} className="w-12 flex-shrink-0 group cursor-pointer" onClick={() => handleResumeWatch(item)}>
                          <div className="aspect-[2/3] rounded border border-white/10 group-hover:border-streamflow-cyan/50 transition-all duration-300">
                            {item.poster_path ? (
                              <img src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-black/40 flex items-center justify-center text-[6px] text-gray-600 text-center px-1 font-bold uppercase">NO DATA</div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-[9px] font-black uppercase italic">N/A</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Media Partitioning Card */}
              <div className="tooltip-container">
                <div className="tooltip-content">
                  Diagnostic split of unique media assets
                </div>
                <div className="card p-4 border-white/5 bg-white/[0.01]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-streamflow-cyan/5 flex items-center justify-center text-streamflow-cyan border border-white/5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Partitioning</h2>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Asset Ratio</p>
                      <p className="text-[11px] font-black text-white italic">
                        {stats?.media_partition?.movies || 0} <span className="text-gray-600 text-[8px] mx-1">/</span> {stats?.media_partition?.tv_shows || 0}
                      </p>
                    </div>

                    {/* Diagnostic Bar - Blended Gradient */}
                    {(() => {
                      const movies = stats?.media_partition?.movies || 0;
                      const tv = stats?.media_partition?.tv_shows || 0;
                      const total = movies + tv || 1;
                      const moviePercent = (movies / total) * 100;

                      return (
                        <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden flex border border-white/5 relative">
                          <div
                            className="h-full w-full transition-all duration-1000"
                            style={{
                              background: `linear-gradient(90deg, 
                                #00FFFF 0%, 
                                #00FFFF ${Math.max(0, moviePercent - 2)}%, 
                                #f97316 ${Math.min(100, moviePercent + 2)}%, 
                                #f97316 100%)`,
                              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
                            }}
                          />
                          {/* Inner Shadow Polish */}
                          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]" />
                        </div>
                      );
                    })()}

                    <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-streamflow-cyan" />
                        <span className="text-gray-400">Movies</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">Series</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: History - Tightened List */}
            <div className="lg:col-span-3">
              <div className="card p-5 md:p-6 border-white/10 bg-white/[0.005]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-white tracking-tight uppercase">
                    Recent <span className="text-streamflow-cyan">Activity</span>
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 border-l border-white/5 pl-4 leading-none">
                      <span className="text-[8.5px] font-black text-gray-700 uppercase tracking-[0.2em] hidden md:block leading-none">Log Sequence</span>
                      <div className="flex items-center gap-1">
                        <span className="text-white/10 text-[8px] font-black">[</span>
                        <span className="text-[7.5px] font-black text-streamflow-cyan uppercase tracking-[0.1em] leading-none drop-shadow-[0_0_3px_rgba(0,255,255,0.5)]">History</span>
                        <span className="text-white/10 text-[8px] font-black">]</span>
                      </div>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <Spinner size="sm" />
                  </div>
                ) : error ? (
                  <ErrorMessage message={error} />
                ) : watchHistory.length === 0 ? (
                  <div className="text-center py-16 bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">No Activity Detected</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {watchHistory.map((item, index) => (
                      <div
                        key={`${item.tmdb_id}-${item.media_type}-${item.season_number}-${item.episode_number}-${index}`}
                        className="flex items-center justify-between p-2 pl-3 bg-white/[0.01] rounded-xl hover:bg-white/[0.03] transition-all duration-500 border border-white/5 hover:border-streamflow-cyan/20 cursor-pointer group"
                        onClick={() => handleResumeWatch(item)}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Poster Thumbnail - Smaller and cleaner */}
                          <div className="relative w-10 h-14 md:w-12 md:h-16 rounded overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-streamflow-cyan/30 transition-all duration-500">
                            {item.poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-streamflow-navy flex items-center justify-center">
                                <span className="text-gray-700 text-[8px] font-black uppercase">N/A</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="text-white text-sm md:text-base font-black truncate group-hover:text-streamflow-cyan transition-colors duration-500 tracking-tight uppercase">
                                {item.title || `ID: ${item.tmdb_id}`}
                              </h3>
                              <span className="bg-white/5 border border-white/5 px-1.5 py-0.5 rounded-[4px] text-[8px] font-black text-gray-400 uppercase flex-shrink-0 group-hover:text-streamflow-cyan group-hover:border-streamflow-cyan/20 transition-all">
                                {item.media_type}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              {item.media_type === 'tv' && item.season_number && item.episode_number && (
                                <p className="text-streamflow-cyan font-black text-[10px] uppercase tracking-wider">
                                  S{item.season_number}E{item.episode_number}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-[10px] text-gray-600 uppercase font-bold tracking-widest">
                                <span>{formatPosition(item.last_position)}</span>
                                <span className="w-1 h-1 rounded-full bg-white/10 group-hover:bg-streamflow-cyan/30 transition-colors"></span>
                                <span>{formatDate(item.watched_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button className="hidden md:flex ml-4 px-5 py-2 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-streamflow-navy group-hover:bg-streamflow-cyan group-hover:border-streamflow-cyan group-hover:shadow-cyan-glow transition-all duration-500 flex-shrink-0">
                          Resume
                        </button>

                        {/* Mobile Icon Only */}
                        <div className="md:hidden p-2 text-streamflow-cyan">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                          </svg>
                        </div>
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
