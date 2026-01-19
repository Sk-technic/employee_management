import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type SalaryStructureDocument = SalaryStructure & Document;

@Schema({ timestamps: true, collection: 'salary_structures' })
export class SalaryStructure {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true, min: 0 })
  basicSalary: number;

  @Prop({ default: 26 })
  companyWorkingDays: number;

  @Prop({ required: true })
  effectiveFrom: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const SalaryStructureSchema = SchemaFactory.createForClass(SalaryStructure);

SalaryStructureSchema.index({ userId: 1, isActive: 1 }, { unique: true });
