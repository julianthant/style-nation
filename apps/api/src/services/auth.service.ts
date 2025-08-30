import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginDto } from '../dto/auth/login.dto';
import { AuthEntity } from '../entities/auth.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MINUTES = 15;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto): Promise<AuthEntity> {
    const { email, password } = loginDto;

    // Find admin by email
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / (1000 * 60));
      throw new HttpException(
        `Account locked. Try again in ${remainingTime} minutes.`,
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      await this.handleFailedLogin(admin.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    await this.resetFailedAttempts(admin.id);

    // Generate tokens using the admin object
    return this.generateTokens({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });
  }

  async generateTokens(user: any): Promise<AuthEntity> {
    // Generate JWT tokens
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Store refresh token and update last login
    await this.prisma.admin.update({
      where: { id: user.id },
      data: {
        refreshToken: await bcrypt.hash(refreshToken, this.SALT_ROUNDS),
        lastLoginAt: new Date(),
      },
    });

    return new AuthEntity({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthEntity> {
    try {
      // Verify refresh token
      const decoded = this.jwtService.verify(refreshToken);

      // Find admin with stored refresh token
      const admin = await this.prisma.admin.findUnique({
        where: { id: decoded.sub },
      });

      if (!admin || !admin.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Validate refresh token against stored hash
      const isRefreshTokenValid = await bcrypt.compare(refreshToken, admin.refreshToken);
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const payload = {
        sub: admin.id,
        email: admin.email,
        role: admin.role,
      };

      const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      // Update stored refresh token
      await this.prisma.admin.update({
        where: { id: admin.id },
        data: {
          refreshToken: await bcrypt.hash(newRefreshToken, this.SALT_ROUNDS),
        },
      });

      return new AuthEntity({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(adminId: string): Promise<void> {
    // Clear refresh token and update logout time
    await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        refreshToken: null,
        // We could add a lastLogoutAt field here for audit purposes
      },
    });

    // Note: For full security, consider implementing a JWT blacklist
    // This would require storing active JWTs in Redis or database
    // For now, clearing refresh token prevents refresh operations
  }

  async validateAdmin(adminId: string): Promise<any> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return null;
    }

    // Return admin data without sensitive information
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
  }

  // Keep validateUser for backwards compatibility
  async validateUser(userId: string): Promise<any> {
    return this.validateAdmin(userId);
  }

  async validateCredentials(email: string, password: string): Promise<any> {
    // Find admin by email
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return null; // Don't reveal if admin exists
    }

    // Check if account is locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      // Increment failed attempts but don't throw here - let LocalStrategy handle it
      await this.handleFailedLogin(admin.id);
      return null;
    }

    // Reset failed attempts on successful validation
    await this.resetFailedAttempts(admin.id);

    // Return admin data without sensitive information
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  private async handleFailedLogin(adminId: string): Promise<void> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: { failedLoginAttempts: true },
    });

    const newFailedAttempts = (admin?.failedLoginAttempts || 0) + 1;

    // Determine if account should be locked
    const shouldLock = newFailedAttempts >= this.MAX_FAILED_ATTEMPTS;
    const lockedUntil = shouldLock
      ? new Date(Date.now() + this.LOCKOUT_DURATION_MINUTES * 60 * 1000)
      : null;

    await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        failedLoginAttempts: newFailedAttempts,
        lockedUntil,
      },
    });
  }

  private async resetFailedAttempts(adminId: string): Promise<void> {
    await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }
}
