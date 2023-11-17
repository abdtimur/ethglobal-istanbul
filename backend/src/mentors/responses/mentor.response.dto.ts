import { TimeslotDto } from '../../timeslots/responses/timeslot.response.dto';
import { Mentor } from '../mentor.entity';

export class MentorDto {
  public account: string;
  public botId: string;
  public displayName: string;
  public profilePhotoUrl: string | null;
  public tlsnVerified: boolean;
  public humanVerified: boolean;
  public polygonIdVerified: boolean;

  public timeslots: TimeslotDto[];

  constructor(data: Mentor) {
    this.account = data.account;
    this.displayName = data.displayName;
    this.profilePhotoUrl = data.profilePhotoUrl;
    this.tlsnVerified = data.tlsnVerified;
    this.humanVerified = data.humanVerified;
    this.polygonIdVerified = data.polygonIdVerified;

    this.timeslots =
      data.timeslots?.map((timeslot) => new TimeslotDto(timeslot)) ?? [];
  }
}
