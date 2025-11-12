import api from './api';

// TypeScript Interfaces
export interface SeatCategory {
  name: string;
  price: number;
  seats: string[];
}

export interface SeatLayout {
  rows: number;
  columns: number;
  categories: SeatCategory[];
}

export interface Screen {
  screenNumber: number;
  screenName: string;
  totalSeats: number;
}

export interface BookedSeat {
  seatNumber: string;
  booking?: string;
}

export interface Show {
  _id: string;
  movie: {
    _id: string;
    title: string;
    posterUrl: string;
    duration: number;
    rating: string;
    language?: string;
  };
  theater: {
    _id: string;
    theaterName: string;
    address: {
      city: string;
      state: string;
      street?: string;
      zipCode?: string;
    };
  };
  screen: Screen;
  showDate: string;
  showTime: string;
  seatLayout: SeatLayout;
  bookedSeats: BookedSeat[];
  basePrice: number;
  convenienceFee: number;
  language: string;
  format: '2D' | '3D' | 'IMAX' | '4DX' | 'Dolby Atmos';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
  availableSeats?: number;
  showDateTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShowFormData {
  movie: string;
  theater: string;
  screen: {
    screenNumber: number;
    screenName: string;
    totalSeats: number;
  };
  showDate: string;
  showTime: string;
  seatLayout: SeatLayout;
  basePrice: number;
  convenienceFee?: number;
  language?: string;
  format?: '2D' | '3D' | 'IMAX' | '4DX' | 'Dolby Atmos';
}

export interface ShowsResponse {
  success: boolean;
  count: number;
  total?: number;
  page?: number;
  pages?: number;
  data: Show[] | {
    shows: Show[];
    grouped: any;
  };
  message?: string;
}

export interface ShowResponse {
  success: boolean;
  data: Show;
  message?: string;
}

export interface Seat {
  seatNumber: string;
  category: string;
  price: number;
  isBooked: boolean;
}

export interface ShowSeatsResponse {
  success: boolean;
  data: {
    totalSeats: number;
    availableSeats: number;
    bookedSeats: number;
    seatLayout: SeatLayout;
    seats: Seat[];
  };
}

export interface ShowStatsResponse {
  success: boolean;
  data: {
    totalShows: number;
    statusBreakdown: Array<{ _id: string; count: number }>;
    formatBreakdown: Array<{ _id: string; count: number }>;
    upcomingShows: number;
    averageOccupancy: number;
  };
}

// Show formats and statuses
export const SHOW_FORMATS = ['2D', '3D', 'IMAX', '4DX', 'Dolby Atmos'] as const;
export const SHOW_STATUSES = ['scheduled', 'ongoing', 'completed', 'cancelled'] as const;

// Default seat categories
export const DEFAULT_SEAT_CATEGORIES: SeatCategory[] = [
  { name: 'Regular', price: 150, seats: [] },
  { name: 'Premium', price: 200, seats: [] },
  { name: 'VIP', price: 300, seats: [] }
];

// API Functions

// Get all shows with filters
export const getAllShows = async (params?: {
  movie?: string;
  theater?: string;
  date?: string;
  status?: string;
  format?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}): Promise<ShowsResponse> => {
  const response = await api.get('/shows', { params });
  return response.data;
};

// Get single show by ID
export const getShowById = async (id: string): Promise<ShowResponse> => {
  const response = await api.get(`/shows/${id}`);
  return response.data;
};

// Create new show
export const createShow = async (data: ShowFormData): Promise<ShowResponse> => {
  const response = await api.post('/shows', data);
  return response.data;
};

// Update show
export const updateShow = async (id: string, data: Partial<ShowFormData>): Promise<ShowResponse> => {
  const response = await api.put(`/shows/${id}`, data);
  return response.data;
};

// Delete show
export const deleteShow = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/shows/${id}`);
  return response.data;
};

// Get shows by movie
export const getShowsByMovie = async (
  movieId: string,
  params?: { date?: string; theater?: string; city?: string }
): Promise<ShowsResponse> => {
  const response = await api.get(`/shows/movie/${movieId}`, { params });
  return response.data;
};

// Get shows by theater
export const getShowsByTheater = async (
  theaterId: string,
  params?: { date?: string }
): Promise<ShowsResponse> => {
  const response = await api.get(`/shows/theater/${theaterId}`, { params });
  return response.data;
};

// Get my shows (for theater owners)
export const getMyShows = async (): Promise<ShowsResponse> => {
  const response = await api.get('/shows/my/shows');
  return response.data;
};

// Get show seat availability
export const getShowSeats = async (showId: string): Promise<ShowSeatsResponse> => {
  const response = await api.get(`/shows/${showId}/seats`);
  return response.data;
};

// Get show statistics (admin only)
export const getShowStats = async (): Promise<ShowStatsResponse> => {
  const response = await api.get('/shows/admin/stats');
  return response.data;
};

// Utility functions

// Generate seat layout
export const generateSeatLayout = (
  rows: number,
  seatsPerRow: number,
  categories: SeatCategory[]
): SeatLayout => {
  const seats: string[] = [];
  
  // Generate seat numbers (A1, A2, B1, B2, etc.)
  for (let i = 0; i < rows; i++) {
    const rowLetter = String.fromCharCode(65 + i); // A, B, C, ...
    for (let j = 1; j <= seatsPerRow; j++) {
      seats.push(`${rowLetter}${j}`);
    }
  }

  // Distribute seats among categories
  const totalSeats = seats.length;
  const updatedCategories = categories.map((category, index) => {
    const startIndex = Math.floor((totalSeats / categories.length) * index);
    const endIndex = Math.floor((totalSeats / categories.length) * (index + 1));
    return {
      ...category,
      seats: seats.slice(startIndex, endIndex)
    };
  });

  return {
    rows,
    columns: seatsPerRow,
    categories: updatedCategories
  };
};

// Format show date and time
export const formatShowDateTime = (showDate: string, showTime: string): string => {
  const date = new Date(showDate);
  const dateStr = date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
  return `${dateStr} at ${formatTime(showTime)}`;
};

// Format time (24h to 12h)
export const formatTime = (time24: string): string => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Check if show is today
export const isToday = (showDate: string): boolean => {
  const today = new Date();
  const show = new Date(showDate);
  return (
    today.getFullYear() === show.getFullYear() &&
    today.getMonth() === show.getMonth() &&
    today.getDate() === show.getDate()
  );
};

// Get next 7 days
export const getNext7Days = (): Array<{ date: string; label: string }> => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const label = i === 0 
      ? 'Today' 
      : i === 1 
        ? 'Tomorrow' 
        : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    days.push({
      date: date.toISOString().split('T')[0],
      label
    });
  }
  
  return days;
};

// Calculate total price
export const calculateTotalPrice = (seats: Seat[]): number => {
  const subtotal = seats.reduce((total, seat) => total + seat.price, 0);
  return subtotal;
};

