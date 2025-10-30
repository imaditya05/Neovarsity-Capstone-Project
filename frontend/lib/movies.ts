import api from './api';

export interface Movie {
  _id: string;
  title: string;
  description: string;
  genre: string[];
  language: string;
  duration: number;
  releaseDate: string;
  rating: string;
  posterUrl?: string;
  trailerUrl?: string;
  cast?: { name: string; role: string }[];
  director: string;
  producers?: string[];
  averageRating: number;
  totalReviews: number;
  status: 'coming_soon' | 'now_showing' | 'ended';
  addedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  theater?: {
    _id: string;
    theaterName: string;
    city: string;
  };
  isActive: boolean;
  formattedDuration?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MovieFormData {
  title: string;
  description: string;
  genre: string[];
  language: string;
  duration: number;
  releaseDate: string;
  rating: string;
  posterUrl?: string;
  trailerUrl?: string;
  cast?: { name: string; role: string }[];
  director: string;
  producers?: string[];
  status: 'coming_soon' | 'now_showing' | 'ended';
  theater?: string;
}

export interface MoviesResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Movie[];
}

export interface MovieResponse {
  success: boolean;
  data: Movie;
  message?: string;
}

export interface MovieQueryParams {
  status?: string;
  genre?: string;
  language?: string;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Get all movies with filters
export const getAllMovies = async (params?: MovieQueryParams): Promise<MoviesResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const response = await api.get(`/api/movies?${queryParams.toString()}`);
  return response.data;
};

// Get single movie by ID
export const getMovieById = async (id: string): Promise<MovieResponse> => {
  const response = await api.get(`/api/movies/${id}`);
  return response.data;
};

// Create new movie (Theater Owner, Admin)
export const createMovie = async (movieData: MovieFormData): Promise<MovieResponse> => {
  const response = await api.post('/api/movies', movieData);
  return response.data;
};

// Update movie (Theater Owner - own movies, Admin - all)
export const updateMovie = async (id: string, movieData: Partial<MovieFormData>): Promise<MovieResponse> => {
  const response = await api.put(`/api/movies/${id}`, movieData);
  return response.data;
};

// Delete movie (Theater Owner - own movies, Admin - all)
export const deleteMovie = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/api/movies/${id}`);
  return response.data;
};

// Get my movies (Theater Owner, Admin)
export const getMyMovies = async (): Promise<{ success: boolean; count: number; data: Movie[] }> => {
  const response = await api.get('/api/movies/my/movies');
  return response.data;
};

// Get movie statistics (Admin)
export const getMovieStats = async (): Promise<any> => {
  const response = await api.get('/api/movies/admin/stats');
  return response.data;
};

// Genre options
export const GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'Film-Noir',
  'History',
  'Horror',
  'Music',
  'Musical',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Sport',
  'Thriller',
  'War',
  'Western'
];

// Rating options
export const RATINGS = ['U', 'U/A', 'A', 'S', 'G', 'PG', 'PG-13', 'R', 'NC-17'];

// Status options
export const STATUSES = [
  { value: 'coming_soon', label: 'Coming Soon' },
  { value: 'now_showing', label: 'Now Showing' },
  { value: 'ended', label: 'Ended' }
];

// Helper function to format duration
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Helper function to format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

