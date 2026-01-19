import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Salary } from '../schema/salarySnapshort.schema';

@Injectable()
export class SalaryRepository {

  constructor(
    @InjectModel(Salary.name)
    private readonly salaryModel: Model<Salary>,
  ) {}

  async createSalary(data: Partial<Salary>) {
    const salary = new this.salaryModel(data);
    return salary.save();
  }

  async findByUserAndMonth(
    userId: Types.ObjectId,
    month: number,
    year: number,
  ) {
    return this.salaryModel.findOne({ userId, month, year }).exec();
  }

  async findAllByMonth(month: number, year: number) {
    return this.salaryModel
      .find({ month, year })
      .populate('userId', 'name email role')
      .exec();
  }

  async findByUser(userId: Types.ObjectId) {
    return this.salaryModel
      .find({ userId })
      .sort({ year: -1, month: -1 })
      .exec();
  }

  async updateStatus(
    salaryId: Types.ObjectId,
    status: 'PAID' | 'PENDING',
  ) {
    return this.salaryModel.findByIdAndUpdate(
      salaryId,
      { status },
      { new: true },
    );
  }

  async exists(userId: Types.ObjectId, month: number, year: number) {
    const count = await this.salaryModel.countDocuments({ userId, month, year });
    return count > 0;
  }
}
