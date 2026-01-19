import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import Joi from 'joi';
import { mongoConfig } from './config/database.config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from './config/jwt.config';
import { AuthModule } from './auth/auth.module';
import { EmployeeModule } from './employee/employee.module';
import { LeaveModule } from './leave/leave.module';
import { HolidayModule } from './holiday/holiday.module';
import { SalaryModule } from './salary/salary.module';
import { UserModule } from './user/user.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
                PORT: Joi.number().default(3000),
                MONGO_URI: Joi.string().required(),
                JWT_ACCESS_SECRET: Joi.string().min(32).required(),
                JWT_REFRESH_SECRET: Joi.string().min(32).required(),
                COOKIE_SECRET: Joi.string().min(32).required(),
            })
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: mongoConfig
        }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: jwtConfig,
        }),
        AuthModule,
        EmployeeModule,
        LeaveModule,
        HolidayModule,
        SalaryModule,
        UserModule,
        AttendanceModule,
    ]
})
export class AppModule { }
