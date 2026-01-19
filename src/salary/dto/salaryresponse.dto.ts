export class SalaryResponseDto {
  userId: string;
  month: number;
  year: number;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  totalWorkingDays: number;
  paidDays: number;
  perDaySalary: number;
  basicSalary: number;
  finalSalary: number;
  status: string;
}
