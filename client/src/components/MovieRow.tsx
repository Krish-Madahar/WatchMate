import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../utils/api';
import MovieCard from './MovieCard';
import SkeletonCard from './SkeletonCard';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  isLoading: boolean;
  error?: Error | null;
}

export default function MovieRow({ title, movies, isLoading, error }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        scrollEl.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [movies]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="relative group"
    >
      {/* Section Header */}
      <div className="px-4 md:px-8 lg:px-12 mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
      </div>

      {/* Scrollable Container */}
      <div className="relative">
        {/* Left Arrow */}
        <motion.button
          initial={{ opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{ opacity: showLeftArrow ? 1 : 0 }}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/80 hover:bg-primary-600 text-white p-3 rounded-full shadow-lg transition-colors ${
            showLeftArrow ? 'cursor-pointer' : 'pointer-events-none'
          }`}
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6" />
        </motion.button>

        {/* Right Arrow */}
        <motion.button
          initial={{ opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{ opacity: showRightArrow ? 1 : 0 }}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/80 hover:bg-primary-600 text-white p-3 rounded-full shadow-lg transition-colors ${
            showRightArrow ? 'cursor-pointer' : 'pointer-events-none'
          }`}
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6" />
        </motion.button>

        {/* Horizontal Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-8 lg:px-12 py-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Loading Skeletons */}
          {isLoading && (
            <>
              {[...Array(5)].map((_, i) => (
                <div key={`skeleton-${i}`} className="flex-shrink-0 w-44 md:w-52 snap-start">
                  <SkeletonCard />
                </div>
              ))}
            </>
          )}

          {/* Error State */}
          {error && (
            <div className="flex-shrink-0 w-full py-8 flex items-center justify-center">
              <p className="text-gray-500">Failed to load movies</p>
            </div>
          )}

          {/* Movies */}
          {!isLoading && !error && movies.length > 0 && (
            <>
              {movies.map((movie, index) => (
                <div
                  key={movie.id}
                  className="flex-shrink-0 w-36 sm:w-40 md:w-44 lg:w-48 snap-start"
                >
                  <MovieCard movie={movie} index={index} variant="row" />
                </div>
              ))}
              {/* See All Card */}
              <div className="flex-shrink-0 w-36 sm:w-40 md:w-44 lg:w-48 snap-start">
                <div className="aspect-[2/3] bg-gray-800 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-700 hover:border-primary-500 transition-colors cursor-pointer">
                  <span className="text-gray-400 text-sm">See All</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.section>
  );
}
