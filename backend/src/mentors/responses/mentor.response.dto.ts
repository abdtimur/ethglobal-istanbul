import { Mentor } from '../mentor.entity';

export class MentorDto {
  public id: string;
  public botId: string;
  public displayName: string;
  public profilePhotoUrl: string | null;
  public tlsnVerified: boolean;
  public humanVerified: boolean;
  public polygonIdVerified: boolean;

  constructor(data: Mentor) {
    this.id = data.id;
    this.displayName = data.displayName;
    this.profilePhotoUrl = data.profilePhotoUrl;
    this.tlsnVerified = data.tlsnVerified;
    this.humanVerified = data.humanVerified;
    this.polygonIdVerified = data.polygonIdVerified;
  }
}
