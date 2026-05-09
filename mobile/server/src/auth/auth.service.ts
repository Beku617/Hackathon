import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  user: PublicUser;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async register(payload: Record<string, unknown>): Promise<AuthResponse> {
    const username = this.normalizeUsername(payload.username);
    const fullName = this.normalizeFullName(payload.fullName);
    const phone = this.normalizePhone(payload.phone);
    const email = this.normalizeEmail(payload.email);
    const password = this.readPassword(payload.password);

    if (!username || !/^[a-z0-9._]{3,30}$/.test(username)) {
      throw new BadRequestException(
        'Username must be 3-30 chars and use letters, numbers, dot, or underscore',
      );
    }

    if (!email || !this.isValidEmail(email)) {
      throw new BadRequestException('Provide a valid email');
    }

    if (!fullName || fullName.length < 2 || fullName.length > 60) {
      throw new BadRequestException('Full name must be 2-60 chars');
    }

    if (!phone || !/^\d{8,15}$/.test(phone)) {
      throw new BadRequestException('Phone must contain 8-15 digits');
    }

    if (password.length < 8 || password.length > 64) {
      throw new BadRequestException('Password must be 8-64 chars');
    }

    const [emailExists, usernameExists] = await Promise.all([
      this.userModel.exists({ email }),
      this.userModel.exists({ username }),
    ]);

    if (emailExists) {
      throw new ConflictException('Email already in use');
    }

    if (usernameExists) {
      throw new ConflictException('Username already taken');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userModel.create({
      name: fullName,
      email,
      username,
      phone,
      passwordHash,
      role: 'user',
    });

    return { user: this.toPublicUser(user) };
  }

  async login(payload: Record<string, unknown>): Promise<AuthResponse> {
    const identifier = this.normalizeIdentifier(payload);
    const password = this.readPassword(payload.password);

    if (!identifier) {
      throw new BadRequestException('Provide an email or username');
    }

    if (!password) {
      throw new BadRequestException('Password is required');
    }

    const user = await this.userModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return { user: this.toPublicUser(user) };
  }

  private normalizeIdentifier(payload: Record<string, unknown>): string {
    const identifierCandidate =
      payload.email ?? payload.identifier ?? payload.username;
    return String(identifierCandidate || '').trim().toLowerCase();
  }

  private normalizeUsername(value: unknown): string {
    return String(value || '')
      .trim()
      .replace(/^@+/, '')
      .toLowerCase();
  }

  private normalizeEmail(value: unknown): string {
    return String(value || '').trim().toLowerCase();
  }

  private normalizeFullName(value: unknown): string {
    return String(value || '').trim();
  }

  private normalizePhone(value: unknown): string {
    return String(value || '').replace(/\D/g, '').trim();
  }

  private readPassword(value: unknown): string {
    return String(value || '');
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private toPublicUser(user: UserDocument): PublicUser {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      username: user.username,
      phone: user.phone,
      role: user.role,
    };
  }
}
