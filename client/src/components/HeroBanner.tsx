import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ChevronDown, TrendingUp } from 'lucide-react';
import { Movie } from '../utils/api';

interface HeroBannerProps {
  movie: Movie;
}

export default function HeroBanner({ movie }: HeroBannerProps) {
  return (
    <div className="relative w-full min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh] overflow-hidden">
      {/* Backdrop Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})`,
        }}
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900" />

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col justify-end sm:justify-center pb-16 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600/90 backdrop-blur-sm rounded-full text-sm font-medium text-white mb-4"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Trending Now</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight leading-tight"
          >
            {movie.title}
          </motion.h1>

          {/* Rating & Year */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 mb-4"
          >
            <span className="flex items-center gap-1 text-yellow-400 font-bold">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {movie.rating}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-300">{movie.releaseYear}</span>
          </motion.div>

          {/* Overview */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-300 text-base sm:text-lg line-clamp-3 mb-6"
          >
            {movie.overview || 'No description available.'}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              to={`/movie/${movie.id}`}
              className="flex items-center gap-2 px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Play className="h-5 w-5 fill-current" />
              <span>Play</span>
            </Link>
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-500/50 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-gray-500/70 transition-colors">
              <span>More Info</span>
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white/70"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </motion.div>
    </div>
  );
}
