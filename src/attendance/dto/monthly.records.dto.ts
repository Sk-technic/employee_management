import { IsString, Matches } from 'class-validator';

export class MonthlyRecordsQueryDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'Month must be in YYYY-MM format',
  })
  month: string;
}
