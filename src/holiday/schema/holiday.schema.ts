import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HolidayDocument = Holiday & Document;

@Schema({ timestamps: true })
export class Holiday {

  // Holiday name (e.g., Diwali, Christmas)
  @Prop({ required: true, trim: true })
  name: string;

  // Holiday date
  @Prop({ required: true, unique: true })
  date: Date;

  // PUBLIC or RESTRICTED holiday
  @Prop({ required: true, enum: ['PUBLIC', 'RESTRICTED'] })
  type: string;

  // Optional description
  @Prop()
  description: string;

  // Soft delete / enable-disable
  @Prop({ default: true })
  isActive: boolean;

  // Admin who created this holiday
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const HolidaySchema = SchemaFactory.createForClass(Holiday);
