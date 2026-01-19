import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { SalaryService } from './salary.service';
import { JwtAuthGuard } from 'src/common/guards/jwt_auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorators';
import { CreateSalaryStructureDto } from './dto/salaryStructure.dto';

@Controller('salary')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post('structure')
  @Roles('OWNER')
  createStructure(@Body() body: CreateSalaryStructureDto) {
    return this.salaryService.createOrUpdateStructure(body);
  }

  @Post('generate/:userId')
  @Roles('OWNER')
  generateSalary(
    @Param('userId') userId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.salaryService.generateSalaryForUser(
      new Types.ObjectId(userId),
      Number(month),
      Number(year),
    );
  }

  @Get('me')
  getMySalary(@Req() req) {
    return this.salaryService.getMySalaryHistory(
      new Types.ObjectId(req.user.userId),
    );
  }

  @Get('admin')
  @Roles('OWNER')
  getByMonth(
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.salaryService.getSalariesByMonth(Number(month), Number(year));
  }

  @Patch(':salaryId/status')
  @Roles('OWNER')
  updateStatus(
    @Param('salaryId') salaryId: string,
    @Body('status') status: 'PAID' | 'PENDING',
  ) {
    return this.salaryService.updateSalaryStatus(
      new Types.ObjectId(salaryId),
      status,
    );
  }
}
