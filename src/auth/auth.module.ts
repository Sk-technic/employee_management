import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './repo/auth.repo';
import { User,UserSchema } from './schema/user.schema';
import { JwtStrategy } from './startegy/auth.strategy';
import { OwnerSeedService } from './owner-seed.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    JwtStrategy,
    OwnerSeedService
  ],
  exports: [AuthService],
})
export class AuthModule {}
