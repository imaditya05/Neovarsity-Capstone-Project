import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'theater_owner' | 'admin';
  phone?: string;
  theaterDetails?: {
    theaterName?: string;
    address?: string;
    city?: string;
    state?: string;
    licenseNumber?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'theater_owner';
  phone?: string;
  theaterDetails?: {
    theaterName?: string;
    address?: string;
    city?: string;
    state?: string;
    licenseNumber?: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Login
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};

// Register
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/api/auth/register', data);
  return response.data;
};

// Get current user
export const getMe = async (): Promise<{ success: boolean; data: { user: User } }> => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

// Update profile
export const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; data: { user: User } }> => {
  const response = await api.put('/api/auth/profile', data);
  return response.data;
};

// Store auth data
export const storeAuthData = (token: string, user: User) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Get stored auth data
export const getStoredAuthData = (): { token: string | null; user: User | null } => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  return { token, user };
};

// Clear auth data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

