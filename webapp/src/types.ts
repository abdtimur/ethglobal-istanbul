export type Timeslot = {
  id: string;
  date: string;
  time: string;
  status: "Free" | "Booked" | "Completed" | "Canceled" | "Expired";
  duration: number;
  price: string;
  currency: string;
  callInfo: string | null;
};

export type Mentor = {
  account: string;
  displayName?: string;
  profilePhotoUrl?: string;
  tlsnVerified: boolean;
  humanVerified: boolean;
  polygonIdVerified: boolean;
  timeslots: Timeslot[];
};

export interface TlsnModel {
  signed_content: {
    prove_utc_seconds: number;
    verify_utc_seconds: number;
    provider: string;
    fact: string;
  };
  signature: string;
}
