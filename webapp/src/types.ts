export type Timeslot = {
  id: string;
  time: string;
  booked: boolean;
}

export type Mentor = {
  account: string;
  displayName?: string;
  profilePhotoUrl?: string;
  tlsnVerified: boolean;
  humanVerified:boolean;
  polygonIdVerified:boolean;
  timeslots: Timeslot[];
}