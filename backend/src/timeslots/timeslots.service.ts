import { InjectRepository } from '@nestjs/typeorm';
import { Timeslot } from './timeslot.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TimeslotDto } from './responses/timeslot.response.dto';
import { TimeslotStatus } from './types';

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

  async findTimeslotsForMentor(mentorId: string): Promise<TimeslotDto[]> {
    const timeslots = await this.timeslotsRepo.find({
      where: { mentorId },
    });

    return timeslots.map((timeslot) => new TimeslotDto(timeslot));
  }

  async updateTimeslotStatus(timeslotId: string, status: TimeslotStatus) {
    const timeslot = await this.timeslotsRepo.findOne({
      where: { id: timeslotId },
    });
    if (!timeslot) {
      throw new NotFoundException(`Timeslot not found for id: ${timeslotId}`);
    }
    timeslot.status = status;
    await this.timeslotsRepo.save(timeslot);
  }
}
