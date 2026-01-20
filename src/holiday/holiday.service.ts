import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { HolidayRepository } from './repo/holiday.repo';
import { CreateHolidayDto } from './dto/create.holiday.dto';
import { UpdateHolidayDto } from './dto/update.holiday.dto';


@Injectable()
export class HolidayService {
  constructor(
    private readonly holidayRepo: HolidayRepository,
  ) {}

  async createHoliday(dto: CreateHolidayDto, adminId: string) {
    const exists = await this.holidayRepo.findByDate(new Date(dto.date));

    if (exists) {
      throw new ConflictException('Holiday already exists for this date');
    }

    return this.holidayRepo.create({
      name: dto.name,
      date: new Date(dto.date),
      type: dto.type,
      description: dto.description,
      createdBy: adminId as any,
    });
  }

  async updateHoliday(id: string, dto: UpdateHolidayDto) {
    const holiday = await this.holidayRepo.updateById(id, dto);

    if (!holiday) {
      throw new NotFoundException('Holiday not found');
    }

    return holiday;
  }

  async getCalendar(month: number, year: number) {
    return this.holidayRepo.findByMonth(month, year);
  }
}
