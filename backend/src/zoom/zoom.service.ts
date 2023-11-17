import { Injectable } from '@nestjs/common';

import {
  CreateZoomMeetingRequestDto,
  CreateZoomMeetingResponseDto,
} from './types';

@Injectable()
export class ZoomService {
  constructor() {}

  async createMeeting(
    createMeetingDto: CreateZoomMeetingRequestDto,
  ): Promise<CreateZoomMeetingResponseDto> {
    console.log(createMeetingDto);

    return {
      id: 123,
      join_url: 'https://zoom.us/j/123',
      password: '123',
    };
  }

  async meetingEnded(zoomEvent: any): Promise<any> {
    return {
      response: 'ok',
    };
  }
}
