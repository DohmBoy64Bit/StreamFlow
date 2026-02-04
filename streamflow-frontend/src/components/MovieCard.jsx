import PropTypes from 'prop-types';

const MovieCard = ({ item, onClick }) => {
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  const posterPath = item.poster_path || item.backdrop_path;
  const title = item.title || item.name;
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

  return (
    <div
      onClick={() => onClick(item)}
      className="flex-shrink-0 w-40 md:w-48 cursor-pointer transform transition-all duration-300 hover:scale-105 active:scale-95 group"
    >
      <div className="relative">
        {posterPath ? (
          <img
            src={`${imageBaseUrl}${posterPath}`}
            alt={title}
            loading="lazy"
            draggable={false}
            className="w-full h-60 md:h-72 object-cover rounded-lg shadow-lg border border-white/5 transition-all duration-300 group-hover:shadow-cyan-glow group-hover:border-streamflow-cyan/30"
          />
        ) : (
          <div className="w-full h-60 md:h-72 bg-streamflow-navy-light/50 border border-white/5 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-xs md:text-sm">No Image</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10 shadow-lg">
          <span className="text-streamflow-cyan font-bold text-xs md:text-sm">⭐ {rating}</span>
        </div>
      </div>
      <h3 className="mt-2 text-white font-medium text-xs md:text-sm line-clamp-2">{title}</h3>
    </div>
  );
};

MovieCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    name: PropTypes.string,
    poster_path: PropTypes.string,
    backdrop_path: PropTypes.string,
    vote_average: PropTypes.number,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default MovieCard;
