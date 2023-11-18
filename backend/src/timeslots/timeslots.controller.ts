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
import { TimeslotStatus } from './types';


async function sendPush(title: string, body: string, account: string){
  const response = await fetch(
    'https://notify.walletconnect.com/69b67f11efec451f5be58fe541681209/notify',
    {
      method: "POST",
      headers: {
        Authorization: 'Bearer <NOTIFY_API_SECRET>'
      },
      body: JSON.stringify({
        notification: {
          type: "a1e53b95-18e5-4af8-9f03-9308ec87b687", // Notification type ID copied from Cloud 
          title: title,
          body: body,
        },
        accounts: [
          "eip155:1:"+ account// CAIP-10 account ID
        ]
      })
    }
  );

  console.log(response);


}

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

  @Get('/my-booked')
  async getBookedTimeslots(
    @Query('account') account: string,
  ): Promise<TimeslotDto[]> {
    if (!account) {
      return [];
    }
    return this.timeslotsService.findBookedTimeslotsForAccount(account);
  }

  @Get('/testPush')
  async testPush(): Promise<any> {
    sendPush("Test", "Test", "0x65BD86F02341D223835761A62E5C30201af5f4b2");
    return "OK";
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

    sendPush("Booked slot", "Someone has booked the following slot: "+updatedSlot.time, updatedSlot.mentor);



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
      const timeslot =
        await this.timeslotsService.findTimeslotByMeetingInfo(meetingId);
      if (!timeslot) {
        console.log(
          'Received meeting.ended event for meetingId',
          meetingId,
          'but no timeslot found for this meetingId',
        );
        res.status(200);
      }
      if (timeslot.status != TimeslotStatus.Booked) {
        console.log(
          'Received meeting.ended event for meetingId',
          meetingId,
          'but timeslot status is not Booked',
        );
        res.status(200);
      }
      if (timeslot && timeslot.status == TimeslotStatus.Booked) {
        this.timeslotsService.completeTimeslot(timeslot.id, {
          duration: Number(durationInMinutes),
        });
      }

      console.log('duration', durationInMinutes, 'meetingId', meetingId);

      res.status(200);
    } else if (zoomEvent.event === 'meeting.started') {
      console.log('meeting.started');
      res.status(200);
    }
  }
}
