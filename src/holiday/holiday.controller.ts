import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { JwtAuthGuard } from 'src/common/guards/jwt_auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorators';
import { UserRole } from 'src/auth/schema/user.schema';
import { CreateHolidayDto } from './dto/create.holiday.dto';
import { UpdateHolidayDto } from './dto/update.holiday.dto';
import { CalendarQueryDto } from './dto/calander.Query.dto';

@Controller('holidays')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}


  @Post()
  @Roles(UserRole.OWNER)
  createHoliday(@Req() req, @Body() dto: CreateHolidayDto) {
    return this.holidayService.createHoliday(dto,req.user.userId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER)
  updateHoliday(@Param('id') id: string, @Body() dto: UpdateHolidayDto) {
    return this.holidayService.updateHoliday(id, dto);
  }


  @Get('calendar')
  @Roles(UserRole.EMPLOYEE, UserRole.TEAM_LEAD, UserRole.OWNER)
  getCalendar(@Query() query: CalendarQueryDto) {
    return this.holidayService.getCalendar(query.month, query.year);
  }
}
