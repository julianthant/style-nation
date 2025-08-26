import { z } from 'zod';

// Environment variable schemas
export const DatabaseConfigSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
});

export const SupabaseConfigSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_KEY: z.string(),
  SUPABASE_JWT_SECRET: z.string(),
});

export const AuthConfigSchema = z.object({
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
});

export const FacebookConfigSchema = z.object({
  FACEBOOK_APP_ID: z.string(),
  FACEBOOK_APP_SECRET: z.string(),
  FACEBOOK_PAGE_ID: z.string(),
  FACEBOOK_PAGE_ACCESS_TOKEN: z.string(),
  FACEBOOK_WEBHOOK_VERIFY_TOKEN: z.string(),
});

export const ServerConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

// Utility functions
export const validateConfig = <T>(schema: z.ZodSchema<T>, data: Record<string, any>): T => {
  return schema.parse(data);
};

export const getRequiredEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is missing`);
  }
  return value;
};

export const getOptionalEnvVar = (key: string, defaultValue?: string): string | undefined => {
  return process.env[key] || defaultValue;
};

// Constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_FILE_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const CAR_MAKES = [
  'Audi', 'BMW', 'Chevrolet', 'Ford', 'Honda', 'Hyundai', 'Kia', 'Mazda',
  'Mercedes-Benz', 'Nissan', 'Toyota', 'Volkswagen', 'Volvo'
];

export const TRANSMISSION_TYPES = ['MANUAL', 'AUTOMATIC', 'CVT', 'DUAL_CLUTCH'];
export const FUEL_TYPES = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUG_IN_HYBRID'];
export const BODY_TYPES = ['SEDAN', 'SUV', 'TRUCK', 'COUPE', 'CONVERTIBLE', 'WAGON', 'VAN', 'HATCHBACK'];
export const CAR_CONDITIONS = ['NEW', 'USED', 'CERTIFIED_PREOWNED'];
export const LISTING_STATUSES = ['AVAILABLE', 'SOLD', 'RESERVED', 'INACTIVE'];