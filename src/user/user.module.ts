import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './repo/user.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [UserController],
  providers: [UserService,UserRepository],
  exports:[UserService]
})
export class UserModule {}
