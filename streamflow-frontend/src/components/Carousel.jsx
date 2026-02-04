import { useRef, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import MovieCard from './MovieCard';

const Carousel = ({ title, items, onItemClick }) => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeDot, setActiveDot] = useState(0);

  // Stabilize the Sequence ID so it doesn't flicker on scroll/re-render
  const sequenceId = useMemo(() => Math.floor(Math.random() * 900) + 100, []);

  if (!items || items.length === 0) {
    return null;
  }

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    if (scrollWidth <= clientWidth) return;

    const scrollPercent = scrollLeft / (scrollWidth - clientWidth);

    // Map scroll percentage to one of the three dots (0, 1, 2)
    if (scrollPercent < 0.33) setActiveDot(0);
    else if (scrollPercent < 0.66) setActiveDot(1);
    else setActiveDot(2);
  }, []);

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
    <div className="mb-8 md:mb-12 group/carousel">
      <div className="flex items-center justify-between mb-4 px-4 md:px-0">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-gray-700 uppercase tracking-[0.3em] leading-none mb-1.5 ml-0.5">Log Sequence</span>
          <div className="flex items-center gap-3">
            <h2 className="text-lg md:text-xl font-black text-white tracking-tight uppercase leading-none">
              {title.split(' ')[0]} <span className="text-gray-500 font-medium">{title.split(' ').slice(1).join(' ')}</span>
            </h2>
            <div className="h-4 w-px bg-white/10 hidden md:block" />
            <div className="px-1.5 py-0 bg-streamflow-cyan/5 border border-streamflow-cyan/10 rounded-[1px] hidden md:block group-hover/carousel:border-streamflow-cyan/30 transition-colors">
              <span className="text-[7.5px] font-bold text-streamflow-cyan uppercase tracking-[0.2em] leading-none">
                SEQ-{sequenceId}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 px-2 self-end pb-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${activeDot === i
                ? 'bg-streamflow-cyan shadow-[0_0_10px_rgba(0,255,255,0.6)]'
                : 'bg-white/5 scale-75'
                }`}
            />
          ))}
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide px-4 md:px-0 pb-6 touch-pan-x cursor-grab select-none mask-fade-right"
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
