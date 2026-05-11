import axios, { AxiosInstance } from 'axios';
import { redis } from '../index';

// Create TMDB API instance
const tmdbClient: AxiosInstance = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.TMDB_API_KEY || '',
  },
  timeout: 10000, // 10 second timeout
});

// Cache TTL in seconds (1 hour)
const CACHE_TTL = 3600;

/**
 * Get or set cache - implements cache-aside pattern
 */
export async function getOrSetCache<T>(
  key: string,
  fetcherFn: () => Promise<T>,
  ttlSeconds: number = CACHE_TTL
): Promise<T> {
  // Skip cache if Redis isn't ready
  let redisReady = false;
  try {
    redisReady = redis.status === 'ready';
  } catch {
    redisReady = false;
  }

  if (redisReady) {
    try {
      const cached = await redis.get(key);
      if (cached) {
        console.log(`Cache hit for: ${key}`);
        return JSON.parse(cached) as T;
      }
    } catch (err) {
      console.error('Redis get error:', err);
    }
  }

  // Cache miss - fetch fresh data
  const data = await fetcherFn();

  // Store in cache (fire and forget, don't block on cache errors)
  if (redisReady) {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(data));
      console.log(`Cached: ${key} for ${ttlSeconds}s`);
    } catch (err) {
      console.error('Redis set error:', err);
    }
  }

  return data;
}

/**
 * Fetch data from TMDB API with caching
 */
export async function fetchFromTMDB<T>(
  endpoint: string,
  params: Record<string, string | number> = {}
): Promise<T> {
  const cacheKey = `tmdb:${endpoint}:${JSON.stringify(params)}`;

  return getOrSetCache<T>(cacheKey, async () => {
    const response = await tmdbClient.get(endpoint, { params });
    return response.data;
  });
}

/**
 * Get image URL with proper sizing
 */
export function getImageUrl(posterPath: string | null, size: 'w500' | 'original' = 'w500'): string {
  if (!posterPath) return '/placeholder.png';
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}

export default tmdbClient;