// Authentication types matching backend API
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  emailVerified?: boolean;
  image?: string | null;
  lastLoginAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// API endpoints matching backend
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh', 
  LOGOUT: '/auth/logout',
  PROFILE: '/admin/profile',
} as const;

// Storage keys
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'admin_access_token',
  REFRESH_TOKEN: 'admin_refresh_token',
  USER: 'admin_user',
} as const;

// Admin role constants
export const USER_ROLES = {
  ADMIN: 'ADMIN',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];