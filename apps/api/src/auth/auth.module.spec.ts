import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './auth.module';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
import { SupabaseStrategy } from './strategies/supabase.strategy';

describe('AuthModule', () => {
  let module: TestingModule;
  let configService: ConfigService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        AuthModule,
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn().mockImplementation((key: string) => {
          switch (key) {
            case 'SUPABASE_JWT_SECRET':
              return 'test-supabase-jwt-secret';
            case 'JWT_EXPIRES_IN':
              return '7d';
            default:
              return undefined;
          }
        }),
      })
      .compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should provide JwtAuthGuard', () => {
    const jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
    expect(jwtAuthGuard).toBeDefined();
    expect(jwtAuthGuard).toBeInstanceOf(JwtAuthGuard);
  });

  it('should provide SupabaseStrategy', () => {
    const supabaseStrategy = module.get<SupabaseStrategy>(SupabaseStrategy);
    expect(supabaseStrategy).toBeDefined();
    expect(supabaseStrategy).toBeInstanceOf(SupabaseStrategy);
  });

  it('should configure JWT module with ConfigService', () => {
    const jwtModule = module.get(JwtModule);
    expect(jwtModule).toBeDefined();
    expect(configService.get).toHaveBeenCalledWith('SUPABASE_JWT_SECRET');
  });

  it('should import PassportModule', () => {
    const passportModule = module.get(PassportModule);
    expect(passportModule).toBeDefined();
  });

  it('should export JwtAuthGuard for use in other modules', () => {
    const jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
    expect(jwtAuthGuard).toBeDefined();
  });

  it('should export JwtModule for use in other modules', () => {
    const jwtModule = module.get(JwtModule);
    expect(jwtModule).toBeDefined();
  });
});