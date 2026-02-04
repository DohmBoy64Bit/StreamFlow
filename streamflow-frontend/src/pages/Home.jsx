import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Carousel from '../components/Carousel';
import MobileNav from '../components/MobileNav';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { getTrendingMovies, getPopularMovies, getTopRatedMovies } from '../services/movies';
import { getTrendingTV, getPopularTV } from '../services/tv';
import { getWatchHistory } from '../services/watch';
import { getUserLists } from '../services/lists';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentData, setContentData] = useState({
    trendingMovies: [],
    popularMovies: [],
    topRatedMovies: [],
    trendingTV: [],
    popularTV: [],
    continueWatching: [],
    watchlist: [],
  });

  const fetchAllContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        trendingMoviesData,
        popularMoviesData,
        topRatedMoviesData,
        trendingTVData,
        popularTVData,
      ] = await Promise.all([
        getTrendingMovies(1).catch(() => ({ results: [] })),
        getPopularMovies(1).catch(() => ({ results: [] })),
        getTopRatedMovies(1).catch(() => ({ results: [] })),
        getTrendingTV(1).catch(() => ({ results: [] })),
        getPopularTV(1).catch(() => ({ results: [] })),
      ]);

      const newContentData = {
        trendingMovies: trendingMoviesData.results || [],
        popularMovies: popularMoviesData.results || [],
        topRatedMovies: topRatedMoviesData.results || [],
        trendingTV: trendingTVData.results || [],
        popularTV: popularTVData.results || [],
        continueWatching: [],
        watchlist: [],
      };

      if (isAuthenticated) {
        try {
          const watchHistoryData = await getWatchHistory(10, 0);
          newContentData.continueWatching = watchHistoryData.results || [];
        } catch (err) {
          console.error('Failed to fetch watch history:', err);
        }

        try {
          const listsData = await getUserLists();
          if (listsData && listsData.length > 0) {
            newContentData.watchlist = listsData[0].items || [];
          }
        } catch (err) {
          console.error('Failed to fetch watchlist:', err);
        }
      }

      setContentData(newContentData);
    } catch (err) {
      setError('Failed to load content. Please try again later.');
      console.error('Home content error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAllContent();
  }, [fetchAllContent]);

  const handleItemClick = (item) => {
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    if (mediaType === 'movie') {
      navigate(`/movie/${item.id}`);
    } else {
      navigate(`/show/${item.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-streamflow-navy pb-20 md:pb-0">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <Spinner size="lg" />
        </div>
        <MobileNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-streamflow-navy pb-20 md:pb-0">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <ErrorMessage message={error} onRetry={fetchAllContent} />
        </div>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-streamflow-navy pb-20 md:pb-0">
      <Navbar />

      <div className="relative pt-12 md:pt-20 px-4 mb-2 md:mb-6">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-streamflow-blue/10 blur-[120px] rounded-full opacity-50" />

        <div className="max-w-5xl mx-auto">
          {/* Diagnostic Hero Container */}
          <div className="relative group">
            {/* Technical Border Accents */}
            <div className="absolute -top-px -left-px w-8 h-8 border-t border-l border-streamflow-cyan/30 rounded-tl-xl" />
            <div className="absolute -top-px -right-px w-8 h-8 border-t border-r border-streamflow-cyan/30 rounded-tr-xl" />
            <div className="absolute -bottom-px -left-px w-8 h-8 border-b border-l border-streamflow-cyan/30 rounded-bl-xl" />
            <div className="absolute -bottom-px -right-px w-8 h-8 border-b border-r border-streamflow-cyan/30 rounded-br-xl" />

            <div className="card p-6 md:p-10 border-white/5 bg-white/[0.01] overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12 relative">
              {/* Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] opacity-20" />

              {/* Compact Logo & Meta */}
              <div className="flex-shrink-0 relative">
                <div className="absolute inset-0 bg-streamflow-cyan/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <img
                  src="/assets/mascot.png"
                  alt="StreamFlow Mascot"
                  className="h-16 md:h-20 relative z-10 transition-transform duration-500 group-hover:scale-110"
                  style={{ filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.3))' }}
                />
              </div>

              {/* Technical Readout */}
              <div className="flex-grow text-center md:text-left space-y-4">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <div className="px-2 py-0.5 bg-streamflow-cyan/10 border border-streamflow-cyan/30 rounded-[2px]">
                    <span className="text-[9px] font-black text-streamflow-cyan uppercase tracking-widest leading-none">System Lock: Active</span>
                  </div>
                  <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-[2px]">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">Hub-ID: SF-01</span>
                  </div>
                  <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em] ml-auto hidden lg:block">Data Stream v2.4</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase leading-none">
                  Data Acquisition <span className="text-streamflow-cyan">Hub</span>
                </h1>

                <p className="text-xs md:text-sm text-gray-500 font-medium max-w-md leading-relaxed">
                  Unified interface for cross-platform media synchronization and diagnostic tracking. System operating within optimal parameters.
                </p>

                <div className="pt-2 flex items-center justify-center md:justify-start gap-4">
                  <button
                    onClick={() => navigate('/search')}
                    className="px-6 py-2 bg-streamflow-cyan text-streamflow-navy text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-cyan-glow-intense"
                  >
                    Initiate Search
                  </button>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Uptime</span>
                    <span className="text-[10px] font-black text-streamflow-cyan leading-none">99.9% Nominal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto pb-8 pt-8 md:pt-12 relative z-10">
        {isAuthenticated && contentData.continueWatching.length > 0 && (
          <Carousel
            title="Continue Watching"
            items={contentData.continueWatching}
            onItemClick={handleItemClick}
          />
        )}

        <Carousel
          title="Trending Movies"
          items={contentData.trendingMovies}
          onItemClick={handleItemClick}
        />

        <Carousel
          title="Popular Movies"
          items={contentData.popularMovies}
          onItemClick={handleItemClick}
        />

        <Carousel
          title="Top Rated Movies"
          items={contentData.topRatedMovies}
          onItemClick={handleItemClick}
        />

        <Carousel
          title="Trending TV Shows"
          items={contentData.trendingTV}
          onItemClick={handleItemClick}
        />

        <Carousel
          title="Popular TV Shows"
          items={contentData.popularTV}
          onItemClick={handleItemClick}
        />

        {isAuthenticated && contentData.watchlist.length > 0 && (
          <Carousel
            title="Your Watchlist"
            items={contentData.watchlist}
            onItemClick={handleItemClick}
          />
        )}
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default Home;
