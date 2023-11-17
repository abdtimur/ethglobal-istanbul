import { InjectRepository } from '@nestjs/typeorm';
import { Timeslot } from './timeslot.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TimeslotDto } from './responses/timeslot.response.dto';
import { TimeslotStatus } from './types';
import { BookSlotRequest } from './requests/book-slot.request.dto';
import { CompleteSlotRequest } from './requests/complete-slot.request.dto';

@Injectable()
export class TimeslotsService {
  constructor(
    @InjectRepository(Timeslot)
    private readonly timeslotsRepo: Repository<Timeslot>,
  ) {}

  async findTimeslotById(id: string): Promise<Timeslot> {
    const timeslot = await this.timeslotsRepo.findOne({
      where: { id },
    });
    if (!timeslot) {
      throw new NotFoundException(`Timeslot not found for id: ${id}`);
    }

    return timeslot;
  }

  async findTimeslotsForMentor(mentorAccount: string): Promise<TimeslotDto[]> {
    const timeslots = await this.timeslotsRepo.find({
      where: { mentorAccount },
    });

    return timeslots.map((timeslot) => new TimeslotDto(timeslot));
  }

  async getTimeslotsCount(mentorAccount: string): Promise<number> {
    const timeslots = await this.timeslotsRepo.find({
      where: { mentorAccount },
    });

    return timeslots.length;
  }

  async bookTimeslot(
    timeslotId: string,
    body: BookSlotRequest,
  ): Promise<TimeslotDto> {
    const timeslot = await this.timeslotsRepo.findOne({
      where: { id: timeslotId },
    });
    if (!timeslot) {
      throw new NotFoundException(`Timeslot not found for id: ${timeslotId}`);
    }
    // TODO: verify with chain
    timeslot.txHash = body.txHash;
    timeslot.txValue = body.txValue;
    timeslot.account = body.account;
    timeslot.status = TimeslotStatus.Booked;

    // TODO: Generate zoom link here (zoom module)
    timeslot.callInfo = 'https://zoom.us/j/1234567890';
    await this.timeslotsRepo.save(timeslot);

    return new TimeslotDto(timeslot);
  }

  async completeTimeslot(
    timeslotId: string,
    body: CompleteSlotRequest,
  ): Promise<TimeslotDto> {
    const timeslot = await this.timeslotsRepo.findOne({
      where: { id: timeslotId },
    });
    if (!timeslot) {
      throw new NotFoundException(`Timeslot not found for id: ${timeslotId}`);
    }

    // TODO: Publish tx on chain and save hash: body.duration
    timeslot.duration = body.duration; // do we need to update here?
    timeslot.txCompletedHash = 'someTxHash';
    timeslot.status = TimeslotStatus.Completed;

    await this.timeslotsRepo.save(timeslot);

    return new TimeslotDto(timeslot);
  }

  async createAndSaveAll(slots: Partial<Timeslot>[]): Promise<Timeslot[]> {
    const timeslots = await this.timeslotsRepo.save(
      slots.map((slot) => this.timeslotsRepo.create(slot)),
    );

    return timeslots;
  }
}
