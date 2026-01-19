import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { AttendanceRepository } from './repo/attendance.repo';
import { AttendanceStatus } from './schema/attendance.schema';

import {
  CheckInDto,
  DailyAttendanceQueryDto,
  MonthlySummaryQueryDto,
  MonthlyRecordsQueryDto,
  FilterAttendanceDto,
  MarkAbsentDto,
} from './dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly attendanceRepo: AttendanceRepository) {}

  /* -------------------------------
     UTIL
  -------------------------------- */

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private calculateStatus(minutes: number): AttendanceStatus {
    if (minutes >= 480) return AttendanceStatus.PRESENT;
    if (minutes >= 240) return AttendanceStatus.HALF_DAY;
    return AttendanceStatus.ABSENT;
  }

  /* -------------------------------
     CHECK IN
  -------------------------------- */

  async checkIn(userId: string, dto: CheckInDto) {
    const userObjectId = new Types.ObjectId(userId);
    const today = this.formatDate(new Date());
    console.log(userObjectId,today,"---------------------");
    
    const existing = await this.attendanceRepo.findByUserAndDate(
      userObjectId,
      today,
    );
    console.log(existing);
    

    if (existing) {
      throw new BadRequestException('Already checked in today');
    }

    return this.attendanceRepo.createCheckIn({
      userId: userObjectId,
      date: today,
      inTime: new Date(),
      source: dto?.source ?? 'WEB',
      status: AttendanceStatus.PRESENT,
    });
  }

  /* -------------------------------
     CHECK OUT
  -------------------------------- */

  async checkOut(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const today = this.formatDate(new Date());

    const attendance = await this.attendanceRepo.findByUserAndDate(
      userObjectId,
      today,
    );

    if (!attendance) {
      throw new NotFoundException('Check-in not found for today');
    }

    if (attendance.outTime) {
      throw new BadRequestException('Already checked out today');
    }

    const outTime = new Date();
    const diffMs =
      outTime.getTime() - new Date(attendance.inTime).getTime();

    const minutes = Math.max(Math.floor(diffMs / (1000 * 60)), 0);
    const status = this.calculateStatus(minutes);

    return this.attendanceRepo.updateCheckOut(
      attendance._id.toString(),
      outTime,
      minutes,
      status,
    );
  }

  /* -------------------------------
     DAILY ATTENDANCE
  -------------------------------- */

  async getDailyAttendance(query: DailyAttendanceQueryDto) {
    const targetDate =
      query?.date || this.formatDate(new Date());

    return this.attendanceRepo.findDailyAttendance(targetDate);
  }

  async getMyDailyAttendance(
    userId: string,
    query: DailyAttendanceQueryDto,
  ) {
    const userObjectId = new Types.ObjectId(userId);
    const targetDate =
      query?.date || this.formatDate(new Date());

    return this.attendanceRepo.findUserDailyAttendance(
      userObjectId,
      targetDate,
    );
  }

  /* -------------------------------
     MONTHLY SUMMARY
  -------------------------------- */

  async getMonthlySummary(
    userId: string,
    query: MonthlySummaryQueryDto,
  ) {
    const userObjectId = new Types.ObjectId(userId);
    const month = query.month;

    const summary = await this.attendanceRepo.getMonthlySummary(
      userObjectId,
      month,
    );

    const result = {
      totalDays: 0,
      presentDays: 0,
      halfDays: 0,
      absentDays: 0,
      totalWorkingHours: 0,
    };

    for (const row of summary) {
      result.totalDays += row.count;

      if (row._id === AttendanceStatus.PRESENT)
        result.presentDays = row.count;

      if (row._id === AttendanceStatus.HALF_DAY)
        result.halfDays = row.count;

      if (row._id === AttendanceStatus.ABSENT)
        result.absentDays = row.count;

      result.totalWorkingHours += row.totalMinutes;
    }

    result.totalWorkingHours = Math.round(
      result.totalWorkingHours / 60,
    );

    return result;
  }

  /* -------------------------------
     MONTHLY RECORDS
  -------------------------------- */

  async getMonthlyRecords(
    userId: string,
    query: MonthlyRecordsQueryDto,
  ) {
    const userObjectId = new Types.ObjectId(userId);
    return this.attendanceRepo.findMonthlyRecords(
      userObjectId,
      query.month,
    );
  }

  /* -------------------------------
     ADMIN FILTERS
  -------------------------------- */

  async filterAttendance(dto: FilterAttendanceDto) {
    return this.attendanceRepo.filterAttendance({
      date: dto.date,
      status: dto.status,
      userId: dto.userId
        ? new Types.ObjectId(dto.userId)
        : undefined,
    });
  }

  /* -------------------------------
     CRON JOB SUPPORT
  -------------------------------- */

  async markAbsentUsers(dto: MarkAbsentDto) {
    const { date, userIds } = dto;

    const objectIds = userIds.map(
      (id) => new Types.ObjectId(id),
    );

    console.log("dto:",date,objectIds);
    
    const existing =
      await this.attendanceRepo.findUsersWithoutAttendance(
        date,
        objectIds,
      );
      console.log("existing-----",existing);
      
    const presentUserIds = new Set(
      existing.map((a) => a.userId.toString().trim()),
    );
    console.log("presentUsers----",presentUserIds);
    
    const absentUsers = objectIds.filter(
      (id) => !presentUserIds.has(id.toString().trim()),
    );
    console.log("absentUsers-------",absentUsers);
    
    for (const userId of absentUsers) {
      await this.attendanceRepo.markAbsentForUser(userId, date);
    }

    return {
      markedAbsent: absentUsers.length,
    };
  }

  /* -------------------------------
     DASHBOARD
  -------------------------------- */

  async getTodayStats() {
    const today = this.formatDate(new Date());
    return this.attendanceRepo.getTodayStats(today);
  }

 async getMonthlySummaryForOwner(userId: Types.ObjectId, month: string) {
    const records = await this.attendanceRepo.findMonthlyByUser(userId, month);

    let presentDays = 0;
    let halfDays = 0;
    let absentDays = 0;
    let totalWorkingMinutes = 0;

    for (const r of records) {
      if (r.status === 'PRESENT') presentDays++;
      else if (r.status === 'HALF_DAY') halfDays++;
      else if (r.status === 'ABSENT') absentDays++;

      totalWorkingMinutes += r.totalWorkingMinutes || 0;
    }

    return {
      totalDays: records.length,
      presentDays,
      halfDays,
      absentDays,
      totalWorkingHours: Number((totalWorkingMinutes / 60).toFixed(2)),
    };
  }

}
