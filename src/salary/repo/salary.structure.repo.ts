import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SalaryStructure } from '../schema/salaryStructure.schema';

@Injectable()
export class SalaryStructureRepository {

  constructor(
    @InjectModel(SalaryStructure.name)
    private readonly model: Model<SalaryStructure>,
  ) {}

  async create(data: Partial<SalaryStructure>) {
    return this.model.create(data);
  }

  async findActiveByUser(userId: Types.ObjectId) {
    return this.model.findOne({ userId, isActive: true });
  }

  async deactivateActive(userId: Types.ObjectId) {
    return this.model.updateMany(
      { userId, isActive: true },
      { isActive: false },
    );
  }

  async findHistoryByUser(userId: Types.ObjectId) {
    return this.model
      .find({ userId })
      .sort({ effectiveFrom: -1 });
  }
}
