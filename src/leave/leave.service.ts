import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { LeaveRepository } from './repo/leave.repo';
import { ApplyLeaveDto } from './dto/apply.leave.dto';
import { UserRole } from 'src/auth/schema/user.schema';

@Injectable()
export class LeaveService {
  constructor(private readonly leaveRepo: LeaveRepository) { }

  async applyLeave(userId: string, dto: ApplyLeaveDto) {
    const user = await this.leaveRepo.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const fromDate = new Date(dto.fromDate);
    const toDate = new Date(dto.toDate);

    if (fromDate > toDate) {
      throw new BadRequestException('From date cannot be after To date');
    }

    const f = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    const t = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());

    const totalDays = Math.floor((t.getTime() - f.getTime()) / 86400000) + 1;

    const usedDays = await this.leaveRepo.getUsedLeaveDaysThisMonth(user._id, f);
    console.log(totalDays, usedDays)
    if (usedDays + totalDays > 3) {
      throw new BadRequestException('You can take only 3 leave days per month');
    }

    const approverId = await this.leaveRepo.resolveApprover(user);

    return this.leaveRepo.createLeave({
      employeeId: user._id,
      teamLeadId: approverId,
      type: dto.type,
      fromDate: f,
      toDate: t,
      reason: dto.reason,
      status: 'PENDING',
    });
  }


  async getMyLeaves(userId: string) {
    return this.leaveRepo.findLeavesByEmployee(new Types.ObjectId(userId));
  }

  async getPendingLeaves(currentUser: any) {
    if (currentUser.role === UserRole.TEAM_LEAD) {
      return this.leaveRepo.findPendingLeavesForTL(currentUser.userId);
    }

    if (
      currentUser.role === UserRole.OWNER) {
      return this.leaveRepo.findAllPendingLeaves();
    }

    throw new ForbiddenException('Access denied');
  }

  async approveLeave(leaveId: string, actionBy: string) {
    const leave = await this.leaveRepo.findLeaveById(leaveId);

    if (!leave) throw new NotFoundException('Leave request not found');

    if (leave.status !== 'PENDING') {
      throw new BadRequestException('Leave already processed');
    }

    const approver = await this.leaveRepo.findUserById(actionBy);

    if (!approver) throw new NotFoundException('Approver not found');

    if (
      approver.role === UserRole.TEAM_LEAD &&
      leave.teamLeadId.toString() !== approver._id.toString()
    ) {
      throw new ForbiddenException('Not authorized to approve this leave');
    }

    return this.leaveRepo.updateLeaveStatus(leaveId, {
      status: 'APPROVED',
      actionBy: approver._id,
    });
  }

  async rejectLeave(leaveId: string, actionBy: string, reason: string) {
    const leave = await this.leaveRepo.findLeaveById(leaveId);

    if (!leave) throw new NotFoundException('Leave request not found');

    if (leave.status !== 'PENDING') {
      throw new BadRequestException('Leave already processed');
    }

    const approver = await this.leaveRepo.findUserById(actionBy);

    if (!approver) throw new NotFoundException('Approver not found');

    if (
      approver.role === UserRole.TEAM_LEAD &&
      leave.teamLeadId.toString() !== approver._id.toString()
    ) {
      throw new ForbiddenException('Not authorized to reject this leave');
    }

    return this.leaveRepo.updateLeaveStatus(leaveId, {
      status: 'REJECTED',
      actionBy: approver._id,
      rejectionReason: reason,
    });
  }

  async leavesHistory(employeeId:string){
      return this.leaveRepo.getLeavesHistory(employeeId)
  }
}
