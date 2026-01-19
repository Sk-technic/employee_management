import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SalaryService } from './salary.service';
import { SalaryController } from './salary.controller';

import { Salary, SalarySchema } from './schema/salarySnapshort.schema';
import { SalaryStructure, SalaryStructureSchema } from './schema/salaryStructure.schema';

import { AttendanceModule } from '../attendance/attendance.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Salary.name, schema: SalarySchema },
      { name: SalaryStructure.name, schema: SalaryStructureSchema },
    ]),

    AttendanceModule,
  ],
  controllers: [SalaryController],
  providers: [SalaryService],
  exports: [SalaryService],
})
export class SalaryModule {}
