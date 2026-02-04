import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import Spinner from '../components/Spinner';
import { getUserLists, createList, deleteList } from '../services/lists';
import { API_BASE_URL } from '../utils/constants';

const Lists = () => {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getUserLists();
      setLists(data || []);
    } catch (err) {
      setError('Failed to load lists. Please try again.');
      console.error('Lists error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    setCreating(true);
    try {
      await createList(newListName.trim());
      setNewListName('');
      setShowCreateModal(false);
      await fetchLists();
    } catch (err) {
      console.error('Failed to create list:', err);
      setError('Failed to create list. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteList = async (listId, listName) => {
    if (!window.confirm(`Are you sure you want to delete "${listName}"?`)) return;

    setDeleting(listId);
    try {
      await deleteList(listId);
      await fetchLists();
    } catch (err) {
      console.error('Failed to delete list:', err);
      setError('Failed to delete list. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleListClick = (listId) => {
    navigate(`/lists/${listId}`);
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

      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-6xl">
        {/* Compact Hero Header */}
        <div className="card p-5 md:p-6 mb-8 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-streamflow-cyan/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-streamflow-cyan/10 transition-all duration-700"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight">
                My <span className="text-streamflow-cyan">Lists</span>
              </h1>
              <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest opacity-80">Manage your private collections</p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary py-2.5 px-6 text-xs font-black shadow-cyan-glow/10 flex items-center justify-center gap-2 whitespace-nowrap transition-transform hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
              </svg>
              Create New List
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="card p-4 mb-6 bg-red-900/20 border-red-500/10">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 text-xs font-bold uppercase tracking-tight">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center">
            <Spinner size="md" />
            <p className="text-[10px] font-black text-gray-600 mt-4 uppercase tracking-widest animate-pulse">Accessing Secure Vault</p>
          </div>
        ) : lists.length === 0 ? (
          /* Empty State - Compact */
          <div className="text-center py-16 glass-panel border-white/5 rounded-3xl animate-slideUp">
            <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
              <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-lg font-black text-white mb-1 uppercase tracking-tight">Vault Empty</h2>
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mb-6">Initialize your first media collection</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary py-3 px-8 text-xs font-black shadow-cyan-glow/10 inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
              </svg>
              Create List
            </button>
          </div>
        ) : (
          /* Lists Grid - Compact Density */
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
              <h2 className="text-lg md:text-xl font-black text-white tracking-tighter uppercase">
                Your <span className="text-streamflow-cyan">Collections</span>
              </h2>
              <span className="text-[9px] font-black text-streamflow-cyan bg-streamflow-cyan/5 px-2 py-0.5 rounded border border-streamflow-cyan/10 uppercase tracking-widest">
                {lists.length} {lists.length === 1 ? 'FILE' : 'FILES'} INDEXED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {lists.map((list) => (
                <div
                  key={list.id}
                  className="card border-white/5 bg-white/[0.01] overflow-hidden hover:bg-white/[0.03] hover:border-streamflow-cyan/10 transition-all duration-300 cursor-pointer group flex flex-col"
                  onClick={() => handleListClick(list.id)}
                >
                  {/* Card Content - Compact */}
                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-streamflow-cyan/5 flex items-center justify-center text-streamflow-cyan group-hover:bg-streamflow-cyan/10 transition-colors border border-streamflow-cyan/5 overflow-hidden">
                        {list.icon_url ? (
                          <img
                            src={`${API_BASE_URL}${list.icon_url}`}
                            alt={list.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.parentElement.innerHTML = `
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              `;
                            }}
                          />
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        )}
                      </div>
                      <svg className="w-4 h-4 text-gray-700 group-hover:text-streamflow-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                    <h3 className="text-white text-base md:text-lg font-black mb-1 truncate group-hover:text-streamflow-cyan transition-colors tracking-tight">
                      {list.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-streamflow-cyan text-xl font-black tracking-tighter">{list.item_count || 0}</span>
                      <span className="text-gray-600 text-[9px] font-black uppercase tracking-wider">
                        {list.item_count === 1 ? 'Media Item' : 'Media Items'}
                      </span>
                    </div>

                    <p className="text-gray-600 text-[8px] font-black uppercase tracking-[0.2em] italic">
                      Created {formatDate(list.created_at)}
                    </p>
                  </div>

                  {/* Delete Button - Compact */}
                  <div className="border-t border-white/5 px-5 py-2.5 bg-black/10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteList(list.id, list.name);
                      }}
                      disabled={deleting === list.id}
                      className="text-red-500 hover:text-red-400 text-[10px] font-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {deleting === list.id ? 'Purging...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Modal - Compact Refinement */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-fadeIn">
          <div className="card max-w-sm w-full p-6 md:p-8 border-white/5 shadow-2xl relative overflow-hidden animate-slideUp">
            <div className="absolute top-0 right-0 w-32 h-32 bg-streamflow-cyan/5 blur-3xl rounded-full"></div>

            <div className="relative z-10">
              <h2 className="text-xl md:text-2xl font-black text-white mb-1 tracking-tight">
                Initialize <span className="text-streamflow-cyan">Collection</span>
              </h2>
              <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mb-6 italic">Secure File Creation</p>

              <form onSubmit={handleCreateList}>
                <div className="mb-6">
                  <label className="block text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1.5 ml-1">Protocol: List Name</label>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="e.g., Tactical Favorites"
                    className="w-full px-4 py-3 bg-streamflow-navy-light/50 border border-white/10 text-white rounded-lg focus:border-streamflow-cyan/30 focus:outline-none transition-all font-bold text-sm placeholder:text-gray-600"
                    autoFocus
                    maxLength={100}
                  />
                  <div className="flex justify-between mt-1.5 px-1">
                    <span className="text-[8px] font-black text-gray-700 uppercase">{newListName.length}/100 CHARS</span>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="submit"
                    disabled={!newListName.trim() || creating}
                    className="flex-1 btn-primary py-3 font-black text-xs uppercase shadow-cyan-glow/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    {creating ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Encrypting...
                      </span>
                    ) : 'Initialize'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewListName('');
                    }}
                    className="flex-1 glass-panel py-3 border-white/5 rounded-lg text-white font-black text-xs uppercase hover:bg-white/[0.05] transition-all disabled:opacity-30"
                    disabled={creating}
                  >
                    Abort
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <MobileNav />
    </div>
  );
};

export default Lists;
