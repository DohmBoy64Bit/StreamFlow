import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getUserLists, addItemToList, createList } from '../services/lists';

const AddToListModal = ({ isOpen, onClose, tmdbId, mediaType }) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToList, setAddingToList] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchLists();
    }
  }, [isOpen]);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const data = await getUserLists();
      setLists(data || []);
    } catch (err) {
      console.error('Failed to fetch lists:', err);
      setErrorMessage('Failed to load lists');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = async (listId) => {
    setAddingToList(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await addItemToList(listId, tmdbId, mediaType);
      setSuccessMessage('Added to list successfully!');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to add to list:', err);
      setErrorMessage('Failed to add to list');
    } finally {
      setAddingToList(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    setCreating(true);
    setErrorMessage('');

    try {
      const newList = await createList(newListName.trim());
      await fetchLists();
      setNewListName('');
      setShowCreateForm(false);
      
      if (newList?.id) {
        await handleAddToList(newList.id);
      }
    } catch (err) {
      console.error('Failed to create list:', err);
      setErrorMessage('Failed to create list');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-netflix-gray-dark rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-netflix-gray-dark border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Add to List</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {successMessage && (
            <div className="bg-green-600 text-white px-4 py-3 rounded-lg mb-4 text-center">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-600 text-white px-4 py-3 rounded-lg mb-4 text-center">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : showCreateForm ? (
            <form onSubmit={handleCreateList} className="space-y-4">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="New list name"
                className="w-full px-4 py-3 bg-netflix-gray-light text-white rounded border border-gray-600 focus:border-netflix-red focus:outline-none"
                autoFocus
                maxLength={100}
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!newListName.trim() || creating}
                  className="flex-1 btn-primary py-3 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create & Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewListName('');
                  }}
                  className="flex-1 btn-secondary py-3"
                  disabled={creating}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {lists.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">You don&apos;t have any lists yet</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="btn-primary px-6 py-3"
                  >
                    Create Your First List
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {lists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => handleAddToList(list.id)}
                      disabled={addingToList}
                      className="w-full text-left px-4 py-3 bg-netflix-gray-light hover:bg-netflix-red text-white rounded transition disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{list.name}</span>
                        <span className="text-sm text-gray-400">
                          {list.item_count || 0} items
                        </span>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="w-full text-left px-4 py-3 bg-netflix-gray-light hover:bg-gray-700 text-white rounded transition border-2 border-dashed border-gray-600"
                  >
                    <span className="font-medium">+ Create New List</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

AddToListModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tmdbId: PropTypes.number.isRequired,
  mediaType: PropTypes.oneOf(['movie', 'tv']).isRequired,
};

export default AddToListModal;
