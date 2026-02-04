import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import MovieCard from '../components/MovieCard';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { searchMovies, getGenres } from '../services/movies';

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    rating: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deepSearch, setDeepSearch] = useState(false);

  // Fetch Genres on Mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getGenres();
        setAvailableGenres(data.genres || []);
      } catch (err) {
        console.error('Failed to fetch genres:', err);
      }
    };
    fetchGenres();
  }, []);

  const handleSearch = useCallback(async () => {
    // Note: Allow empty query if filters are present (Discovery mode)
    const isValidYear = !filters.year || (filters.year.length === 4 && !isNaN(filters.year));

    // Don't search if year is incomplete (e.g., "1", "19", "198")
    if (!isValidYear) return;
    if (!query.trim() && !filters.genre && !filters.year && !filters.rating) return;

    setLoading(true);
    setError(null);
    setResults([]); // Clear results while loading to prevent stale data

    try {
      const data = await searchMovies(query, filters, page, deepSearch);
      setResults(data.results || []);
      setTotalPages(data.total_pages || 0);
    } catch (err) {
      setError('Failed to search. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [query, filters, page, deepSearch]);

  useEffect(() => {
    const isValidYear = !filters.year || (filters.year.length === 4 && !isNaN(filters.year));
    if (query.trim() || filters.genre || (filters.year && isValidYear) || filters.rating) {
      handleSearch();
    }
  }, [page, query, handleSearch, filters.year]);

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
    <div className="min-h-screen bg-streamflow-navy pb-20 md:pb-0">
      <Navbar />

      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-6xl">
        {/* Compact Hero Header */}
        <div className="card p-5 md:p-6 mb-8 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-streamflow-cyan/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-streamflow-cyan/10 transition-all duration-700"></div>

          <div className="relative z-10">
            <h1 className="text-2xl md:text-4xl font-black text-white mb-1 tracking-tight">
              Discover <span className="text-streamflow-cyan">Content</span>
            </h1>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest opacity-80">Syncing with TMDB Archives</p>
          </div>
        </div>

        {/* Compact Search Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          {/* Main Search Bar - Ultra Compact */}
          <div className="card p-3 md:p-4 border-white/5 bg-white/[0.01] mb-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 relative w-full">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for movies or TV shows..."
                  className="w-full pl-11 pr-4 py-2.5 bg-streamflow-navy-light/50 backdrop-blur-sm border border-white/10 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-streamflow-cyan/30 focus:border-streamflow-cyan/30 transition-all duration-300 text-xs font-medium placeholder:text-gray-600"
                />
              </div>

              {/* Deep Search Toggle */}
              <div className="flex items-center gap-3 px-3 py-1.5 glass-panel border-white/5 rounded-lg shrink-0 w-full md:w-auto justify-between md:justify-start">
                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest pl-1">Deep Scan</span>
                <button
                  type="button"
                  onClick={() => setDeepSearch(!deepSearch)}
                  className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${deepSearch ? 'bg-streamflow-cyan/50' : 'bg-white/10'}`}
                >
                  <span
                    className={`${deepSearch ? 'translate-x-4' : 'translate-x-1'} inline-block h-2 w-2 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>

              <button type="submit" className="btn-primary py-2.5 px-6 md:px-8 text-xs font-black shadow-cyan-glow/10 flex items-center justify-center gap-2 transition-transform hover:scale-105 w-full md:w-auto">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </div>
          </div>

          {/* Filters Toggle (Mobile) */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden mb-4 px-3 py-1.5 glass-panel border-white/5 rounded-lg text-streamflow-cyan hover:bg-white/[0.05] flex items-center gap-2 transition-all duration-300 font-black text-[10px] uppercase tracking-widest"
          >
            <svg className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>

          {/* Filter Cards - Compact Density */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${showFilters ? 'block' : 'hidden md:grid'}`}>
            {/* Year Filter */}
            <div className="card p-3 border-white/5 bg-white/[0.01]">
              <label className="block text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1.5 pl-1">Year</label>
              <input
                type="number"
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                placeholder="e.g., 2023"
                className="w-full px-3 py-2 bg-streamflow-navy-light/30 border border-white/10 text-white rounded-lg focus:outline-none focus:border-streamflow-cyan/50 text-[11px] font-bold placeholder:text-gray-700"
              />
            </div>

            {/* Genre Filter - Now a Dropdown */}
            <div className="card p-3 border-white/5 bg-white/[0.01]">
              <label className="block text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1.5 pl-1">Genre</label>
              <select
                value={filters.genre}
                onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                className="w-full px-3 py-2 bg-streamflow-navy-light/30 border border-white/10 text-white rounded-lg focus:outline-none focus:border-streamflow-cyan/50 text-[11px] font-bold appearance-none cursor-pointer"
              >
                <option value="" className="bg-streamflow-navy font-bold">All Genres</option>
                {availableGenres.map((genre) => (
                  <option key={genre.id} value={genre.id} className="bg-streamflow-navy font-bold">
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div className="card p-3 border-white/5 bg-white/[0.01]">
              <label className="block text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1.5 pl-1">Min Rating</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={filters.rating}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                placeholder="0.0 - 10.0"
                className="w-full px-3 py-2 bg-streamflow-navy-light/30 border border-white/10 text-white rounded-lg focus:outline-none focus:border-streamflow-cyan/50 text-[11px] font-bold placeholder:text-gray-700"
              />
            </div>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20 flex flex-col items-center">
            <Spinner size="md" />
            <p className="text-[10px] font-black text-gray-600 mt-4 uppercase tracking-widest animate-pulse">Scanning Transmission Banks</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <ErrorMessage message={error} onRetry={handleSearch} className="mb-8" />
        )}

        {/* Results Grid */}
        {!loading && results.length > 0 && (
          <div className="animate-fadeIn">
            {/* Results Header - Compact */}
            <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
              <h2 className="text-lg md:text-xl font-black text-white tracking-tighter uppercase">
                {deepSearch ? 'Broad Scan' : 'Focused'} <span className="text-streamflow-cyan">Results</span>
              </h2>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] font-black text-streamflow-cyan bg-streamflow-cyan/5 px-2 py-0.5 rounded border border-streamflow-cyan/10 uppercase tracking-widest">
                  {results.length} Active Data Nodes
                </span>
                <span className="text-[7px] font-bold text-gray-600 uppercase tracking-widest">Quality Filter: Active</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5 mb-10">
              {results.map((item) => (
                <MovieCard key={item.id} item={item} onClick={handleItemClick} />
              ))}
            </div>

            {/* Pagination - Compact */}
            <div className="flex justify-center items-center gap-3">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="glass-panel px-4 py-2 border-white/5 rounded-lg text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/[0.05] disabled:opacity-20 flex items-center gap-1.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </button>

              <div className="px-3 py-1.5 bg-streamflow-cyan/5 border border-white/5 rounded-lg">
                <span className="text-streamflow-cyan text-[10px] font-black">
                  {page} <span className="opacity-30 mx-1">/</span> {totalPages}
                </span>
              </div>

              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="glass-panel px-4 py-2 border-white/5 rounded-lg text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/[0.05] disabled:opacity-20 flex items-center gap-1.5"
              >
                Next
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Empty State - Compact */}
        {!loading && (query || filters.genre || filters.year || filters.rating) && results.length === 0 && (
          <div className="text-center py-16 glass-panel border-white/5 rounded-3xl animate-slideUp">
            <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
              <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 15h2m-2 4h2m2-4v1a1 1 0 01-1 1h-6a1 1 0 01-1-1v-1m3-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tight">Access Denied</h3>
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">No matching records found for your query</p>
          </div>
        )}
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default Search;
