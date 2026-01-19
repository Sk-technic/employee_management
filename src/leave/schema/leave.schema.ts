import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeaveDocument = Leave & Document;

@Schema({ timestamps: true })
export class Leave {

  // Employee who applied
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  employeeId: Types.ObjectId;

  // Team Lead responsible for approval
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teamLeadId: Types.ObjectId;

  // Leave type
  @Prop({ required: true, enum: ['CL', 'SL', 'PL'] })
  type: string;

  // Date range
  @Prop({ required: true })
  fromDate: Date;

  @Prop({ required: true })
  toDate: Date;

  // Reason
  @Prop({ required: true })
  reason: string;

  // Status
  @Prop({
    required: true,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  })
  status: string;

  // Who approved / rejected (TL or OWNER)
  @Prop({ type: Types.ObjectId, ref: 'User' })
  actionBy: Types.ObjectId;

  // If rejected
  @Prop()
  rejectionReason: string;
}

export const LeaveSchema = SchemaFactory.createForClass(Leave);
