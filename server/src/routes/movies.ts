import { Router, Request, Response } from 'express';
import { fetchFromTMDB, getImageUrl } from '../services/tmdb';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../index';

const router = Router();

// TMDB response type
interface TMDBResponse {
  page: number;
  results: Array<{
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    overview: string;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    media_type?: string;
  }>;
  total_pages: number;
  total_results: number;
}

interface TMDBMovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  genres: Array<{ id: number; name: string }>;
  vote_average: number;
  tagline: string;
}

// Transform function to convert TMDB movie to our format
function transformMovie(movie: TMDBResponse['results'][0], isTv = false) {
  return {
    id: movie.id,
    title: isTv ? movie.name : movie.title,
    posterUrl: getImageUrl(movie.poster_path),
    backdropUrl: getImageUrl(movie.backdrop_path, 'original'),
    overview: movie.overview,
    releaseYear: isTv
      ? movie.first_air_date?.split('-')[0] || 'N/A'
      : movie.release_date?.split('-')[0] || 'N/A',
    rating: movie.vote_average.toFixed(1),
  };
}

// GET /api/movies/trending
router.get('/trending', authenticateToken, async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await fetchFromTMDB<TMDBResponse>('/trending/movie/week', { language: 'en-US' });

    const movies = data.results.map(movie => transformMovie(movie));

    res.json({
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      movies,
    });
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error('Trending movies error:', error.message || error.code);
    res.status(500).json({ error: 'Failed to fetch trending movies - API unreachable' });
  }
});

// GET /api/movies/popular
router.get('/popular', authenticateToken, async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await fetchFromTMDB<TMDBResponse>('/movie/popular', { language: 'en-US' });

    const movies = data.results.map(movie => transformMovie(movie));

    res.json({
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      movies,
    });
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error('Popular movies error:', error.message || error.code);
    res.status(500).json({ error: 'Failed to fetch popular movies' });
  }
});

// GET /api/movies/top-rated
router.get('/top-rated', authenticateToken, async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await fetchFromTMDB<TMDBResponse>('/movie/top_rated', { language: 'en-US' });

    const movies = data.results.map(movie => transformMovie(movie));

    res.json({
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      movies,
    });
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error('Top rated movies error:', error.message || error.code);
    res.status(500).json({ error: 'Failed to fetch top rated movies' });
  }
});

// GET /api/movies/upcoming
router.get('/upcoming', authenticateToken, async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await fetchFromTMDB<TMDBResponse>('/movie/upcoming', { language: 'en-US' });

    const movies = data.results.map(movie => transformMovie(movie));

    res.json({
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      movies,
    });
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error('Upcoming movies error:', error.message || error.code);
    res.status(500).json({ error: 'Failed to fetch upcoming movies' });
  }
});

// GET /api/movies/genre/:genreId
router.get('/genre/:genreId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { genreId } = req.params;

    if (!genreId || isNaN(parseInt(genreId, 10))) {
      res.status(400).json({ error: 'Valid genre ID is required' });
      return;
    }

    const data = await fetchFromTMDB<TMDBResponse>('/discover/movie', {
      with_genres: genreId,
      language: 'en-US',
      sort_by: 'popularity.desc',
    });

    const movies = data.results.map(movie => transformMovie(movie));

    res.json({
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      movies,
    });
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error('Genre movies error:', error.message || error.code);
    res.status(500).json({ error: 'Failed to fetch genre movies' });
  }
});

// GET /api/movies/search?query=...
router.get('/search', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, page = '1' } = req.query;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    if (query.length < 2) {
      res.status(400).json({ error: 'Search query must be at least 2 characters' });
      return;
    }

    const data = await fetchFromTMDB<TMDBResponse>('/search/movie', {
      query: encodeURIComponent(query),
      page: parseInt(page as string, 10),
      language: 'en-US',
    });

    const movies = data.results.map(movie => transformMovie(movie));

    res.json({
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      movies,
    });
  } catch (err) {
    console.error('Search movies error:', err);
    res.status(500).json({ error: 'Failed to search movies' });
  }
});

// GET /api/movies/:id - Get movie details
router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id, 10))) {
      res.status(400).json({ error: 'Valid movie ID is required' });
      return;
    }

    const data = await fetchFromTMDB<TMDBMovieDetails>(`/movie/${id}`, {
      language: 'en-US',
      append_to_response: 'credits,similar',
    });

    res.json({
      id: data.id,
      title: data.title,
      overview: data.overview,
      posterUrl: getImageUrl(data.poster_path, 'original'),
      backdropUrl: getImageUrl(data.backdrop_path, 'original'),
      releaseDate: data.release_date,
      runtime: data.runtime,
      genres: data.genres.map(g => g.name),
      rating: data.vote_average.toFixed(1),
      tagline: data.tagline,
    });
  } catch (err) {
    console.error('Movie details error:', err);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

// GET /api/movies/tv/trending - Trending TV shows
router.get('/tv/trending', authenticateToken, async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await fetchFromTMDB<TMDBResponse>('/trending/tv/week', { language: 'en-US' });

    const shows = data.results.map(show => transformMovie(show, true));

    res.json({
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      shows,
    });
  } catch (err) {
    console.error('Trending TV error:', err);
    res.status(500).json({ error: 'Failed to fetch trending TV shows' });
  }
});

// POST /api/movies/watchlist - Add to watchlist
router.post('/watchlist', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId, title, posterUrl } = req.body;

    if (!movieId || !title) {
      res.status(400).json({ error: 'Movie ID and title are required' });
      return;
    }

    const watchlistItem = await prisma.watchlist.upsert({
      where: {
        userId_movieId: {
          userId: req.user!.id,
          movieId,
        },
      },
      update: {},
      create: {
        userId: req.user!.id,
        movieId,
        title,
        posterUrl: posterUrl || null,
      },
    });

    res.status(201).json({ message: 'Added to watchlist', item: watchlistItem });
  } catch (err) {
    console.error('Watchlist add error:', err);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// GET /api/movies/watchlist - Get user's watchlist
router.get('/watchlist', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId: req.user!.id },
      orderBy: { addedAt: 'desc' },
    });

    res.json({ watchlist });
  } catch (err) {
    console.error('Watchlist fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// DELETE /api/movies/watchlist/:movieId - Remove from watchlist
router.delete('/watchlist/:movieId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId } = req.params;

    await prisma.watchlist.deleteMany({
      where: {
        userId: req.user!.id,
        movieId: parseInt(movieId, 10),
      },
    });

    res.json({ message: 'Removed from watchlist' });
  } catch (err) {
    console.error('Watchlist remove error:', err);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

export default router;
