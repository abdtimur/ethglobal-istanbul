import { TimeslotStatus } from '../types';
import { Timeslot } from '../timeslot.entity';

export class TimeslotDto {
  public id: string;

  public status: TimeslotStatus;

  public date: string;

  public time: string;

  public duration: number;

  public price: string;

  public currency: string;

  public account: string | null;

  public txHash: string | null;

  public txCompletedHash: string | null;

  public txValue: string | null;

  public callInfo: string | null;

  public mentor: string;

  constructor(data: Timeslot) {
    this.id = data.id;
    this.date = data.date;
    this.time = data.time;
    this.status = data.status;
    this.duration = data.duration;
    this.price = data.price;
    this.currency = data.currency;
    this.account = data.account;
    this.txHash = data.txHash;
    this.txCompletedHash = data.txCompletedHash;
    this.txValue = data.txValue;
    this.callInfo = data.callInfo;
    this.mentor = data.mentorAccount;
  }
}
