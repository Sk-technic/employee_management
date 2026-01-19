import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AttendanceService } from '../attendance/attendance.service';
import { Salary } from './schema/salarySnapshort.schema';
import { SalaryStructure } from './schema/salaryStructure.schema';

@Injectable()
export class SalaryService {
  constructor(
    @InjectModel(Salary.name)
    private readonly salaryModel: Model<Salary>,

    @InjectModel(SalaryStructure.name)
    private readonly structureModel: Model<SalaryStructure>,

    private readonly attendanceService: AttendanceService,
  ) {}

  async createOrUpdateStructure(data: {
    userId: string;
    basicSalary: number;
    companyWorkingDays?: number;
    effectiveFrom: string;
  }) {
    const userObjectId = new Types.ObjectId(data.userId);

    await this.structureModel.updateMany(
      { userId: userObjectId, isActive: true },
      { isActive: false },
    );

    return this.structureModel.create({
      userId: userObjectId,
      basicSalary: data.basicSalary,
      companyWorkingDays: data.companyWorkingDays ?? 26,
      effectiveFrom: new Date(data.effectiveFrom),
      isActive: true,
    });
  }

  async getActiveStructure(userId: Types.ObjectId) {
    const structure = await this.structureModel.findOne({
      userId,
      isActive: true,
    });

    if (!structure) {
      throw new BadRequestException('Salary structure not found for this user');
    }

    return structure;
  }

  async generateSalaryForUser(
    userId: Types.ObjectId,
    month: number,
    year: number,
  ) {
    const exists = await this.salaryModel.countDocuments({ userId, month, year });
    if (exists > 0) {
      throw new BadRequestException('Salary already generated for this month');
    }

    const structure = await this.getActiveStructure(userId);

    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const summary =
      await this.attendanceService.getMonthlySummaryForOwner(userId, monthStr);

    const { presentDays, halfDays, absentDays } = summary;

    const perDaySalary = structure.basicSalary / structure.companyWorkingDays;
    const paidDays = presentDays + halfDays * 0.5;
    const finalSalary = Number((paidDays * perDaySalary).toFixed(2));

    return this.salaryModel.create({
      userId,
      month,
      year,
      presentDays,
      halfDays,
      absentDays,
      totalWorkingDays: structure.companyWorkingDays,
      paidDays,
      perDaySalary,
      basicSalary: structure.basicSalary,
      finalSalary,
      status: 'PENDING',
    });
  }

  async getMySalaryHistory(userId: Types.ObjectId) {
    return this.salaryModel.find({ userId }).sort({ year: -1, month: -1 });
  }

  async getSalariesByMonth(month: number, year: number) {
    return this.salaryModel.find({ month, year }).populate('userId', 'name email');
  }

  async updateSalaryStatus(salaryId: Types.ObjectId, status: 'PAID' | 'PENDING') {
    return this.salaryModel.findByIdAndUpdate(
      salaryId,
      { status },
      { new: true },
    );
  }
}
