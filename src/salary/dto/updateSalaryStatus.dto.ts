import { IsEnum } from 'class-validator';

export class UpdateSalaryStatusDto {

  @IsEnum(['PAID', 'PENDING'])
  status: 'PAID' | 'PENDING';
}
