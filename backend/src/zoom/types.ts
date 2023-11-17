import { type } from 'os';

export interface CreateZoomMeetingRequestDto {
  topic: string;
  type: 2;
  start_time: string;
  duration: 60;
  timezone: 'UTC';
}
export interface CreateZoomMeetingResponseDto {
  id: number;
  join_url: string;
  password: string;
}

export interface ZoomMeetingEndedEvent {
  event: string;
  event_ts: number;
  payload: {
    account_id: string;
    object: {
      id: string;
      uuid: string;
      host_id: string;
      topic: string;
      type: number;
      start_time: Date;
      timezone: string;
      duration: number;
      end_time: Date;
    };
  };
}
