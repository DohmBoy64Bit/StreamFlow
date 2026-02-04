import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import MovieCard from './MovieCard';

const Carousel = ({ title, items, onItemClick }) => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  if (!items || items.length === 0) {
    return null;
  }

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    scrollRef.current.style.cursor = 'grab';
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      scrollRef.current.style.cursor = 'grab';
    }
  };

  const handleCardClick = (item) => {
    if (!isDragging) {
      onItemClick(item);
    }
  };

  return (
    <div className="mb-6 md:mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4 px-4 md:px-0">{title}</h2>
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide px-4 md:px-0 pb-4 touch-pan-x cursor-grab select-none"
        style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
      >
        {items.map((item) => (
          <div key={item.id} className="snap-start flex-shrink-0">
            <MovieCard item={item} onClick={handleCardClick} />
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
