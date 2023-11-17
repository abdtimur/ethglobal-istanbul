import {
  Body,
  Controller,
  Get,
  HttpException,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { TimeslotsService } from './timeslots.service';
import { TimeslotDto } from './responses/timeslot.response.dto';
import { BookSlotRequest } from './requests/book-slot.request.dto';
import { CompleteSlotRequest } from './requests/complete-slot.request.dto';

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

  @Post(':id/book')
  async bookSlot(
    @Param('id') slotId: string,
    @Body() body: BookSlotRequest,
  ): Promise<TimeslotDto> {
    if (!slotId) {
      throw new NotFoundException('Slot ID is required');
    }
    const updatedSlot = await this.timeslotsService.bookTimeslot(slotId, body);

    return updatedSlot;
  }

  @Post(':id/complete')
  async completeSlot(
    @Param('id') slotId: string,
    @Body() body: CompleteSlotRequest,
  ): Promise<TimeslotDto> {
    if (!slotId) {
      throw new NotFoundException('Slot ID is required');
    }
    const updatedSlot = await this.timeslotsService.completeTimeslot(
      slotId,
      body,
    );

    return updatedSlot;
  }
}
