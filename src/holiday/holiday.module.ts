import { Module } from '@nestjs/common';
import { HolidayController } from './holiday.controller';
import { HolidayService } from './holiday.service';
import { HolidayRepository } from './repo/holiday.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { Holiday, HolidaySchema } from './schema/holiday.schema';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name:Holiday.name,schema:HolidaySchema}
    ])
  ],
  controllers: [HolidayController],
  providers: [HolidayService,HolidayRepository]
})
export class HolidayModule {}
