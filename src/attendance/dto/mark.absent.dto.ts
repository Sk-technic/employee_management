import { IsArray, IsString, Matches } from 'class-validator';

export class MarkAbsentDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;

  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}
