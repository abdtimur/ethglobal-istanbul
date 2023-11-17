import { Injectable } from '@nestjs/common';

import {
  CreateZoomMeetingRequestDto,
  CreateZoomMeetingResponseDto,
} from './types';

const USER_ID = 'me';

import { getToken, ZOOM_API_BASE_URL } from './utils';
import axios from 'axios';

@Injectable()
export class ZoomService {
  constructor() {}

  async createMeeting(
    createMeetingDto: CreateZoomMeetingRequestDto,
  ): Promise<CreateZoomMeetingResponseDto> {
    console.log(createMeetingDto);

    const token = await getToken();
    console.log(token);
    const response = await axios.post(`${ZOOM_API_BASE_URL}/users/${USER_ID}/meetings`, {},{
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    });

    console.log(response);
    
    return {
      id: 123,
      join_url: 'https://zoom.us/j/123',
      password: '123',
    };
  }

}
