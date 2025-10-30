import api from './api';

export interface Screen {
  _id?: string;
  screenNumber: string;
  screenName?: string;
  capacity: number;
  screenType: '2D' | '3D' | 'IMAX' | '4DX' | 'Dolby Atmos' | 'Standard';
  seatLayout: {
    rows: number;
    seatsPerRow: number;
    categories: {
      name: 'Premium' | 'Regular' | 'VIP' | 'Economy';
      rows: string[];
      price: number;
    }[];
  };
  facilities: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Theater {
  _id: string;
  theaterName: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
  };
  location?: {
    type: string;
    coordinates: number[];
  };
  contact: {
    phone: string;
    email?: string;
  };
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  licenseNumber: string;
  screens: Screen[];
  facilities: string[];
  operatingHours?: {
    openTime: string;
    closeTime: string;
  };
  images?: {
    url: string;
    caption?: string;
  }[];
  averageRating: number;
  totalReviews: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  adminNotes?: string;
  isActive: boolean;
  totalScreens?: number;
  totalCapacity?: number;
  fullAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TheaterFormData {
  theaterName: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    country?: string;
  };
  contact: {
    phone: string;
    email?: string;
  };
  licenseNumber: string;
  facilities?: string[];
  operatingHours?: {
    openTime: string;
    closeTime: string;
  };
  images?: {
    url: string;
    caption?: string;
  }[];
}

export interface ScreenFormData {
  screenNumber: string;
  screenName?: string;
  capacity: number;
  screenType: '2D' | '3D' | 'IMAX' | '4DX' | 'Dolby Atmos' | 'Standard';
  seatLayout: {
    rows: number;
    seatsPerRow: number;
    categories: {
      name: 'Premium' | 'Regular' | 'VIP' | 'Economy';
      rows: string[];
      price: number;
    }[];
  };
  facilities?: string[];
}

export interface TheatersResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Theater[];
}

export interface TheaterResponse {
  success: boolean;
  data: Theater;
  message?: string;
}

export interface TheaterQueryParams {
  city?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Get all theaters with filters
export const getAllTheaters = async (params?: TheaterQueryParams): Promise<TheatersResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const response = await api.get(`/api/theaters?${queryParams.toString()}`);
  return response.data;
};

// Get single theater by ID
export const getTheaterById = async (id: string): Promise<TheaterResponse> => {
  const response = await api.get(`/api/theaters/${id}`);
  return response.data;
};

// Create new theater (Theater Owner, Admin)
export const createTheater = async (theaterData: TheaterFormData): Promise<TheaterResponse> => {
  const response = await api.post('/api/theaters', theaterData);
  return response.data;
};

// Update theater
export const updateTheater = async (id: string, theaterData: Partial<TheaterFormData>): Promise<TheaterResponse> => {
  const response = await api.put(`/api/theaters/${id}`, theaterData);
  return response.data;
};

// Delete theater
export const deleteTheater = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/api/theaters/${id}`);
  return response.data;
};

// Get my theaters
export const getMyTheaters = async (): Promise<{ success: boolean; count: number; data: Theater[] }> => {
  const response = await api.get('/api/theaters/my/theaters');
  return response.data;
};

// Screen management
export const addScreen = async (theaterId: string, screenData: ScreenFormData): Promise<TheaterResponse> => {
  const response = await api.post(`/api/theaters/${theaterId}/screens`, screenData);
  return response.data;
};

export const updateScreen = async (
  theaterId: string,
  screenId: string,
  screenData: Partial<ScreenFormData>
): Promise<TheaterResponse> => {
  const response = await api.put(`/api/theaters/${theaterId}/screens/${screenId}`, screenData);
  return response.data;
};

export const deleteScreen = async (theaterId: string, screenId: string): Promise<TheaterResponse> => {
  const response = await api.delete(`/api/theaters/${theaterId}/screens/${screenId}`);
  return response.data;
};

// Admin: Update theater status
export const updateTheaterStatus = async (
  theaterId: string,
  status: 'approved' | 'rejected' | 'suspended',
  adminNotes?: string
): Promise<TheaterResponse> => {
  const response = await api.put(`/api/theaters/${theaterId}/status`, { status, adminNotes });
  return response.data;
};

// Admin: Get theater statistics
export const getTheaterStats = async (): Promise<any> => {
  const response = await api.get('/api/theaters/admin/stats');
  return response.data;
};

// Constants
export const SCREEN_TYPES = ['2D', '3D', 'IMAX', '4DX', 'Dolby Atmos', 'Standard'] as const;

export const SEAT_CATEGORIES = ['Premium', 'Regular', 'VIP', 'Economy'] as const;

export const THEATER_FACILITIES = [
  'Parking',
  'Food Court',
  'Wheelchair Access',
  'Online Booking',
  'M-Ticket',
  'Restrooms',
  'ATM',
  'WiFi'
];

export const SCREEN_FACILITIES = [
  'Wheelchair Access',
  'Recliner Seats',
  'Dolby Sound',
  'Air Conditioned',
  'Food Court'
];

// Helper functions
export const formatCapacity = (capacity: number): string => {
  return `${capacity} seats`;
};

export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'approved':
      return 'bg-green-500';
    case 'pending':
      return 'bg-yellow-500';
    case 'rejected':
      return 'bg-red-500';
    case 'suspended':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'pending':
      return 'Pending Approval';
    case 'rejected':
      return 'Rejected';
    case 'suspended':
      return 'Suspended';
    default:
      return status;
  }
};

