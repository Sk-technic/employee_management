import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeaveBalanceDocument = LeaveBalance & Document;

@Schema({ timestamps: true })
export class LeaveBalance {

  @Prop({ type: Types.ObjectId, ref: 'User', unique: true, required: true })
  userId: Types.ObjectId;

  @Prop({ default: 0 })
  casual: number;

  @Prop({ default: 0 })
  sick: number;

  @Prop({ default: 0 })
  paid: number;
}


export const LeaveBalanceSchema = SchemaFactory.createForClass(LeaveBalance);
