import { IsEnum, IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class ApplyLeaveDto {
  @IsEnum(['CL', 'SL', 'PL'])
  type: string;

  @IsDateString()
  fromDate: string;

  @IsDateString()
  toDate: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
