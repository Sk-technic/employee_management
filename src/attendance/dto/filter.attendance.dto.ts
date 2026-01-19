import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus } from '../schema/attendance.schema';

export class FilterAttendanceDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @IsMongoId()
  userId?: string;
}
