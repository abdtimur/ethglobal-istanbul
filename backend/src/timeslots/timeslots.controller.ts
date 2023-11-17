import { Controller, Get, Query } from '@nestjs/common';
import { TimeslotsService } from './timeslots.service';
import { TimeslotDto } from './responses/timeslot.response.dto';

@Controller('timeslots')
export class TimeslotsController {
  constructor(private readonly timeslotsService: TimeslotsService) {}

  @Get('')
  async getTimeslots(@Query('mentor') mentor: string): Promise<TimeslotDto[]> {
    if (!mentor) {
      return [];
    }
    return this.timeslotsService.findTimeslotsForMentor(mentor);
  }
}
