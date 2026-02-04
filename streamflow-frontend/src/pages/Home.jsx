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

      <div className="relative h-[50vh] md:h-[65vh] flex items-center justify-center overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-streamflow-blue/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-streamflow-cyan/10 blur-[150px] rounded-full" />

        <div className="text-center px-4 relative z-10 pt-12 md:pt-16">
          <img src="/assets/logo.png" alt="StreamFlow" className="h-32 md:h-40 lg:h-48 mx-auto mb-4 md:mb-8 animate-in zoom-in duration-700" style={{ filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.4))' }} />
          <p className="text-lg md:text-xl lg:text-2xl text-cyan-100/70 mb-6 md:mb-8 font-light tracking-wide">
            Unlimited movies, TV shows, and more
          </p>
          <button
            onClick={() => navigate('/search')}
            className="btn-primary px-8 py-3 md:px-10 md:py-4 text-base md:text-lg"
          >
            Browse Content
          </button>
        </div>
      </div>

      <div className="container mx-auto pb-8 pt-0 -mt-8 md:-mt-12 relative z-10">
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
