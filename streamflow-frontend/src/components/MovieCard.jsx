import PropTypes from 'prop-types';

const MovieCard = ({ item, onClick }) => {
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  const posterPath = item.poster_path || item.backdrop_path;
  const title = item.title || item.name;
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

  return (
    <div
      onClick={() => onClick(item)}
      className="flex-shrink-0 w-40 md:w-48 cursor-pointer transform transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      <div className="relative">
        {posterPath ? (
          <img
            src={`${imageBaseUrl}${posterPath}`}
            alt={title}
            loading="lazy"
            draggable={false}
            className="w-full h-60 md:h-72 object-cover rounded-lg shadow-lg"
          />
        ) : (
          <div className="w-full h-60 md:h-72 bg-netflix-gray-dark rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-xs md:text-sm">No Image</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 px-1.5 md:px-2 py-0.5 md:py-1 rounded">
          <span className="text-yellow-400 font-semibold text-xs md:text-sm">⭐ {rating}</span>
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
