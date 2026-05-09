import { Body, Controller, Post } from '@nestjs/common';
import { AuthService, type AuthResponse } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: Record<string, unknown>): Promise<AuthResponse> {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: Record<string, unknown>): Promise<AuthResponse> {
    return this.authService.login(body);
  }
}
