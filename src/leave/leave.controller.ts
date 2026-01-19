import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { ApplyLeaveDto } from './dto/apply.leave.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt_auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorators';
import { UserRole } from 'src/auth/schema/user.schema';

@Controller('leave')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  // ================= EMPLOYEE =================

  @Post('apply')
  @Roles(UserRole.EMPLOYEE, UserRole.TEAM_LEAD)
  applyLeave(@Req() req, @Body() dto: ApplyLeaveDto) {
    return this.leaveService.applyLeave(req.user.userId, dto);
  }

  @Get('my-leaves')
  @Roles(UserRole.EMPLOYEE, UserRole.TEAM_LEAD)
  getMyLeaves(@Req() req) {
    return this.leaveService.getMyLeaves(req.user.userId);
  }

  @Get('history')
  @Roles(UserRole.EMPLOYEE, UserRole.TEAM_LEAD)
  getMyBalance(@Req() req) {    
    return this.leaveService.leavesHistory(req.user.userId)
  }

  @Get('pending')
  @Roles(UserRole.TEAM_LEAD, UserRole.OWNER)
  getPendingLeaves(@Req() req) {
    return this.leaveService.getPendingLeaves(req.user);
  }

  @Patch(':id/approve')
  @Roles(UserRole.TEAM_LEAD, UserRole.OWNER)
  approveLeave(@Param('id') id: string, @Req() req) {
    return this.leaveService.approveLeave(id, req.user.userId);
  }

  @Patch(':id/reject')
  @Roles(UserRole.TEAM_LEAD, UserRole.OWNER)
  rejectLeave(
    @Param('id') id: string,
    @Req() req,
    @Body('reason') reason: string,
  ) {
    return this.leaveService.rejectLeave(id, req.user.userId, reason);
  }
}
