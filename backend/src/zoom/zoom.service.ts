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
    const token = await getToken();
    const response = await axios.post(`${ZOOM_API_BASE_URL}/users/${USER_ID}/meetings`, createMeetingDto,{
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    });

    console.log(response);
    
    return {
      id: response.data.id,
      join_url: response.data.start_url,
    };
  }

}
