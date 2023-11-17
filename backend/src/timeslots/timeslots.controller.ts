import {
  Body,
  Controller,
  Get,
  HttpException,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { TimeslotsService } from './timeslots.service';
import { TimeslotDto } from './responses/timeslot.response.dto';
import { BookSlotRequest } from './requests/book-slot.request.dto';
import { CompleteSlotRequest } from './requests/complete-slot.request.dto';
import { Response } from 'express';

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

  @Post('/meeting-ended')
  async meetingEnded(
    @Body() zoomEvent: any,
    @Res() res: Response,
  ): Promise<any> {
    console.log(zoomEvent);

    //Once you receive the request body, create a HMAC SHA-256 hash. Set your webhook's secret token as the secret (salt), and the plainToken value as the string to hash. Output in hex format.
    const crypto = require('crypto');

    if (zoomEvent.event === 'endpoint.url_validation') {
      const hashForValidate = crypto
        .createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET)
        .update(zoomEvent.payload.plainToken)
        .digest('hex');

      console.log(hashForValidate);
      res.status(200).send({
        plainToken: zoomEvent.payload.plainToken,
        encryptedToken: hashForValidate,
      });
    } else if (zoomEvent.event === 'meeting.ended') {
      console.log('meeting.ended');

      //calculate duration of meeting as endtime - starttime
      const startTime = new Date(zoomEvent.payload.object.start_time).getTime();
      const endTime = new Date(zoomEvent.payload.object.end_time).getTime();
      const durationInMilliseconds = endTime - startTime;
      const durationInMinutes = (durationInMilliseconds / (1000 * 60)).toFixed(
        2,
      );

      const meetingId = zoomEvent.payload.object.id;
      //todo: complete timeslot, example: duration 163184649 meetingId 86593241537

      console.log('duration', durationInMinutes, 'meetingId', meetingId);

      res.status(200);
    }else if (zoomEvent.event === 'meeting.started') {
      console.log('meeting.started');
      res.status(200);
    }
  }
}
