// src/modules/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { AuthRepository } from './repo/auth.repo';
import { User, UserDocument, UserRole } from './schema/user.schema';
import { AdminCreateUserDto } from './dto/admin-create-user-dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepo: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

 
  
  async registerEmployeeSelf(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    const exists = await this.authRepo.emailExists(data.email);
    if (exists) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.authRepo.createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: UserRole.EMPLOYEE,
    });

    return user;
  }


  private async baseLogin(data: { email: string; password: string }) {
    const user = await this.authRepo.findByEmail(data.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user._id.toString(), user.role, user.email);

    await this.authRepo.updateRefreshToken(user._id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      rawUser: user as UserDocument,
    };
  }


  async loginOwner(data: { email: string; password: string }) {
    const result = await this.baseLogin(data);

    if (result.rawUser.role !== UserRole.OWNER) {
      throw new ForbiddenException('Only OWNER can login here');
    }

    delete (result as any).rawUser;
    return result;
  }

  async loginStaff(data: { email: string; password: string }) {
    const result = await this.baseLogin(data);

    if (
      result.rawUser.role !== UserRole.TEAM_LEAD &&
      result.rawUser.role !== UserRole.EMPLOYEE
    ) {
      throw new ForbiddenException('OWNER cannot login here');
    }

    delete (result as any).rawUser;
    return result;
  }


  private async generateTokens(userId: string, role: UserRole, email: string) {
    const payload = { sub: userId, role, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: (this.configService.get('JWT_REFRESH_EXPIRES') || '7d') as any,
    });

    return { accessToken, refreshToken };
  }


  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      }) as { sub: string; role: string; email: string };

      const user = (await this.authRepo.findByEmail(payload.email)) as UserDocument;
      if (!user) throw new ForbiddenException('Access denied');

      const storedUser = await this.authRepo.findByRefreshToken(refreshToken);
      if (!storedUser) throw new ForbiddenException('Invalid refresh token');

      const tokens = await this.generateTokens(user._id.toString(), user.role, user.email);

      await this.authRepo.updateRefreshToken(user._id, tokens.refreshToken);

      return tokens;
    } catch (err) {
      throw new ForbiddenException('Invalid or expired refresh token');
    }
  }


  async logout(userId: string) {
    await this.authRepo.clearRefreshToken(userId);
    return { message: 'Logged out successfully' };
  }


  async getProfile(userId: string) {
    const user = await this.authRepo.findById(userId);
    if (!user) throw new UnauthorizedException();
    return user;
  }

  async adminCreateUser(adminUser: UserDocument, data: AdminCreateUserDto) {
    if (adminUser.role !== UserRole.OWNER) {
      throw new ForbiddenException('Only OWNER can create users');
    }

    if (data.role === UserRole.OWNER) {
      throw new ForbiddenException('Cannot create another OWNER');
    }

    const exists = await this.authRepo.emailExists(data.email);
    if (exists) {
      throw new ConflictException('Email already exists');
    }

    const password = data.password || this.generateRandomPassword();

    const user = await this.authRepo.createUser({
      name: data.name,
      email: data.email,
      password,
      role: data.role,
    });

    return {
      message: 'User created successfully',
      user,
      tempPassword: password,
    };
  }

  private generateRandomPassword(length = 10): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$';
    return Array.from({ length })
      .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
      .join('');
  }
}

/*
CONTROLLER ROUTES RECOMMENDED:

POST /auth/employee/register  -> registerEmployeeSelf
POST /auth/owner/login        -> loginOwner
POST /auth/staff/login        -> loginStaff
POST /admin/users             -> adminCreateUser (OWNER only)
*/
