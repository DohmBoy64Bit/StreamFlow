import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { getTVDetails, getSeasonDetails } from '../services/tv';
import { getUserLists, addItemToList } from '../services/lists';
import { useAuth } from '../hooks/useAuth';

const Show = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lists, setLists] = useState([]);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [addingToList, setAddingToList] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedSeason, setExpandedSeason] = useState(null);
  const [seasonDetails, setSeasonDetails] = useState({});
  const [loadingSeason, setLoadingSeason] = useState(null);

  const fetchShowDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTVDetails(id);
      setShow(data);
    } catch (err) {
      setError('Failed to load TV show details. Please try again.');
      console.error('TV show details error:', err);
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
    fetchShowDetails();
    if (isAuthenticated) {
      fetchUserLists();
    }
  }, [fetchShowDetails, fetchUserLists, isAuthenticated]);

  const fetchSeasonDetails = async (seasonNumber) => {
    if (seasonDetails[seasonNumber]) return;

    setLoadingSeason(seasonNumber);
    try {
      const data = await getSeasonDetails(id, seasonNumber);
      setSeasonDetails((prev) => ({ ...prev, [seasonNumber]: data }));
    } catch (err) {
      console.error('Failed to fetch season details:', err);
    } finally {
      setLoadingSeason(null);
    }
  };

  const handleSeasonClick = (seasonNumber) => {
    if (expandedSeason === seasonNumber) {
      setExpandedSeason(null);
    } else {
      setExpandedSeason(seasonNumber);
      fetchSeasonDetails(seasonNumber);
    }
  };

  const handleAddToList = async (listId) => {
    setAddingToList(true);
    setSuccessMessage('');

    try {
      await addItemToList(listId, parseInt(id), 'tv');
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

  const handleWatchEpisode = (seasonNumber, episodeNumber) => {
    navigate(`/watch/tv/${id}?season=${seasonNumber}&episode=${episodeNumber}`);
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

  if (error || !show) {
    return (
      <div className="min-h-screen bg-netflix-black pb-20 md:pb-0">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <ErrorMessage message={error || 'TV show not found'} onRetry={fetchShowDetails} />
        </div>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  const imageBaseUrl = 'https://image.tmdb.org/t/p/original';
  const posterBaseUrl = 'https://image.tmdb.org/t/p/w500';
  const backdropPath = show.backdrop_path || show.poster_path;
  const firstAirYear = show.first_air_date
    ? new Date(show.first_air_date).getFullYear()
    : 'N/A';

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
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-2 md:mb-4">{show.name}</h1>
            <div className="flex items-center gap-2 md:gap-4 text-sm md:text-base text-gray-300 mb-4 md:mb-6">
              <span className="text-yellow-400 font-semibold">
                ⭐ {show.vote_average?.toFixed(1) || 'N/A'}
              </span>
              <span>{firstAirYear}</span>
              {show.number_of_seasons && (
                <span>{show.number_of_seasons} Season{show.number_of_seasons > 1 ? 's' : ''}</span>
              )}
            </div>
            <div className="flex gap-4 mb-4">
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setShowListDropdown(!showListDropdown)}
                    className="btn-secondary px-6 py-3"
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

      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              {show.overview || 'No overview available.'}
            </p>

            {show.genres && show.genres.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {show.genres.map((genre) => (
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

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Seasons & Episodes</h3>
              <div className="space-y-4">
                {show.seasons?.map((season) => (
                  <div key={season.id} className="bg-netflix-gray-dark rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleSeasonClick(season.season_number)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-opacity-80 transition"
                    >
                      <div className="flex items-center gap-4">
                        {season.poster_path && (
                          <img
                            src={`${posterBaseUrl}${season.poster_path}`}
                            alt={season.name}
                            className="w-16 h-24 object-cover rounded"
                          />
                        )}
                        <div>
                          <h4 className="text-white font-semibold text-lg">{season.name}</h4>
                          <p className="text-gray-400 text-sm">
                            {season.episode_count} Episode{season.episode_count > 1 ? 's' : ''}
                          </p>
                          {season.air_date && (
                            <p className="text-gray-500 text-xs">{season.air_date}</p>
                          )}
                        </div>
                      </div>
                      <svg
                        className={`w-6 h-6 text-white transition-transform ${
                          expandedSeason === season.season_number ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>

                    {expandedSeason === season.season_number && (
                      <div className="border-t border-gray-700 p-4">
                        {loadingSeason === season.season_number ? (
                          <div className="text-center py-4">
                            <div className="inline-block w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : seasonDetails[season.season_number]?.episodes ? (
                          <div className="space-y-3">
                            {seasonDetails[season.season_number].episodes.map((episode) => (
                              <div
                                key={episode.id}
                                className="flex gap-4 p-3 bg-black bg-opacity-30 rounded hover:bg-opacity-50 transition"
                              >
                                {episode.still_path && (
                                  <img
                                    src={`${posterBaseUrl}${episode.still_path}`}
                                    alt={episode.name}
                                    className="w-32 h-20 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h5 className="text-white font-medium">
                                        {episode.episode_number}. {episode.name}
                                      </h5>
                                      {episode.runtime && (
                                        <p className="text-gray-500 text-xs">{episode.runtime} min</p>
                                      )}
                                    </div>
                                    <button
                                      onClick={() =>
                                        handleWatchEpisode(season.season_number, episode.episode_number)
                                      }
                                      className="btn-primary px-4 py-1 text-sm"
                                    >
                                      ▶ Watch
                                    </button>
                                  </div>
                                  {episode.overview && (
                                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                                      {episode.overview}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-center py-4">No episode data available</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            {show.poster_path && (
              <img
                src={`${posterBaseUrl}${show.poster_path}`}
                alt={show.name}
                className="w-full rounded-lg shadow-xl mb-6"
              />
            )}
            <div className="bg-netflix-gray-dark p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4">Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">First Air Date:</span>
                  <span className="text-white ml-2">{show.first_air_date || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Rating:</span>
                  <span className="text-white ml-2">
                    {show.vote_average?.toFixed(1) || 'N/A'} / 10
                  </span>
                </div>
                {show.number_of_seasons && (
                  <div>
                    <span className="text-gray-500">Seasons:</span>
                    <span className="text-white ml-2">{show.number_of_seasons}</span>
                  </div>
                )}
                {show.number_of_episodes && (
                  <div>
                    <span className="text-gray-500">Episodes:</span>
                    <span className="text-white ml-2">{show.number_of_episodes}</span>
                  </div>
                )}
                {show.status && (
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="text-white ml-2">{show.status}</span>
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

export default Show;
