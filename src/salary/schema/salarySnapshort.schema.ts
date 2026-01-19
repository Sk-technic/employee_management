import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type SalaryDocument = Salary & Document;

@Schema({ timestamps: true, collection: 'salaries' })
export class Salary {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  month: number;  

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  presentDays: number;

  @Prop({ required: true })
  halfDays: number;

  @Prop({ required: true })
  absentDays: number;

  @Prop({ required: true })
  totalWorkingDays: number;

  @Prop({ required: true })
  paidDays: number;

  @Prop({ required: true })
  perDaySalary: number;

  @Prop({ required: true })
  basicSalary: number;

  @Prop({ required: true })
  finalSalary: number;

  @Prop({ enum: ['PENDING', 'PAID'], default: 'PENDING' })
  status: string;
}

export const SalarySchema = SchemaFactory.createForClass(Salary);

SalarySchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });
