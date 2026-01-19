import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Attendance, AttendanceSchema } from './schema/attendance.schema';
import { AttendanceRepository } from './repo/attendance.repo';

@Module({
  imports: [
      MongooseModule.forFeature([
        { name: Attendance.name, schema: AttendanceSchema }
      ])
    ],
  controllers: [AttendanceController],
  providers: [AttendanceService,AttendanceRepository],
  exports:[AttendanceService]
})
export class AttendanceModule {}
