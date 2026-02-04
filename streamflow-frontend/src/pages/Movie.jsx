import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { getMovieDetails } from '../services/movies';
import { getUserLists, addItemToList } from '../services/lists';
import { useAuth } from '../hooks/useAuth';

const Movie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lists, setLists] = useState([]);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [addingToList, setAddingToList] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchMovieDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getMovieDetails(id);
      setMovie(data);
    } catch (err) {
      setError('Failed to load movie details. Please try again.');
      console.error('Movie details error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchUserLists = useCallback(async () => {
    try {
      const data = await getUserLists();
      setLists(data || []);
    } catch (err) {
      console.error('Failed to fetch lists:', err);
    }
  }, []);

  useEffect(() => {
    fetchMovieDetails();
    if (isAuthenticated) {
      fetchUserLists();
    }
  }, [fetchMovieDetails, fetchUserLists, isAuthenticated]);

  const handleAddToList = async (listId) => {
    setAddingToList(true);
    setSuccessMessage('');

    try {
      await addItemToList(listId, parseInt(id), 'movie');
      setSuccessMessage('Added to list successfully!');
      setShowListDropdown(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to add to list:', err);
      setSuccessMessage('Failed to add to list.');
    } finally {
      setAddingToList(false);
    }
  };

  const handleWatch = () => {
    navigate(`/watch/movie/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black pb-20 md:pb-0">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <Spinner size="lg" />
        </div>
        <MobileNav />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-netflix-black pb-20 md:pb-0">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <ErrorMessage message={error || 'Movie not found'} onRetry={fetchMovieDetails} />
        </div>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  const imageBaseUrl = 'https://image.tmdb.org/t/p/original';
  const posterBaseUrl = 'https://image.tmdb.org/t/p/w500';
  const backdropPath = movie.backdrop_path || movie.poster_path;
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';

  return (
    <div className="min-h-screen bg-netflix-black pb-20 md:pb-0">
      <Navbar />

      <div
        className="relative h-[50vh] md:h-[70vh] bg-cover bg-center"
        style={{
          backgroundImage: backdropPath
            ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(20,20,20,0.9)), url(${imageBaseUrl}${backdropPath})`
            : 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(20,20,20,1))',
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 lg:p-12">
          <div className="container mx-auto">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-2 md:mb-4">{movie.title}</h1>
            <div className="flex items-center gap-2 md:gap-4 text-sm md:text-base text-gray-300 mb-4 md:mb-6">
              <span className="text-yellow-400 font-semibold">
                ⭐ {movie.vote_average?.toFixed(1) || 'N/A'}
              </span>
              <span>{releaseYear}</span>
              {movie.runtime && <span>{movie.runtime} min</span>}
            </div>
            <div className="flex flex-wrap gap-2 md:gap-4 mb-4">
              <button onClick={handleWatch} className="btn-primary px-4 py-2 md:px-8 md:py-3 text-sm md:text-base lg:text-lg">
                ▶ Watch Now
              </button>
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setShowListDropdown(!showListDropdown)}
                    className="btn-secondary px-4 py-2 md:px-6 md:py-3 text-sm md:text-base"
                    disabled={addingToList}
                  >
                    + Add to List
                  </button>
                  {showListDropdown && (
                    <div className="absolute top-full mt-2 bg-netflix-gray-dark rounded-lg shadow-xl min-w-[200px] z-10">
                      {lists.length === 0 ? (
                        <div className="p-4 text-gray-400 text-sm">No lists yet</div>
                      ) : (
                        lists.map((list) => (
                          <button
                            key={list.id}
                            onClick={() => handleAddToList(list.id)}
                            className="block w-full text-left px-4 py-2 text-white hover:bg-netflix-red transition"
                          >
                            {list.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            {successMessage && (
              <div className="inline-block bg-green-600 text-white px-4 py-2 rounded">
                {successMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-gray-300 leading-relaxed mb-6">{movie.overview || 'No overview available.'}</p>

            {movie.genres && movie.genres.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="bg-netflix-gray-dark px-3 py-1 rounded-full text-gray-300 text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie.credits?.cast && movie.credits.cast.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Cast</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {movie.credits.cast.slice(0, 8).map((actor) => (
                    <div key={actor.id} className="text-center">
                      {actor.profile_path ? (
                        <img
                          src={`${posterBaseUrl}${actor.profile_path}`}
                          alt={actor.name}
                          loading="lazy"
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                      ) : (
                        <div className="w-full h-32 bg-netflix-gray-dark rounded-lg mb-2 flex items-center justify-center">
                          <span className="text-gray-600">No Image</span>
                        </div>
                      )}
                      <p className="text-white text-sm font-medium">{actor.name}</p>
                      <p className="text-gray-500 text-xs">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {movie.videos?.results && movie.videos.results.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Trailer</h3>
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${movie.videos.results[0].key}`}
                    title="Trailer"
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>

          <div className="order-1 lg:order-2">
            {movie.poster_path && (
              <img
                src={`${posterBaseUrl}${movie.poster_path}`}
                alt={movie.title}
                loading="lazy"
                className="w-full max-w-sm mx-auto lg:max-w-full rounded-lg shadow-xl mb-6"
              />
            )}
            <div className="bg-netflix-gray-dark p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4">Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Release Date:</span>
                  <span className="text-white ml-2">{movie.release_date || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Rating:</span>
                  <span className="text-white ml-2">
                    {movie.vote_average?.toFixed(1) || 'N/A'} / 10
                  </span>
                </div>
                {movie.runtime && (
                  <div>
                    <span className="text-gray-500">Runtime:</span>
                    <span className="text-white ml-2">{movie.runtime} minutes</span>
                  </div>
                )}
                {movie.status && (
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="text-white ml-2">{movie.status}</span>
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

export default Movie;
