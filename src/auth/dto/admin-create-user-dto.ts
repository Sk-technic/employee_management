import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { UserRole } from '../schema/user.schema';


export class AdminCreateUserDto {
@IsNotEmpty()
name: string;


@IsEmail()
email: string;


@IsEnum(UserRole)
role: UserRole;


@IsOptional()
@MinLength(6)
password?: string; // optional (auto-generate if not provided)
}