import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { LeaveRepository } from './repo/leave.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { Leave, LeaveSchema } from './schema/leave.schema';
import { User, UserSchema } from 'src/auth/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Leave.name, schema: LeaveSchema },
      { name: User.name, schema: UserSchema },
    ])
  ],
  controllers: [LeaveController],
  providers: [LeaveService,LeaveRepository]
})
export class LeaveModule { }
