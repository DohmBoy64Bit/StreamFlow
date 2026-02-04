import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { getTVDetails, getSeasonDetails } from '../services/tv';
import { getUserLists, addItemToList, getListDetails, removeItemFromList } from '../services/lists';
import { useAuth } from '../hooks/useAuth';

const Show = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lists, setLists] = useState([]);
  const [listsWithItem, setListsWithItem] = useState(new Set());
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [addingToList, setAddingToList] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [seasonDetails, setSeasonDetails] = useState({});
  const [loadingSeason, setLoadingSeason] = useState(false);

  const fetchShowDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTVDetails(id);
      setShow(data);
      if (data.seasons && data.seasons.length > 0) {
        // Find the first actual season (usually season 1, skip season 0 specials if possible)
        const firstSeason = data.seasons.find(s => s.season_number > 0) || data.seasons[0];
        setSelectedSeason(firstSeason.season_number);
        fetchSeasonDetails(firstSeason.season_number);
      }
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

      const listsContainingItem = new Set();
      for (const list of data || []) {
        try {
          const listDetails = await getListDetails(list.id);
          const hasItem = listDetails.items?.some(
            (item) => item.tmdb_id === parseInt(id) && item.media_type === 'tv'
          );
          if (hasItem) {
            const listItem = listDetails.items.find(
              (item) => item.tmdb_id === parseInt(id) && item.media_type === 'tv'
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
    fetchShowDetails();
    if (isAuthenticated) {
      fetchUserLists();
    }
  }, [fetchShowDetails, fetchUserLists, isAuthenticated]);

  const fetchSeasonDetails = async (seasonNumber) => {
    if (seasonDetails[seasonNumber]) return;

    setLoadingSeason(true);
    try {
      const data = await getSeasonDetails(id, seasonNumber);
      setSeasonDetails((prev) => ({ ...prev, [seasonNumber]: data }));
    } catch (err) {
      console.error('Failed to fetch season details:', err);
    } finally {
      setLoadingSeason(false);
    }
  };

  const handleSeasonChange = (seasonNumber) => {
    const num = parseInt(seasonNumber);
    setSelectedSeason(num);
    fetchSeasonDetails(num);
  };

  const handleAddToList = async (listId) => {
    setAddingToList(true);
    setSuccessMessage('');

    try {
      await addItemToList(listId, parseInt(id), 'tv');
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

  const handleWatchEpisode = (seasonNumber, episodeNumber) => {
    navigate(`/watch/tv/${id}?season=${seasonNumber}&episode=${episodeNumber}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-streamflow-navy">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <Spinner size="md" />
          <p className="text-gray-600 mt-4 font-black uppercase tracking-widest animate-pulse text-xs">Syncing series data</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="min-h-screen bg-streamflow-navy">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="glass-panel p-8 max-w-lg mx-auto border-red-500/10">
            <h2 className="text-xl font-black text-white mb-2 tracking-tight">Signal Interrupted</h2>
            <p className="text-gray-400 mb-6 text-sm">{error || 'Unable to locate series data.'}</p>
            <button
              onClick={fetchShowDetails}
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
  const backdropPath = show.backdrop_path || show.poster_path;
  const firstAirYear = show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A';
  const isInAnyList = listsWithItem.size > 0;
  const currentSeasonData = seasonDetails[selectedSeason];

  return (
    <div className="min-h-screen bg-streamflow-navy pb-20 md:pb-0">
      <Navbar />

      {/* Hero Header Section - Reduced Scale */}
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
                TV SERIES
              </span>
              <div className="flex items-center gap-1 glass-panel px-2 py-0.5 rounded border-white/5">
                <span className="text-yellow-400 font-black text-[10px]">⭐ {show.vote_average?.toFixed(1) || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1 glass-panel px-2 py-0.5 rounded border-white/5">
                <span className="text-gray-300 font-black text-[10px] uppercase tracking-wider">{firstAirYear}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tighter leading-tight animate-slideUp drop-shadow-xl max-w-3xl">
              {show.name}
            </h1>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-slideUp">
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
            {/* Overview - More Compact */}
            <section>
              <h2 className="text-xl font-black text-white mb-4 uppercase tracking-tighter flex items-center gap-2">
                <span className="w-1.5 h-6 bg-streamflow-cyan rounded-full"></span>
                Overview
              </h2>
              <p className="text-gray-400 text-base md:text-lg leading-relaxed font-medium">
                {show.overview || 'Synopsis unavailable.'}
              </p>
            </section>

            {/* Seasons & Episodes - DROP DOWN SYSTEM */}
            <section className="animate-slideUp">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 border-b border-white/5 pb-6">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-streamflow-cyan rounded-full"></span>
                  Seasons
                </h2>

                {/* Season Selector Dropdown */}
                <div className="relative w-full sm:w-auto min-w-[180px]">
                  <select
                    value={selectedSeason || ''}
                    onChange={(e) => handleSeasonChange(e.target.value)}
                    className="w-full bg-streamflow-navy-light text-white font-black py-2.5 px-4 rounded-lg border border-white/10 outline-none focus:border-streamflow-cyan transition-colors text-xs uppercase tracking-widest appearance-none cursor-pointer pr-10"
                  >
                    {show.seasons?.map((season) => (
                      <option key={season.id} value={season.season_number}>
                        {season.name} ({season.episode_count} EPS)
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Episode List for Selected Season */}
              <div className="space-y-3">
                {loadingSeason ? (
                  <div className="py-20 flex flex-col items-center">
                    <Spinner size="sm" />
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-4">Buffer Loading...</p>
                  </div>
                ) : currentSeasonData?.episodes ? (
                  <div className="grid grid-cols-1 gap-3">
                    {currentSeasonData.episodes.map((episode) => (
                      <div
                        key={episode.id}
                        className="glass-panel border-white/5 p-4 rounded-xl flex flex-col md:flex-row gap-4 hover:bg-white/[0.03] transition-all group border-l-2 border-l-transparent hover:border-l-streamflow-cyan"
                      >
                        <div className="relative md:w-36 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-streamflow-navy">
                          {episode.still_path ? (
                            <img
                              src={`${posterBaseUrl}${episode.still_path}`}
                              alt={episode.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-20">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                          )}
                          <button
                            onClick={() => handleWatchEpisode(selectedSeason, episode.episode_number)}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <div className="w-8 h-8 bg-streamflow-cyan text-streamflow-navy rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                          </button>
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <div>
                              <h3 className="text-white font-black text-sm md:text-base group-hover:text-streamflow-cyan transition-colors line-clamp-1">
                                <span className="text-streamflow-cyan/40 mr-2">{episode.episode_number}</span>
                                {episode.name}
                              </h3>
                              <div className="flex items-center gap-3 text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">
                                {episode.runtime && <span>{episode.runtime} MIN</span>}
                                {episode.air_date && <span className="border-l border-white/10 pl-3">{episode.air_date}</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => handleWatchEpisode(selectedSeason, episode.episode_number)}
                              className="hidden sm:block glass-panel px-4 py-1.5 rounded-lg text-white font-black text-[10px] uppercase tracking-widest hover:bg-streamflow-cyan hover:text-streamflow-navy transition-all"
                            >
                              Play
                            </button>
                          </div>
                          {episode.overview && (
                            <p className="text-gray-500 text-[11px] leading-relaxed font-medium line-clamp-1 italic">
                              {episode.overview}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center glass-panel border-white/5 rounded-xl">
                    <p className="text-gray-600 text-xs font-black uppercase tracking-widest">Season data classified</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar - More Compact */}
          <div className="space-y-6">
            <div className="relative group lg:sticky lg:top-24">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-streamflow-cyan/20 to-streamflow-blue/20 rounded-2xl blur opacity-30"></div>
              {show.poster_path && (
                <img
                  src={`${posterBaseUrl}${show.poster_path}`}
                  alt={show.name}
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
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Protocol</span>
                    <span className="text-white font-black text-sm">{show.status || 'Active'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Episodes</span>
                      <span className="text-gray-300 font-black text-sm">{show.number_of_episodes || 'UNK'}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Seasons</span>
                      <span className="text-gray-300 font-black text-sm">{show.number_of_seasons || 'UNK'}</span>
                    </div>
                  </div>

                  {show.genres && show.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {show.genres.slice(0, 3).map(g => (
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
                        S_{show.id}
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

export default Show;
