import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import { getUserLists, createList, deleteList } from '../services/lists';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black pb-20 md:pb-0">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-block w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black pb-20 md:pb-0">
      <Navbar />

      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">My Lists</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary px-6 py-3"
          >
            + Create New List
          </button>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-50 border border-red-700 text-white px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {lists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-xl mb-4">You haven&apos;t created any lists yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary px-6 py-3"
            >
              Create Your First List
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lists.map((list) => (
              <div
                key={list.id}
                className="bg-netflix-gray-dark rounded-lg overflow-hidden hover:bg-opacity-80 transition cursor-pointer"
              >
                <div
                  onClick={() => handleListClick(list.id)}
                  className="p-6"
                >
                  <h3 className="text-white text-xl font-semibold mb-2">{list.name}</h3>
                  <p className="text-gray-400 text-sm">
                    {list.item_count || 0} item{list.item_count !== 1 ? 's' : ''}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Created {new Date(list.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="border-t border-gray-700 px-6 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id, list.name);
                    }}
                    disabled={deleting === list.id}
                    className="text-red-500 hover:text-red-400 text-sm font-medium disabled:opacity-50"
                  >
                    {deleting === list.id ? 'Deleting...' : 'Delete List'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-netflix-gray-dark rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Create New List</h2>
            <form onSubmit={handleCreateList}>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List name"
                className="w-full px-4 py-3 bg-netflix-gray-light text-white rounded border border-gray-600 focus:border-netflix-red focus:outline-none mb-4"
                autoFocus
                maxLength={100}
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!newListName.trim() || creating}
                  className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewListName('');
                  }}
                  className="flex-1 btn-secondary py-3"
                  disabled={creating}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
      <MobileNav />
    </div>
  );
};

export default Lists;
