import { TimeslotStatus } from '../types';
import { Timeslot } from '../timeslot.entity';

export class TimeslotDto {
  public id: string;

  public date: string;

  public time: string;

  public duration: number;

  public price: number;

  public currency: string;

  public status: TimeslotStatus;

  constructor(data: Timeslot) {
    this.id = data.id;
    this.date = data.date;
    this.time = data.time;
    this.status = data.status;
    this.duration = data.duration;
    this.price = data.price;
    this.currency = data.currency;
  }
}
