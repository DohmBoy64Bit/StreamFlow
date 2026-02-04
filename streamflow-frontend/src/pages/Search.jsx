import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import MovieCard from '../components/MovieCard';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { searchMovies } from '../services/movies';

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await searchMovies(query, filters, page);
      setResults(data.results || []);
      setTotalPages(data.total_pages || 0);
    } catch (err) {
      setError('Failed to search. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [query, filters, page]);

  useEffect(() => {
    if (query.trim()) {
      handleSearch();
    }
  }, [page, query, handleSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    handleSearch();
  };

  const handleItemClick = (item) => {
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    if (mediaType === 'movie') {
      navigate(`/movie/${item.id}`);
    } else {
      navigate(`/show/${item.id}`);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="min-h-screen bg-netflix-black pb-20 md:pb-0">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 md:mb-8">Search</h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for movies or TV shows..."
              className="flex-1 px-4 py-3 bg-netflix-gray-dark text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
            />
            <button type="submit" className="btn-primary px-6 md:px-8">
              Search
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden mt-4 text-netflix-red flex items-center gap-2"
          >
            {showFilters ? '▼' : '▶'} Filters
          </button>

          <div className={`mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
            <input
              type="number"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              placeholder="Year (e.g., 2023)"
              className="px-4 py-2 bg-netflix-gray-dark text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
            />
            <input
              type="text"
              value={filters.genre}
              onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
              placeholder="Genre ID (e.g., 28 for Action)"
              className="px-4 py-2 bg-netflix-gray-dark text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
            />
          </div>
        </form>

        {loading && (
          <div className="text-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <ErrorMessage message={error} onRetry={handleSearch} className="mb-8" />
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
              {results.map((item) => (
                <MovieCard key={item.id} item={item} onClick={handleItemClick} />
              ))}
            </div>

            <div className="flex justify-center items-center gap-2 md:gap-4">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="btn-secondary px-3 py-2 md:px-6 md:py-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-white text-sm md:text-base">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="btn-secondary px-3 py-2 md:px-6 md:py-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No results found for &quot;{query}&quot;</p>
          </div>
        )}
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default Search;
