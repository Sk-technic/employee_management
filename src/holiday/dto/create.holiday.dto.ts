import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHolidayDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  date: Date;

  @IsEnum(['PUBLIC', 'RESTRICTED'])
  type: 'PUBLIC' | 'RESTRICTED';

  @IsOptional()
  @IsString()
  description?: string;
}
