import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Leave, LeaveDocument } from '../schema/leave.schema';
import { User, UserDocument, UserRole } from 'src/auth/schema/user.schema';

@Injectable()
export class LeaveRepository {
  constructor(
    @InjectModel(Leave.name)
    private readonly leaveModel: Model<LeaveDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) { }

  async findUserById(userId: string) {
    return this.userModel.findById(userId);
  }

  async findOwner(): Promise<UserDocument | null> {
    return this.userModel.findOne({ role: UserRole.OWNER });
  }

  async resolveApprover(user: UserDocument): Promise<Types.ObjectId> {
    if (user.teamLeadId) return user.teamLeadId;

    const owner = await this.findOwner();
    return owner!._id;
  }

  createLeave(data: Partial<Leave>) {
    return this.leaveModel.create(data);
  }

  findLeaveById(id: string) {
    return this.leaveModel.findById(id);
  }

  findLeavesByEmployee(employeeId: Types.ObjectId) {
    return this.leaveModel.find({ employeeId }).sort({ createdAt: -1 });
  }

  findPendingLeavesForTL(tlId: Types.ObjectId) {
    return this.leaveModel.find({
      status: 'PENDING',
      teamLeadId: tlId,
    });
  }

  findAllPendingLeaves() {
    return this.leaveModel.find({ status: 'PENDING' });
  }

  updateLeaveStatus(id: string, update: Partial<Leave>) {
    return this.leaveModel.findByIdAndUpdate(id, update, { new: true });
  }

  async getUsedLeaveDaysThisMonth(employeeId: Types.ObjectId, date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const leaves = await this.leaveModel.find({
      employeeId,
      status: 'APPROVED',
      fromDate: { $lte: end },
      toDate: { $gte: start },
    });

    let total = 0;

    for (const leave of leaves) {
      // normalize to date only (remove time + timezone)
      const f = new Date(
        leave.fromDate.getFullYear(),
        leave.fromDate.getMonth(),
        leave.fromDate.getDate()
      );

      const t = new Date(
        leave.toDate.getFullYear(),
        leave.toDate.getMonth(),
        leave.toDate.getDate()
      );

      const days = Math.round((t.getTime() - f.getTime()) / 86400000) + 1;

      total += days;
    }

    return total;
  }

  async getLeavesHistory(employeeId: string, page = 1, limit = 10) {
  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    throw new BadRequestException('Invalid employeeId');
  }

  return this.leaveModel
    .find({ employeeId: new Types.ObjectId(employeeId) })
    .select('fromDate toDate status leaveType reason createdAt')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}

}
