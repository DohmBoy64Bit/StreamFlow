import PropTypes from 'prop-types';
import MovieCard from './MovieCard';

const Carousel = ({ title, items, onItemClick }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4 px-4 md:px-0">{title}</h2>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 md:px-0 pb-4">
        {items.map((item) => (
          <div key={item.id} className="snap-start">
            <MovieCard item={item} onClick={onItemClick} />
          </div>
        ))}
      </div>
    </div>
  );
};

Carousel.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  onItemClick: PropTypes.func.isRequired,
};

export default Carousel;
