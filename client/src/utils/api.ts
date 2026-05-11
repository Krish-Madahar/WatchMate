import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Movies API
export const moviesAPI = {
  getTrending: () => api.get('/movies/trending'),
  search: (query: string, page = 1) =>
    api.get(`/movies/search?query=${encodeURIComponent(query)}&page=${page}`),
  getMovie: (id: string) => api.get(`/movies/${id}`),
  getTrendingTV: () => api.get('/movies/tv/trending'),
  getPopular: () => api.get('/movies/popular'),
  getTopRated: () => api.get('/movies/top-rated'),
  getUpcoming: () => api.get('/movies/upcoming'),
  getByGenre: (genreId: number) => api.get(`/movies/genre/${genreId}`),
  getWatchlist: () => api.get('/movies/watchlist'),
  addToWatchlist: (movieId: number, title: string, posterUrl?: string) =>
    api.post('/movies/watchlist', { movieId, title, posterUrl }),
  removeFromWatchlist: (movieId: number) =>
    api.delete(`/movies/watchlist/${movieId}`),
};

// Types
export interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  backdropUrl?: string;
  overview: string;
  releaseYear: string;
  rating: string;
}

export interface TrendingResponse {
  page: number;
  totalPages: number;
  totalResults: number;
  movies: Movie[];
}

export interface User {
  id: number;
  email: string;
  username: string;
}