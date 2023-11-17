import { Controller, Post, Body, Res } from '@nestjs/common';
import { ZoomService } from './zoom.service';
import { Response } from 'express';

import {
  CreateZoomMeetingRequestDto,
  CreateZoomMeetingResponseDto,
  ZoomMeetingEndedEvent,
} from './types';

@Controller('zoom')
export class ZoomController {
  constructor(private readonly zoom: ZoomService) {}

  // @Post callback
  @Post('/create-meeting')
  async createMeeting(
    @Body() createMeetingDto: CreateZoomMeetingRequestDto,
  ): Promise<CreateZoomMeetingResponseDto> {
    console.log(createMeetingDto);
    return this.zoom.createMeeting(createMeetingDto);
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
        .createHmac('sha256', 'EwJWiLe1Se-h6HO773_5SA')
        .update(zoomEvent.payload.plainToken)
        .digest('hex');

      console.log(hashForValidate);
      res.status(200).send({
        plainToken: zoomEvent.payload.plainToken,
        encryptedToken: hashForValidate,
      });
    } else if (zoomEvent.event === 'meeting.ended') {
      console.log('meeting.ended');
      const response = this.zoom.meetingEnded(zoomEvent);
      res.status(200).send(response);
    } else if (zoomEvent.event === 'meeting.started') {
      console.log('meeting.started');
      res.status(200).send({
        response: 'ok',
      });
    }
  }
}
