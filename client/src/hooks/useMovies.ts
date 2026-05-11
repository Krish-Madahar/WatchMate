import { useQuery } from '@tanstack/react-query';
import { moviesAPI, Movie } from '../utils/api';

export type CategoryType =
  | 'trending'
  | 'popular'
  | 'top-rated'
  | 'upcoming'
  | 'action'
  | 'comedy'
  | 'crime'
  | 'horror'
  | 'romance'
  | 'scifi';

export interface CategoryConfig {
  id: CategoryType;
  title: string;
  queryFn: () => Promise<{ movies: Movie[] }>;
}

const categoryConfigs: Record<CategoryType, Omit<CategoryConfig, 'id'>> = {
  trending: {
    title: 'Trending Now',
    queryFn: async () => {
      const response = await moviesAPI.getTrending();
      return response.data;
    },
  },
  popular: {
    title: 'Popular on WatchMate',
    queryFn: async () => {
      const response = await moviesAPI.getPopular();
      return response.data;
    },
  },
  'top-rated': {
    title: 'Top Rated',
    queryFn: async () => {
      const response = await moviesAPI.getTopRated();
      return response.data;
    },
  },
  upcoming: {
    title: 'Upcoming',
    queryFn: async () => {
      const response = await moviesAPI.getUpcoming();
      return response.data;
    },
  },
  action: {
    title: 'Action & Adventure',
    queryFn: async () => {
      const response = await moviesAPI.getByGenre(28);
      return response.data;
    },
  },
  comedy: {
    title: 'Comedy',
    queryFn: async () => {
      const response = await moviesAPI.getByGenre(35);
      return response.data;
    },
  },
  crime: {
    title: 'Crime',
    queryFn: async () => {
      const response = await moviesAPI.getByGenre(80);
      return response.data;
    },
  },
  horror: {
    title: 'Horror',
    queryFn: async () => {
      const response = await moviesAPI.getByGenre(27);
      return response.data;
    },
  },
  romance: {
    title: 'Romance',
    queryFn: async () => {
      const response = await moviesAPI.getByGenre(10749);
      return response.data;
    },
  },
  scifi: {
    title: 'Sci-Fi',
    queryFn: async () => {
      const response = await moviesAPI.getByGenre(878);
      return response.data;
    },
  },
};

export function useMovies(category: CategoryType) {
  const config = categoryConfigs[category];

  return useQuery({
    queryKey: ['movies', category],
    queryFn: async () => {
      const result = await config.queryFn();
      return result.movies;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: true,
  });
}

export const categories: CategoryConfig[] = Object.entries(categoryConfigs).map(
  ([id, config]) => ({
    id: id as CategoryType,
    ...config,
  })
);
