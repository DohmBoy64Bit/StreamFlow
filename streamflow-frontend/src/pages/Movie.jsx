import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { getMovieDetails } from '../services/movies';
import { getUserLists, addItemToList, getListDetails, removeItemFromList } from '../services/lists';
import { useAuth } from '../hooks/useAuth';

const Movie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lists, setLists] = useState([]);
  const [listsWithItem, setListsWithItem] = useState(new Set());
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

      const listsContainingItem = new Set();
      for (const list of data || []) {
        try {
          const listDetails = await getListDetails(list.id);
          const hasItem = listDetails.items?.some(
            item => item.tmdb_id === parseInt(id) && item.media_type === 'movie'
          );
          if (hasItem) {
            const listItem = listDetails.items.find(
              item => item.tmdb_id === parseInt(id) && item.media_type === 'movie'
            );
            listsContainingItem.add(list.id);
            list.itemId = listItem?.id;
          }
        } catch (err) {
          console.error(`Failed to fetch details for list ${list.id}:`, err);
        }
      }
      setListsWithItem(listsContainingItem);
    } catch (err) {
      console.error('Failed to fetch lists:', err);
    }
  }, [id]);

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
      setSuccessMessage('Added to collection!');
      setShowListDropdown(false);
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchUserLists();
    } catch (err) {
      console.error('Failed to add to list:', err);
      setSuccessMessage('Failed to add.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setAddingToList(false);
    }
  };

  const handleRemoveFromList = async (listId, itemId) => {
    setAddingToList(true);
    setSuccessMessage('');

    try {
      await removeItemFromList(listId, itemId);
      setSuccessMessage('Removed from collection!');
      setShowListDropdown(false);
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchUserLists();
    } catch (err) {
      console.error('Failed to remove from list:', err);
      setSuccessMessage('Failed to remove.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setAddingToList(false);
    }
  };

  const handleWatch = () => {
    navigate(`/watch/movie/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-streamflow-navy">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <Spinner size="md" />
          <p className="text-gray-600 mt-4 font-black uppercase tracking-widest animate-pulse text-xs">Syncing media data</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-streamflow-navy">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="glass-panel p-8 max-w-lg mx-auto border-red-500/10">
            <h2 className="text-xl font-black text-white mb-2 tracking-tight">Signal Interrupted</h2>
            <p className="text-gray-400 mb-6 text-sm">{error || 'Unable to locate media file.'}</p>
            <button
              onClick={fetchMovieDetails}
              className="btn-primary px-8 py-3 font-black uppercase tracking-wider text-xs"
            >
              Retry Connection
            </button>
          </div>
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
  const isInAnyList = listsWithItem.size > 0;

  return (
    <div className="min-h-screen bg-streamflow-navy pb-20 md:pb-0">
      <Navbar />

      {/* Hero Header Section - Balanced Scale */}
      <div className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-100 animate-slowZoom"
          style={{ backgroundImage: `url(${imageBaseUrl}${backdropPath})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-streamflow-navy via-streamflow-navy/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-streamflow-navy via-transparent to-transparent hidden md:block" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-16 z-10">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-wrap items-center gap-2 mb-4 animate-slideUp">
              <span className="bg-streamflow-cyan px-2 py-0.5 rounded text-[8px] font-black text-streamflow-navy uppercase tracking-widest shadow-cyan-glow">
                MOVIE
              </span>
              <div className="flex items-center gap-1 glass-panel px-2 py-0.5 rounded border-white/5">
                <span className="text-yellow-400 font-black text-[10px]">⭐ {movie.vote_average?.toFixed(1) || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1 glass-panel px-2 py-0.5 rounded border-white/5">
                <span className="text-gray-300 font-black text-[10px] uppercase tracking-wider">{releaseYear}</span>
              </div>
              {movie.runtime && (
                <div className="flex items-center gap-1 glass-panel px-2 py-0.5 rounded border-white/5">
                  <span className="text-gray-300 font-black text-[10px] uppercase tracking-wider">{movie.runtime}m</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tighter leading-tight animate-slideUp drop-shadow-xl max-w-3xl">
              {movie.title}
            </h1>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-slideUp">
              <button
                onClick={handleWatch}
                className="btn-primary px-8 py-3 text-sm md:text-base font-black tracking-tight shadow-cyan-glow/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
              </button>

              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setShowListDropdown(!showListDropdown)}
                    className={`glass-panel px-6 py-3 border-white/5 rounded-lg text-white font-black hover:bg-white/[0.05] transition-all duration-300 flex items-center gap-2 text-xs uppercase tracking-wider ${isInAnyList ? 'text-red-400 border-red-500/20' : ''
                      }`}
                    disabled={addingToList}
                  >
                    {isInAnyList ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    {isInAnyList ? 'Remove from List' : 'Add to Collection'}
                  </button>

                  {showListDropdown && (
                    <div className="absolute top-full left-0 mt-2 glass-panel rounded-xl shadow-2xl min-w-[240px] z-[100] overflow-hidden border border-white/5 backdrop-blur-2xl animate-slideUp">
                      {lists.length === 0 ? (
                        <div className="p-4 text-center">
                          <p className="text-gray-500 text-[10px] font-bold uppercase mb-2">No collections</p>
                          <button onClick={() => navigate('/lists')} className="text-streamflow-cyan text-[10px] font-black uppercase hover:underline">Create List</button>
                        </div>
                      ) : (
                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                          {lists.map((list) => {
                            const isInList = listsWithItem.has(list.id);
                            return (
                              <button
                                key={list.id}
                                onClick={() => isInList ? handleRemoveFromList(list.id, list.itemId) : handleAddToList(list.id)}
                                className={`block w-full text-left px-4 py-3 transition-all duration-300 flex items-center justify-between gap-3 group ${isInList ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-streamflow-cyan/5'
                                  }`}
                              >
                                <span className={`font-black text-xs tracking-tight ${isInList ? 'text-red-400' : 'text-white'}`}>
                                  {list.name}
                                </span>
                                {isInList ? (
                                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-gray-600 group-hover:text-streamflow-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                  </svg>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {successMessage && (
              <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[110] px-6 py-3 rounded-lg font-black uppercase tracking-widest text-[10px] shadow-2xl animate-slideUp backdrop-blur-xl border ${successMessage.includes('Failed') ? 'bg-red-600/90 text-white border-red-500/20' : 'bg-streamflow-cyan/90 text-streamflow-navy border-cyan-400/20'
                }`}>
                {successMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-8 md:py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">

          {/* Main Info Columns */}
          <div className="lg:col-span-3 space-y-10">
            {/* Overview */}
            <section>
              <h2 className="text-xl font-black text-white mb-4 uppercase tracking-tighter flex items-center gap-2">
                <span className="w-1.5 h-6 bg-streamflow-cyan rounded-full"></span>
                Overview
              </h2>
              <p className="text-gray-400 text-base md:text-lg leading-relaxed font-medium">
                {movie.overview || 'Synopsis unavailable.'}
              </p>
            </section>

            {/* Cast Grid - Slightly more compact */}
            {movie.credits?.cast && movie.credits.cast.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-streamflow-cyan rounded-full"></span>
                    Cast
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {movie.credits.cast.slice(0, 10).map((actor) => (
                    <div key={actor.id} className="group">
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2 border border-white/5 bg-streamflow-navy">
                        {actor.profile_path ? (
                          <img
                            src={`${posterBaseUrl}${actor.profile_path}`}
                            alt={actor.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-10">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                          </div>
                        )}
                      </div>
                      <h4 className="text-white font-black text-xs tracking-tight truncate group-hover:text-streamflow-cyan transition-colors">{actor.name}</h4>
                      <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest truncate">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Trailer - More compact wrapper */}
            {movie.videos?.results && movie.videos.results.length > 0 && (
              <section>
                <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tighter flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-streamflow-cyan rounded-full"></span>
                  Trailer
                </h3>
                <div className="glass-panel p-2 border-white/5 rounded-2xl overflow-hidden shadow-2xl max-w-3xl">
                  <div className="aspect-video rounded-xl overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${movie.videos.results[0].key}?rel=0&modestbranding=1`}
                      title="Trailer"
                      className="w-full h-full"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar - Balanced Poster & Data */}
          <div className="space-y-6">
            <div className="relative group lg:sticky lg:top-24">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-streamflow-cyan/20 to-streamflow-blue/20 rounded-2xl blur opacity-30"></div>
              {movie.poster_path && (
                <img
                  src={`${posterBaseUrl}${movie.poster_path}`}
                  alt={movie.title}
                  className="relative w-full rounded-2xl shadow-2xl border border-white/5"
                />
              )}

              <div className="glass-panel p-6 border-white/5 rounded-2xl mt-6 relative overflow-hidden backdrop-blur-3xl">
                <h3 className="text-xs font-black text-white mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1 h-3 bg-streamflow-cyan"></span>
                  Details
                </h3>

                <div className="space-y-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Release Date</span>
                    <span className="text-white font-black text-sm">{movie.release_date || 'N/A'}</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Rating</span>
                    <div className="flex items-center gap-2">
                      <span className="text-streamflow-cyan font-black text-sm">{movie.vote_average?.toFixed(1) || '0.0'}</span>
                      <span className="text-gray-600 font-bold text-[10px]">/ 10</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Runtime</span>
                      <span className="text-gray-300 font-black text-sm">{movie.runtime ? `${movie.runtime}M` : 'UNK'}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Status</span>
                      <span className="text-streamflow-cyan font-black text-sm uppercase tracking-tight">{movie.status || 'Active'}</span>
                    </div>
                  </div>

                  {movie.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {movie.genres.slice(0, 3).map(g => (
                        <span key={g.id} className="text-[8px] font-black text-streamflow-cyan uppercase tracking-widest bg-streamflow-cyan/5 border border-streamflow-cyan/10 px-2 py-0.5 rounded">
                          {g.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/5">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest italic">Hash ID</span>
                      <code className="text-[9px] text-gray-500 font-mono break-all opacity-50">
                        M_{movie.id}
                      </code>
                    </div>
                  </div>
                </div>
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
