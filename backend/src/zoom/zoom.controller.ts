import { Controller, Post, Body } from '@nestjs/common';
import { ZoomService } from './zoom.service';

import {
  CreateZoomMeetingRequestDto,
  CreateZoomMeetingResponseDto,
  ZoomMeetingEndedEvent
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
    @Body() meetingEndedEvent: ZoomMeetingEndedEvent,
  ): Promise<void> {
    console.log(meetingEndedEvent);

  }
}