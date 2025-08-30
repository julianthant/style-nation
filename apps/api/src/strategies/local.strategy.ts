import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Use email instead of username
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    // Delegate to AuthService for centralized admin authentication logic
    const admin = await this.authService.validateCredentials(email, password);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return admin;
  }
}