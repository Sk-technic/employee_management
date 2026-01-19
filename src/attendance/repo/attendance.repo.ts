import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    Attendance,
    AttendanceDocument,
    AttendanceStatus,
} from '../schema/attendance.schema';

@Injectable()
export class AttendanceRepository {
    constructor(
        @InjectModel(Attendance.name)
        private readonly attendanceModel: Model<AttendanceDocument>,
    ) { }

    async createCheckIn(data: Partial<Attendance>): Promise<Attendance> {
        const attendance = new this.attendanceModel(data);
        return attendance.save();
    }

    async findByUserAndDate(
        userId: Types.ObjectId,
        date: string,
    ): Promise<AttendanceDocument | null> {
        return this.attendanceModel.findOne({
            date: date,
            userId: { $eq: userId },
        }).exec();
    }

    async findById(id: string): Promise<Attendance | null> {
        return this.attendanceModel.findById(id).exec();
    }

    async updateCheckOut(
        id: string,
        outTime: Date,
        totalWorkingMinutes: number,
        status: AttendanceStatus,
    ): Promise<Attendance | null> {
        return this.attendanceModel.findByIdAndUpdate(
            id,
            {
                outTime: "2026-01-18T16:31:37.823Z",
                totalWorkingMinutes,
                status,
            },
            { new: true },
        );
    }

    async updateStatus(
        id: string,
        status: AttendanceStatus,
    ): Promise<Attendance | null> {
        return this.attendanceModel.findByIdAndUpdate(
            id,
            { status },
            { new: true },
        );
    }

    async findDailyAttendance(date: string) {
        return this.attendanceModel
            .find({ date })
            .populate('userId', 'name email role')
            .sort({ inTime: 1 })
            .exec();
    }

    async findUserDailyAttendance(userId: Types.ObjectId, date: string) {
        return this.attendanceModel.findOne(
            {
                date: date,
                userId: { $eq: userId }
            }
        ).exec();
    }

    async getMonthlySummary(userId: Types.ObjectId, month: string) {
        return this.attendanceModel.aggregate([
            {
                $match: {
                    userId,
                    date: { $regex: `^${month}` },
                },
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalMinutes: { $sum: '$totalWorkingMinutes' },
                },
            },
        ]);
    }

    async findMonthlyRecords(userId: Types.ObjectId, month: string) {
        return this.attendanceModel
            .find({
                userId,
                date: { $regex: `^${month}` },
            })
            .sort({ date: 1 })
            .exec();
    }

    async findMonthlyByUser(userId: Types.ObjectId, month: string) {
        return this.attendanceModel.find({
            userId,
            date: { $regex: `^${month}` },
        }).exec();
    }

    async filterAttendance(filters: {
        date?: string;
        status?: AttendanceStatus;
        userId?: Types.ObjectId;
    }) {
        const query: any = {};

        if (filters.date) query.date = filters.date;
        if (filters.status) query.status = filters.status;
        if (filters.userId) query.userId = filters.userId;

        return this.attendanceModel
            .find(query)
            .populate('userId', 'name email role')
            .sort({ date: -1 })
            .exec();
    }

    async findUsersWithoutAttendance(date: string, userIds: Types.ObjectId[]) {
        return this.attendanceModel.find({
            date,
            userId: { $in: userIds },
        });
    }

    async markAbsentForUser(userId: Types.ObjectId, date: string) {
        return this.attendanceModel.create({
            userId,
            date,
            status: AttendanceStatus.ABSENT,
            totalWorkingMinutes: 0,
        });
    }
    async getTodayStats(date: string) {
        return this.attendanceModel.aggregate([
            { $match: { date } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);
    }

}
