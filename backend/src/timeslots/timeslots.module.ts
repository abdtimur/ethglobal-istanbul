import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Timeslot } from './timeslot.entity';
import { TimeslotsService } from './timeslots.service';
import { TimeslotsController } from './timeslots.controller';
import { ZoomModule } from '../zoom/zoom.module';

@Module({
  imports: [TypeOrmModule.forFeature([Timeslot]), ZoomModule],
  providers: [TimeslotsService],
  controllers: [TimeslotsController],
  exports: [TimeslotsService],
})
export class TimeslotsModule {}
