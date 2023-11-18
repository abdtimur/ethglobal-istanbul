export type Timeslot = {
  id: string;
  date: string;
  time: string;
  status: 'Free' | 'Booked' | 'Completed' | 'Canceled' | 'Expired';
  duration: number;
  price: string;  
  currency: string;
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