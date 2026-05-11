import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, Plus, Eye } from 'lucide-react';
import { Movie } from '../utils/api';

interface MovieCardProps {
  movie: Movie;
  index?: number;
  variant?: 'grid' | 'row';
}

export default function MovieCard({ movie, index = 0, variant = 'grid' }: MovieCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ y: variant === 'grid' ? -4 : 0 }}
      className="group"
    >
      <Link to={`/movie/${movie.id}`} className="block">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="relative rounded-xl overflow-hidden bg-gray-800 shadow-lg group-hover:shadow-2xl group-hover:shadow-primary-500/10 transition-shadow duration-300"
        >
          <div className="aspect-[2/3] relative">
            {movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'w-full h-full flex items-center justify-center bg-gray-700';
                    fallback.innerHTML = '<span class="text-gray-400 text-sm">No Image</span>';
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <span className="text-gray-400">No Image</span>
              </div>
            )}

            {/* Hover Overlay with Play Icon */}
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-4"
              >
                {/* Play Icon Center */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-600/90 backdrop-blur-sm rounded-full p-3"
                >
                  <Play className="h-6 w-6 text-white fill-current" />
                </motion.div>

                <motion.h3
                  initial={{ y: 10, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  className="font-semibold text-white text-sm line-clamp-2 mb-2"
                >
                  {movie.title}
                </motion.h3>
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.05 }}
                  className="flex items-center gap-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Play className="h-3 w-3" />
                    Watch
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Plus className="h-4 w-4 text-white" />
                  </motion.button>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Rating Badge */}
            <div className="absolute top-2 right-2 bg-yellow-500 text-gray-900 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
              <Star className="h-3 w-3 fill-current" />
              {movie.rating}
            </div>

            {/* Watched Indicator */}
            <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="h-3 w-3" />
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Title below card - hidden on row variant */}
      {variant === 'grid' && (
        <div className="mt-2 px-1">
          <h3 className="font-medium text-white text-sm truncate hover:text-primary-400 transition-colors">
            {movie.title}
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">{movie.releaseYear}</p>
        </div>
      )}
    </motion.div>
  );
}
