import PropTypes from 'prop-types';

const MovieCard = ({ item, onClick }) => {
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  const posterPath = item.poster_path || item.backdrop_path;
  const title = item.title || item.name;
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

  return (
    <div
      onClick={() => onClick(item)}
      className="flex-shrink-0 w-36 md:w-44 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] active:scale-95 group relative"
    >
      <div className="relative overflow-hidden rounded-sm border border-white/5 transition-all duration-300 group-hover:border-streamflow-cyan/40 group-hover:shadow-[0_0_20px_rgba(0,255,255,0.15)]">
        {posterPath ? (
          <img
            src={`${imageBaseUrl}${posterPath}`}
            alt={title}
            loading="lazy"
            draggable={false}
            className="w-full h-52 md:h-64 object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-52 md:h-64 bg-streamflow-navy-light/50 flex items-center justify-center">
            <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest">No Asset</span>
          </div>
        )}

        {/* Diagnostic Score Tag */}
        <div className="absolute top-2 right-2 flex flex-col items-end">
          <div className="bg-black/90 backdrop-blur-md px-1.5 py-0 rounded-[1px] border border-white/10 flex items-center gap-1.5 shadow-xl">
            <span className="text-[7px] font-bold text-gray-500 uppercase tracking-tighter">Score</span>
            <span className="text-streamflow-cyan font-bold text-[10px] tracking-tight">{rating}</span>
          </div>
        </div>

        {/* Technical Data Overlay on Hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-streamflow-cyan animate-pulse" />
              <span className="text-[8px] font-black text-streamflow-cyan uppercase tracking-widest">Data Node active</span>
            </div>
            <h3 className="text-white font-black text-[11px] uppercase tracking-tight line-clamp-2 leading-tight">
              {title}
            </h3>
          </div>
        </div>
      </div>

      {/* Visual Base Accent */}
      <div className="h-0.5 w-0 group-hover:w-full bg-streamflow-cyan transition-all duration-500 mt-2 opacity-30 shadow-[0_0_8px_rgba(0,255,255,0.4)]" />
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
