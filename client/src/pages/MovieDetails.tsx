import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import * as Accordion from '@radix-ui/react-accordion';
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  Heart,
  ChevronDown,
  Play,
  BookmarkPlus,
  Loader2,
  Film,
} from 'lucide-react';
import { moviesAPI } from '../utils/api';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  posterUrl: string;
  backdropUrl: string;
  releaseDate: string;
  runtime: number;
  genres: string[];
  rating: string;
  tagline: string;
  cast?: Array<{ name: string; character: string; profileUrl?: string }>;
  crew?: Array<{ name: string; job: string }>;
}

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [heartAnimation, setHeartAnimation] = useState(false);

  const { data: movie, isLoading, error } = useQuery<MovieDetails>({
    queryKey: ['movie', id],
    queryFn: async () => {
      const response = await moviesAPI.getMovie(id!);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: watchlistData } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const response = await moviesAPI.getWatchlist();
      return response.data.watchlist as Array<{ movieId: number }>;
    },
  });

  const isInWatchlist = watchlistData?.some((item) => item.movieId === movie?.id) ?? false;

  const addMutation = useMutation({
    mutationFn: () => moviesAPI.addToWatchlist(movie!.id, movie!.title, movie!.posterUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => moviesAPI.removeFromWatchlist(movie!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const { scrollY } = useScroll();
  const backdropY = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.6]);

  const handleWatchlistToggle = () => {
    setHeartAnimation(true);
    setTimeout(() => setHeartAnimation(false), 600);

    if (isInWatchlist) {
      removeMutation.mutate();
      toast.success('Removed from watchlist', { icon: '💔' });
    } else {
      addMutation.mutate();
      toast.success('Added to watchlist!', { icon: '❤️' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="h-10 w-10 text-primary-500" />
        </motion.div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4">
            <Film className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-red-400 mb-4 text-lg">Failed to load movie details</p>
          <Link
            to="/dashboard"
            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            Back to dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Parallax Backdrop */}
      <motion.div
        style={{ y: backdropY }}
        className="fixed top-0 left-0 right-0 h-[500px] z-0"
      >
        {movie.backdropUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${movie.backdropUrl})`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-gray-900" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 pb-12"
      >
        <div className="max-w-7xl mx-auto px-4 pt-6">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Back to dashboard
            </Link>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-64 mx-auto lg:mx-0"
              >
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full rounded-2xl shadow-2xl shadow-black/50"
                />
              </motion.div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-1"
            >
              {/* Title & Rating */}
              <div className="flex items-center gap-4 mb-2 flex-wrap">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  {movie.title}
                </h1>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 text-gray-900 rounded-full font-bold text-lg shadow-lg"
                >
                  <Star className="h-4 w-4 fill-current" />
                  {movie.rating}
                </motion.span>
              </div>

              {movie.tagline && (
                <p className="text-xl text-gray-400 italic mb-4">{movie.tagline}</p>
              )}

              {/* Meta Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center gap-4 text-gray-300 mb-6"
              >
                {movie.releaseDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {movie.releaseDate.split('-')[0]}
                  </span>
                )}
                {movie.runtime > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {movie.runtime} min
                  </span>
                )}
                <div className="flex gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-gray-700/80 backdrop-blur-sm rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Overview */}
              <p className="text-gray-300 leading-relaxed mb-8 text-lg">
                {movie.overview}
              </p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4 mb-8"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary-600/25"
                >
                  <Play className="h-5 w-5" />
                  Watch Now
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWatchlistToggle}
                  disabled={addMutation.isPending || removeMutation.isPending}
                  className={cn(
                    'flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all',
                    isInWatchlist
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                      : 'bg-gray-700 hover:bg-gray-600 text-white',
                    (addMutation.isPending || removeMutation.isPending) && 'opacity-50'
                  )}
                >
                  <motion.div
                    animate={
                      heartAnimation
                        ? { scale: [1, 1.3, 1] }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.3 }}
                  >
                    <Heart
                      className={cn(
                        'h-5 w-5 transition-colors',
                        isInWatchlist ? 'fill-current' : ''
                      )}
                    />
                  </motion.div>
                  {addMutation.isPending || removeMutation.isPending ? 'Loading...' : isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-gray-700/80 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  <BookmarkPlus className="h-5 w-5" />
                </motion.button>
              </motion.div>

              {/* Cast & Crew Accordion */}
              {(movie.cast?.length || movie.crew?.length) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Accordion.Root type="multiple" className="space-y-2">
                    {movie.cast && movie.cast.length > 0 && (
                      <Accordion.Item value="cast" className="overflow-hidden rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
                        <Accordion.Trigger className="flex items-center justify-between w-full px-5 py-4 text-white font-medium group">
                          <span>Cast</span>
                          <motion.div
                            animate={{ rotate: 0 }}
                            className="[&[data-state=open]>svg]:rotate-180"
                          >
                            <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-200" />
                          </motion.div>
                        </Accordion.Trigger>
                        <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                          <div className="px-5 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {movie.cast.slice(0, 12).map((person, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="flex items-center gap-3 p-2 rounded-lg bg-gray-700/30"
                              >
                                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-400 font-medium">
                                  {person.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-white truncate">{person.name}</p>
                                  <p className="text-xs text-gray-400 truncate">{person.character}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </Accordion.Content>
                      </Accordion.Item>
                    )}

                    {movie.crew && movie.crew.length > 0 && (
                      <Accordion.Item value="crew" className="overflow-hidden rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
                        <Accordion.Trigger className="flex items-center justify-between w-full px-5 py-4 text-white font-medium group">
                          <span>Crew</span>
                          <motion.div
                            animate={{ rotate: 0 }}
                            className="[&[data-state=open]>svg]:rotate-180"
                          >
                            <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-200" />
                          </motion.div>
                        </Accordion.Trigger>
                        <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                          <div className="px-5 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {movie.crew.slice(0, 12).map((person, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="p-2 rounded-lg bg-gray-700/30"
                              >
                                <p className="text-sm font-medium text-white">{person.name}</p>
                                <p className="text-xs text-gray-400">{person.job}</p>
                              </motion.div>
                            ))}
                          </div>
                        </Accordion.Content>
                      </Accordion.Item>
                    )}
                  </Accordion.Root>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Sticky Watchlist Button (mobile) */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-6 left-4 right-4 lg:hidden z-20"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleWatchlistToggle}
          disabled={addMutation.isPending || removeMutation.isPending}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-4 font-semibold rounded-xl transition-all shadow-2xl',
            isInWatchlist
              ? 'bg-red-500 text-white'
              : 'bg-primary-600 text-white',
            (addMutation.isPending || removeMutation.isPending) && 'opacity-50'
          )}
        >
          <motion.div
            animate={
              heartAnimation
                ? { scale: [1, 1.3, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={cn('h-5 w-5', isInWatchlist ? 'fill-current' : '')}
            />
          </motion.div>
          {addMutation.isPending || removeMutation.isPending ? 'Loading...' : isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
        </motion.button>
      </motion.div>
    </div>
  );
}