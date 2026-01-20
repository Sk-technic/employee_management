import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Holiday, HolidayDocument } from '../schema/holiday.schema';

@Injectable()
export class HolidayRepository {
  constructor(
    @InjectModel(Holiday.name)
    private readonly holidayModel: Model<HolidayDocument>,
  ) {}

  async create(data: Partial<Holiday>) {
    return this.holidayModel.create(data);
  }

  async findByDate(date: Date) {
    return this.holidayModel.findOne({ date, isActive: true });
  }

  async findById(id: string | Types.ObjectId) {
    return this.holidayModel.findById(id);
  }

  async updateById(id: string, data: Partial<Holiday>) {
    return this.holidayModel.findByIdAndUpdate(id, data, { new: true });
  }

  async findByMonth(month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    return this.holidayModel.find({
      date: { $gte: start, $lte: end },
      isActive: true,
    });
  }

  async disable(id: string) {
    return this.holidayModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );
  }
}
