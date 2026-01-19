import { IsOptional, IsString, IsIn } from 'class-validator';

export class CheckInDto {
  @IsOptional()
  @IsString()
  @IsIn(['WEB', 'MOBILE', 'SYSTEM'])
  source?: string;
}
