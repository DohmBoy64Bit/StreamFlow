import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import { getListDetails, removeItemFromList } from '../services/lists';
import { getMovieDetails } from '../services/movies';
import { getTVDetails } from '../services/tv';

const ListDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);

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
                id: item.tmdb_id,
              };
            } catch (err) {
              console.error(`Failed to fetch details for item ${item.tmdb_id}:`, err);
              return {
                ...item,
                id: item.tmdb_id,
                title: item.media_type === 'movie' ? 'Unknown Movie' : 'Unknown Show',
                name: item.media_type === 'tv' ? 'Unknown Show' : undefined,
              };
            }
          })
        );
        setItems(enrichedItems);
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

  const handleRemoveItem = async (itemId, title) => {
    if (!window.confirm(`Remove "${title}" from this list?`)) return;

    setRemovingItem(itemId);
    try {
      await removeItemFromList(id, itemId);
      await fetchListDetails();
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item. Please try again.');
    } finally {
      setRemovingItem(null);
    }
  };

  const handleItemClick = (item) => {
    if (item.media_type === 'movie') {
      navigate(`/movie/${item.tmdb_id}`);
    } else if (item.media_type === 'tv') {
      navigate(`/show/${item.tmdb_id}`);
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

  if (error || !list) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-900 bg-opacity-50 border border-red-700 text-white px-4 py-3 rounded-lg">
            {error || 'List not found'}
          </div>
          <button
            onClick={() => navigate('/lists')}
            className="btn-secondary px-6 py-3 mt-4"
          >
            ← Back to Lists
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />

      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="mb-8">
          <button
            onClick={() => navigate('/lists')}
            className="text-netflix-red hover:text-red-400 mb-4 inline-flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Lists
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">{list.name}</h1>
          <p className="text-gray-400">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-xl">This list is empty</p>
            <p className="text-gray-500 mt-2">Add movies or TV shows from their detail pages</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item) => (
              <div key={item.item_id} className="relative group">
                <MovieCard
                  item={item}
                  onClick={() => handleItemClick(item)}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveItem(item.item_id, item.title || item.name);
                  }}
                  disabled={removingItem === item.item_id}
                  className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  {removingItem === item.item_id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ListDetail;
