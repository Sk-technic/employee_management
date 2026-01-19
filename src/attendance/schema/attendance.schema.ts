import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  HALF_DAY = 'HALF_DAY',
}

@Schema({
  timestamps: true,
  collection: 'attendances',
})
export class Attendance {

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    index: true,
  })
  date: string;

  @Prop({
    type: Date,
    default: null,
  })
  inTime: Date;

  @Prop({
    type: Date,
    default: null,
  })
  outTime: Date;

  @Prop({
    default: 0,
    min: 0,
  })
  totalWorkingMinutes: number;

  @Prop({
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
    index: true,
  })
  status: AttendanceStatus;

  @Prop({
    default: 'GENERAL',
  })
  shift: string;

  @Prop({
    enum: ['WEB', 'MOBILE', 'SYSTEM'],
    default: 'WEB',
  })
  source: string;

  @Prop()
  remarks?: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

AttendanceSchema.index(
  { userId: 1, date: 1 },
  { unique: true }
);

AttendanceSchema.index({ date: 1 });

AttendanceSchema.index({ status: 1 });
