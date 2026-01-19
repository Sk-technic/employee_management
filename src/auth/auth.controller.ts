// src/modules/auth/auth.controller.ts

import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { UserRole } from './schema/user.schema';
import { AdminCreateUserDto } from './dto/admin-create-user-dto';
import { JwtAuthGuard } from 'src/common/guards/jwt_auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorators';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('owner/login')
    @Roles(UserRole.OWNER)
    ownerLogin(@Body() dto: LoginDto) {
        return this.authService.loginOwner(dto);
    }

    @Post('staff/login')
    @Roles(UserRole.EMPLOYEE)
    staffLogin(@Body() dto: LoginDto) {
        return this.authService.loginStaff(dto);
    }

    @Post('employee/register')
    employeeRegister(@Body() dto: RegisterDto) {
        return this.authService.registerEmployeeSelf({
            name: dto.name,
            email: dto.email,
            password: dto.password,
        });
    }

    @Post('refresh')
    refresh(@Body('refreshToken') refreshToken: string) {
        return this.authService.refreshTokens(refreshToken);
    }


    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(@Req() req: any) {
        return this.authService.logout(req.user.userId);
    }


    @Post("admin/users")
    @Roles(UserRole.OWNER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    createUser(@Req() req: any, @Body() dto: AdminCreateUserDto) {
        return this.authService.adminCreateUser(req.user, dto);
    }
}



