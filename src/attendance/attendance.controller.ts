import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AttendanceService } from './attendance.service';

import {
  CheckInDto,
  DailyAttendanceQueryDto,
  MonthlySummaryQueryDto,
  MonthlyRecordsQueryDto,
  FilterAttendanceDto,
  MarkAbsentDto,
} from './dto';

import { JwtAuthGuard } from 'src/common/guards/jwt_auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorators';
import { UserRole } from 'src/auth/schema/user.schema';
import { Types } from 'mongoose';
import { AttendanceSummaryQueryDto } from 'src/salary/dto/attendanceSummary.dto';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @Post('check-in')
  @Roles(UserRole.EMPLOYEE, UserRole.TEAM_LEAD,)
  checkIn(@Req() req, @Body() dto: CheckInDto) {
    return this.attendanceService.checkIn(req.user.userId, dto);
  }

  @Post('check-out')
  @Roles(UserRole.EMPLOYEE, UserRole.TEAM_LEAD, UserRole.OWNER)
  checkOut(@Req() req) {
    return this.attendanceService.checkOut(req.user.userId);
  }

  @Get('me/daily')
  @Roles(UserRole.EMPLOYEE, UserRole.TEAM_LEAD, UserRole.OWNER)
  getMyDailyAttendance(
    @Req() req,
    @Query() query: DailyAttendanceQueryDto,
  ) {
    return this.attendanceService.getMyDailyAttendance(
      req.user.userId,
      query,
    );
  }

  @Get('me/monthly-summary')
  @Roles(UserRole.EMPLOYEE, UserRole.TEAM_LEAD, UserRole.OWNER)
  getMyMonthlySummary(
    @Req() req,
    @Query() query: MonthlySummaryQueryDto,
  ) {
    return this.attendanceService.getMonthlySummary(
      req.user.userId,
      query,
    );
  }

  @Get('me/monthly-records')
  @Roles(UserRole.EMPLOYEE, UserRole.TEAM_LEAD, UserRole.OWNER)
  getMyMonthlyRecords(
    @Req() req,
    @Query() query: MonthlyRecordsQueryDto,
  ) {
    return this.attendanceService.getMonthlyRecords(
      req.user.userId,
      query,
    );
  }

  @Get('summary/:userId')
  @Roles('OWNER')
  async getUserMonthlySummary(
    @Param('userId') userId: string,
    @Query() query: AttendanceSummaryQueryDto,
  ) {
    return this.attendanceService.getMonthlySummaryForOwner(
      new Types.ObjectId(userId),
      query.month,
    );
  }


  @Get('daily')
  @Roles(UserRole.TEAM_LEAD, UserRole.OWNER)
  getDailyAttendance(
    @Query() query: DailyAttendanceQueryDto,
  ) {
    return this.attendanceService.getDailyAttendance(query);
  }

  @Post('filter')
  @Roles(UserRole.TEAM_LEAD, UserRole.OWNER)
  filterAttendance(@Body() dto: FilterAttendanceDto) {
    return this.attendanceService.filterAttendance(dto);
  }

  @Post('mark-absent')
  @Roles(UserRole.OWNER)
  markAbsent(@Body() dto: MarkAbsentDto) {
    return this.attendanceService.markAbsentUsers(dto);
  }

  @Get('dashboard/today')
  @Roles(UserRole.TEAM_LEAD, UserRole.OWNER)
  getTodayStats() {
    return this.attendanceService.getTodayStats();
  }
}
