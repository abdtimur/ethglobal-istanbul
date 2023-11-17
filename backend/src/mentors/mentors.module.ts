import { TypeOrmModule } from '@nestjs/typeorm';
import { Mentor } from './mentor.entity';
import { Module } from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { MentorsController } from './mentors.controller';
import { TimeslotsModule } from '../timeslots/timeslots.module';

@Module({
  imports: [TypeOrmModule.forFeature([Mentor]), TimeslotsModule],
  providers: [MentorsService],
  controllers: [MentorsController],
  exports: [MentorsService],
})
export class MentorsModule {}
