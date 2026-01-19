import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

export enum UserRole {
  OWNER = 'OWNER',
  TEAM_LEAD = 'TEAM_LEAD',
  EMPLOYEE = 'EMPLOYEE',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.EMPLOYEE })
  role: UserRole;

  @Prop()
  refreshToken?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  teamLeadId: Types.ObjectId | null;
}

export const UserSchema = SchemaFactory.createForClass(User);


UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) return ;

  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
});
