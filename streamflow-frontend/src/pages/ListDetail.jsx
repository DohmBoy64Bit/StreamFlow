import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import MovieCard from '../components/MovieCard';
import Spinner from '../components/Spinner';
import { getListDetails, removeItemFromList, updateListIcon } from '../services/lists';
import { getMovieDetails } from '../services/movies';
import { getTVDetails } from '../services/tv';
import { API_BASE_URL } from '../utils/constants';

const ListDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const fetchListDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getListDetails(id);
      setList(data);

      if (data.items && data.items.length > 0) {
        const enrichedItems = await Promise.all(
          data.items.map(async (item) => {
            try {
              let details;
              if (item.media_type === 'movie') {
                details = await getMovieDetails(item.tmdb_id);
              } else if (item.media_type === 'tv') {
                details = await getTVDetails(item.tmdb_id);
              }

              return {
                ...item,
                ...details,
                item_id: item.id, // Preserve the list item's UUID for deletion
                id: item.tmdb_id, // Use TMDB ID for MovieCard
              };
            } catch (err) {
              console.error(`Failed to fetch details for item ${item.tmdb_id}:`, err);
              return {
                ...item,
                item_id: item.id, // Preserve the list item's UUID for deletion
                id: item.tmdb_id, // Use TMDB ID for MovieCard
                title: item.media_type === 'movie' ? 'Unknown Movie' : 'Unknown Show',
                name: item.media_type === 'tv' ? 'Unknown Show' : undefined,
              };
            }
          })
        );
        setItems(enrichedItems);
      } else {
        setItems([]);
      }
    } catch (err) {
      setError('Failed to load list details. Please try again.');
      console.error('List details error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchListDetails();
  }, [fetchListDetails]);

  const handleRemoveClick = (itemId, title) => {
    setItemToRemove({ id: itemId, title });
    setShowConfirmModal(true);
  };

  const handleConfirmRemove = async () => {
    if (!itemToRemove) return;

    setShowConfirmModal(false);
    setRemovingItem(itemToRemove.id);

    try {
      await removeItemFromList(id, itemToRemove.id);
      await fetchListDetails();
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item. Please try again.');
    } finally {
      setRemovingItem(null);
      setItemToRemove(null);
    }
  };

  const handleCancelRemove = () => {
    setShowConfirmModal(false);
    setItemToRemove(null);
  };

  const handleItemClick = (item) => {
    if (item.media_type === 'movie') {
      navigate(`/movie/${item.tmdb_id}`);
    } else if (item.media_type === 'tv') {
      navigate(`/show/${item.tmdb_id}`);
    }
  };

  const handleIconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingIcon(true);
    try {
      const updatedList = await updateListIcon(id, file);
      setList(updatedList);
    } catch (err) {
      console.error('Failed to upload icon:', err);
      setError('Failed to upload icon. Please try again.');
    } finally {
      setUploadingIcon(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-streamflow-navy pb-20 md:pb-0">
      <Navbar />

      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-7xl">
        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center">
            <Spinner size="md" />
            <p className="text-[10px] font-black text-gray-600 mt-4 uppercase tracking-widest animate-pulse">Scanning Collection Matrix</p>
          </div>
        ) : error || !list ? (
          /* Error State */
          <div className="animate-fadeIn">
            <div className="card p-4 mb-6 bg-red-900/20 border-red-500/10">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-xs font-bold uppercase tracking-tight">{error || 'Access Denied: Record Not Found'}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/lists')}
              className="glass-panel px-5 py-2 border-white/5 rounded-lg text-white font-black hover:bg-white/[0.05] transition-all duration-300 flex items-center gap-2 text-[10px] uppercase tracking-widest"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
              Return to Archives
            </button>
          </div>
        ) : (
          <div className="animate-fadeIn">
            {/* Ultra-Compact Back Button */}
            <button
              onClick={() => navigate('/lists')}
              className="glass-panel px-3 py-1.5 border-white/5 rounded-lg text-streamflow-cyan hover:bg-white/[0.05] transition-all duration-300 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-6 inline-flex"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Lists
            </button>

            {/* Cinematic Hero Header - Redesigned to eliminate dead space */}
            <div className="card mb-8 border-white/5 relative overflow-hidden group min-h-[160px] md:min-h-[180px] flex items-stretch">
              {/* Background Glows */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-streamflow-cyan/5 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-streamflow-cyan/10 transition-all duration-700"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-streamflow-cyan/5 blur-[80px] rounded-full -ml-32 -mb-32"></div>

              {/* Dynamic Poster Collage (Right Side - Fills dead space) */}
              <div
                className="absolute right-0 top-0 bottom-0 w-3/5 md:w-1/2 hidden sm:grid grid-cols-3 gap-3 p-4 opacity-25 pointer-events-none skew-x-[-12deg] translate-x-12 overflow-hidden"
                style={{ maskImage: 'linear-gradient(to right, transparent, black 40%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }}
              >
                {items.slice(0, 9).map((item, idx) => (
                  <div
                    key={`collage-${idx}`}
                    className="aspect-[2/3] rounded-lg bg-cover bg-center grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 border border-white/5"
                    style={{
                      backgroundImage: `url(https://image.tmdb.org/t/p/w300${item.poster_path})`,
                      animationDelay: `${idx * 100}ms`
                    }}
                  />
                ))}
              </div>

              {/* Smoother Transition Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-streamflow-navy via-streamflow-navy/95 to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-3/4 md:w-3/5 bg-gradient-to-l from-transparent via-streamflow-navy/30 to-streamflow-navy pointer-events-none" />

              {/* Content Area */}
              <div className="relative z-10 flex-1 p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  {/* Collection Icon - Click to Upload */}
                  <div
                    className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-streamflow-cyan/20 to-transparent flex items-center justify-center text-streamflow-cyan flex-shrink-0 border border-streamflow-cyan/20 shadow-lg shadow-streamflow-cyan/10 group/icon cursor-pointer overflow-hidden"
                    onClick={() => document.getElementById('icon-upload').click()}
                  >
                    {uploadingIcon ? (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <Spinner size="sm" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/0 group-hover/icon:bg-black/40 flex items-center justify-center z-10 transition-colors">
                        <svg className="w-5 h-5 text-white opacity-0 group-hover/icon:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    )}

                    {list.icon_url ? (
                      <img
                        src={`${API_BASE_URL}${list.icon_url}`}
                        alt={list.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    )}

                    <input
                      id="icon-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleIconUpload}
                    />
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-streamflow-cyan/10 rounded border border-streamflow-cyan/20">
                        <div className="w-1 h-1 rounded-full bg-streamflow-cyan animate-pulse" />
                        <span className="text-[8px] font-black text-streamflow-cyan uppercase tracking-[0.15em]">Active Vault</span>
                      </div>
                      <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest bg-white/[0.03] px-2 py-0.5 rounded border border-white/5">ARCHIVE ID: {id?.slice(0, 8)}</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tighter truncate leading-none">
                      {list.name}
                    </h1>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                        <div className="flex flex-col">
                          <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Total Objects</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-streamflow-cyan text-lg md:text-xl font-black tracking-tighter leading-none">{items.length}</span>
                            <span className="text-gray-500 text-[8px] font-black uppercase tracking-tight leading-none pt-0.5">Records</span>
                          </div>
                        </div>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex flex-col">
                          <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Protocol Date</span>
                          <span className="text-gray-400 text-[10px] font-black uppercase tracking-tight leading-none">{formatDate(list.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Diagnostics (Right Side) */}
                <div className="hidden lg:flex flex-col items-end justify-center pr-4 gap-3 animate-fadeIn">
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 backdrop-blur-md flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[7px] font-black text-gray-600 uppercase tracking-widest mb-0.5">Media Integrity</div>
                        <div className="text-[9px] font-black text-streamflow-cyan uppercase tracking-tighter leading-none">Synchronized • Encrypted</div>
                      </div>
                      <div className="relative">
                        <div className="w-1.5 h-1.5 rounded-full bg-streamflow-cyan animate-pulse shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
                        <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-streamflow-cyan animate-ping opacity-50" />
                      </div>
                    </div>
                    <div className="h-px w-full bg-white/5" />
                    <div className="text-[7px] font-black text-gray-700 uppercase tracking-[0.35em] leading-none">Security Protocol: v2.04</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Header - Compact */}
            <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
              <h2 className="text-lg md:text-xl font-black text-white tracking-tighter uppercase">
                Collection <span className="text-streamflow-cyan">Items</span>
              </h2>
              <span className="text-[9px] font-black text-streamflow-cyan bg-streamflow-cyan/5 px-2 py-0.5 rounded border border-streamflow-cyan/10 uppercase tracking-widest">
                {items.length} {items.length === 1 ? 'Media Object' : 'Media Objects'}
              </span>
            </div>

            {/* Grid */}
            {items.length === 0 ? (
              /* Empty State - Compact */
              <div className="text-center py-16 glass-panel border-white/5 rounded-3xl">
                <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tight">System Empty</h3>
                <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">No objects detected in this sector</p>
              </div>
            ) : (
              /* Items Grid - Compact Density */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                {items.map((item) => (
                  <div key={item.item_id} className="relative group animate-fadeIn">
                    <MovieCard
                      item={item}
                      onClick={() => handleItemClick(item)}
                    />
                    {/* Remove Button Overlay - Compact */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveClick(item.item_id, item.title || item.name);
                      }}
                      disabled={removingItem === item.item_id}
                      className="absolute top-2 right-2 bg-red-600/90 backdrop-blur-sm hover:bg-red-700 text-white px-2.5 py-1 rounded-md text-[9px] font-black uppercase opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50 shadow-lg flex items-center gap-1.5 z-10"
                    >
                      {removingItem === item.item_id ? (
                        <>
                          <svg className="animate-spin w-2.5 h-2.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Purging
                        </>
                      ) : (
                        <>
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Purge
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal - Compact Refinement */}
      {showConfirmModal && itemToRemove && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-fadeIn">
          <div className="card max-w-sm w-full p-6 md:p-8 border-red-500/10 bg-streamflow-navy shadow-2xl relative overflow-hidden animate-slideUp">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full"></div>

            <div className="relative z-10">
              {/* Icon - Compact */}
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/5">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              {/* Content - Compact */}
              <h2 className="text-xl md:text-2xl font-black text-white mb-1 tracking-tight text-center uppercase">
                Purge <span className="text-red-500">Record</span>?
              </h2>
              <p className="text-gray-600 text-center text-[10px] font-black uppercase tracking-widest mb-4 italic">Confirm Terminal Deletion</p>

              <div className="bg-black/20 p-3 rounded-lg border border-white/5 mb-6">
                <p className="text-white text-center font-black text-sm truncate">
                  "{itemToRemove.title}"
                </p>
              </div>

              {/* Buttons - Compact */}
              <div className="flex gap-2.5">
                <button
                  onClick={handleCancelRemove}
                  className="flex-1 glass-panel py-3 border-white/5 rounded-lg text-white font-black text-xs uppercase hover:bg-white/[0.05] transition-all"
                >
                  Abort
                </button>
                <button
                  onClick={handleConfirmRemove}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-lg text-white font-black transition-all shadow-lg text-xs uppercase flex items-center justify-center gap-2"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <MobileNav />
    </div>
  );
};

export default ListDetail;
