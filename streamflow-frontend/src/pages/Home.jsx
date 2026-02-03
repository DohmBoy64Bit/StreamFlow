import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Carousel from '../components/Carousel';
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
      <div className="min-h-screen bg-netflix-black">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-block w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-900 bg-opacity-50 border border-red-700 text-white px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />

      <div className="relative h-[80vh] bg-gradient-to-b from-netflix-gray-dark to-netflix-black flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Welcome to StreamFlow
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8">
            Unlimited movies, TV shows, and more
          </p>
          <button
            onClick={() => navigate('/search')}
            className="btn-primary px-8 py-4 text-lg"
          >
            Browse Content
          </button>
        </div>
      </div>

      <div className="container mx-auto py-8">
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
    </div>
  );
};

export default Home;
