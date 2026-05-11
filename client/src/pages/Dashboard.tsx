import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { moviesAPI, Movie } from '../utils/api';
import MovieRow from '../components/MovieRow';
import HeroBanner from '../components/HeroBanner';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { categories, useMovies, CategoryType } from '../hooks/useMovies';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const rowRefs = useRef<(HTMLElement | null)[]>([]);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Fetch trending for hero and search
  const { data: trendingData } = useQuery({
    queryKey: ['trendingMovies'],
    queryFn: async () => {
      const response = await moviesAPI.getTrending();
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: searchData, isLoading: searchLoading, refetch: searchRefetch } = useQuery({
    queryKey: ['searchMovies', searchQuery],
    queryFn: async () => {
      const response = await moviesAPI.search(searchQuery);
      return response.data;
    },
    enabled: false,
  });

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (searchQuery.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchRefetch();
      }, 500);
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchRefetch]);

  // Set hero movie
  useEffect(() => {
    if (trendingData?.movies?.length && !heroMovie) {
      const randomIndex = Math.floor(Math.random() * Math.min(10, trendingData.movies.length));
      setHeroMovie(trendingData.movies[randomIndex]);
    }
  }, [trendingData, heroMovie]);

  // Intersection Observer for lazy loading rows
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = rowRefs.current.indexOf(entry.target as HTMLElement);
            if (index !== -1) {
              // Could track active row here if needed
            }
          }
        });
      },
      { rootMargin: '100px' }
    );

    rowRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      searchRefetch();
      toast.success('Searching...', { icon: '🔍' });
    } else {
      toast.error('Please enter at least 2 characters');
    }
  };

  const handleRowRef = (index: number) => (el: HTMLElement | null) => {
    rowRefs.current[index] = el;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      {/* Hero Banner */}
      {heroMovie && searchQuery.trim().length < 2 && (
        <HeroBanner movie={heroMovie} />
      )}

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex gap-2 max-w-xl"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary-600/25"
          >
            Search
          </motion.button>
        </motion.form>
      </div>

      {/* Search Results or Movie Rows */}
      <main className="bg-gray-900 pb-12">
        {/* Search mode */}
        {searchQuery.trim().length >= 2 ? (
          // Search Results Mode
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-900 min-h-screen"
          >
            {searchLoading ? (
              <div className="flex justify-center py-12">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Loader2 className="h-8 w-8 text-primary-500" />
                </motion.div>
              </div>
            ) : (
              <MovieRow
                title={`Search Results (${searchData?.movies?.length || 0})`}
                movies={searchData?.movies || []}
                isLoading={false}
              />
            )}
          </motion.div>
        ) : (
          // Netflix-style Movie Rows
          <div className="space-y-8 pb-12">
            {categories.map((category, index) => (
              <LazyMovieRow
                key={category.id}
                category={category.id}
                title={category.title}
                onRef={(el) => handleRowRef(index)(el)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Lazy loading wrapper for MovieRow
function LazyMovieRow({
  category,
  title,
  onRef,
}: {
  category: CategoryType;
  title: string;
  onRef: (el: HTMLElement | null) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
      onRef(ref.current);
    }

    return () => observer.disconnect();
  }, [onRef]);

  const { data: movies, isLoading, error } = useMovies(category);

  return (
    <section ref={ref}>
      {isVisible && (
        <MovieRow
          title={title}
          movies={movies || []}
          isLoading={isLoading}
          error={error as Error | null}
        />
      )}
    </section>
  );
}
