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

    return {
      id: response.data.id,
      join_url: response.data.start_url,
    };
  }

  async getMeetingDuration(meetingId: string): Promise<string> {
    const token = await getToken();
    const response = await axios.get(`${ZOOM_API_BASE_URL}/past_meetings/${meetingId}`,{
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    });

    const startTime = new Date(response.data.start_time).getTime();
    const endTime = new Date(response.data.end_time).getTime();

    const durationInMilliseconds = endTime - startTime;
    const durationInMinutes = (durationInMilliseconds / (1000 * 60)).toFixed(2);

    return durationInMinutes;
  }

}
