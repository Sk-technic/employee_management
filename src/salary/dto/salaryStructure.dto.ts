import { IsMongoId, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateSalaryStructureDto {

  @IsMongoId()
  userId: string;

  @IsNumber()
  @Min(0)
  basicSalary: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  companyWorkingDays?: number;

  @IsDateString()
  effectiveFrom: string;
}
