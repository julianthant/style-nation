import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SupabaseStrategy } from './supabase.strategy';

describe('SupabaseStrategy', () => {
  let strategy: SupabaseStrategy;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-supabase-jwt-secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<SupabaseStrategy>(SupabaseStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should use SUPABASE_JWT_SECRET from config service', () => {
    expect(configService.get).toHaveBeenCalledWith('SUPABASE_JWT_SECRET');
  });

  describe('validate', () => {
    it('should return Supabase JWT payload as-is', async () => {
      const supabasePayload = {
        iss: 'https://test-project.supabase.co/auth/v1',
        sub: 'e841cda5-1428-4e62-9c83-039d393e589b',
        aud: 'authenticated',
        exp: 1727865444,
        iat: 1727861844,
        email: 'test@example.com',
        phone: '',
        app_metadata: {
          provider: 'email',
          providers: ['email'],
        },
        user_metadata: {
          email: 'test@example.com',
          email_verified: false,
          phone_verified: false,
          sub: 'e841cda5-1428-4e62-9c83-039d393e589b',
        },
        role: 'authenticated',
        aal: 'aal1',
        amr: [
          {
            method: 'password',
            timestamp: 1727861844,
          },
        ],
        session_id: 'fafa54d0-7abf-44e0-b81c-5d45a364b496',
        is_anonymous: false,
      };

      const result = await strategy.validate(supabasePayload);

      expect(result).toEqual(supabasePayload);
    });

    it('should handle minimal Supabase payload', async () => {
      const minimalPayload = {
        iss: 'https://test-project.supabase.co/auth/v1',
        sub: 'user-id-123',
        aud: 'authenticated',
        email: 'user@test.com',
        role: 'authenticated',
        exp: Date.now() / 1000 + 3600, // 1 hour from now
        iat: Date.now() / 1000,
      };

      const result = await strategy.validate(minimalPayload);

      expect(result).toEqual(minimalPayload);
    });

    it('should validate required Supabase JWT fields', async () => {
      const supabasePayload = {
        iss: 'https://test-project.supabase.co/auth/v1',
        sub: 'e841cda5-1428-4e62-9c83-039d393e589b',
        aud: 'authenticated',
        email: 'admin@example.com',
        role: 'authenticated',
        app_metadata: {
          provider: 'email',
          providers: ['email'],
        },
        user_metadata: {
          email: 'admin@example.com',
          email_verified: true,
        },
        session_id: 'test-session-id',
        exp: 1727865444,
        iat: 1727861844,
      };

      const result = await strategy.validate(supabasePayload);

      expect(result).toEqual(supabasePayload);
      expect(result.iss).toContain('supabase.co/auth/v1');
      expect(result.aud).toBe('authenticated');
      expect(result.role).toBe('authenticated');
    });

    it('should handle Supabase payload with phone authentication', async () => {
      const phoneAuthPayload = {
        iss: 'https://test-project.supabase.co/auth/v1',
        sub: 'phone-user-id',
        aud: 'authenticated',
        phone: '+1234567890',
        role: 'authenticated',
        app_metadata: {
          provider: 'phone',
          providers: ['phone'],
        },
        user_metadata: {
          phone: '+1234567890',
          phone_verified: true,
        },
        amr: [
          {
            method: 'otp',
            timestamp: 1727861844,
          },
        ],
        session_id: 'phone-session-id',
        exp: 1727865444,
        iat: 1727861844,
      };

      const result = await strategy.validate(phoneAuthPayload);

      expect(result).toEqual(phoneAuthPayload);
      expect(result.app_metadata.provider).toBe('phone');
    });
  });
});