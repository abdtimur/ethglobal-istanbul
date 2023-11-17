import { InjectRepository } from '@nestjs/typeorm';
import { Mentor } from './mentor.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MentorDto } from './responses/mentor.response.dto';
import { verifyMentorRequest } from './requests/verify.mentor.request.dto';
import { TimeslotsService } from '../timeslots/timeslots.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateMentorRequest } from './requests/create-mentor.request.dto';

@Injectable()
export class MentorsService {
  constructor(
    @InjectRepository(Mentor)
    private readonly mentorsRepo: Repository<Mentor>,
    private readonly timeslots: TimeslotsService,
  ) {}

  async initMentor(body: CreateMentorRequest): Promise<MentorDto> {
    const mentor = this.mentorsRepo.create({
      account: body.account,
      displayName: body.displayName ?? null,
      profilePhotoUrl: body.profilePhotoUrl ?? null,
    });

    await this.mentorsRepo.save(mentor);

    return new MentorDto(mentor);
  }

  async findAll(): Promise<MentorDto[]> {
    const mentors = await this.mentorsRepo.find({
      relations: ['timeslots'],
    });

    return mentors.map((mentor) => new MentorDto(mentor));
  }

  async findMentor(account: string): Promise<MentorDto> {
    const mentor = await this.findMentorByAccount(account);
    return new MentorDto(mentor);
  }

  async verifyMentor(
    account: string,
    request: verifyMentorRequest,
  ): Promise<MentorDto> {
    const mentor = await this.findMentorByAccount(account);

    if (request.displayName) {
      mentor.displayName = request.displayName;
    }
    if (request.profilePhotoUrl) {
      mentor.profilePhotoUrl = request.profilePhotoUrl;
    }

    mentor.humanVerified = request.human ?? false;
    mentor.tlsnVerified = request.tlsn ?? false;
    mentor.polygonIdVerified = request.polygonId ?? false;

    const allVerified =
      mentor.humanVerified && mentor.tlsnVerified && mentor.polygonIdVerified;

    if (allVerified) {
      const timeslotsCount = await this.timeslots.getTimeslotsCount(account);
      if (timeslotsCount === 4) {
        await this.issueNewSlots(mentor);
      }
    }

    await this.mentorsRepo.save(mentor);

    return new MentorDto(mentor);
  }

  async publicIssueNewSlots(account: string): Promise<MentorDto> {
    const mentor = await this.findMentorByAccount(account);
    await this.issueNewSlots(mentor);
    await this.mentorsRepo.save(mentor);
    return new MentorDto(mentor);
  }

  private async issueNewSlots(mentor: Mentor): Promise<void> {
    const BASE_PRICE = '1000000000000000'; // 0.001; // TODO: Config
    const BASE_CURRENCY = 'MATIC'; // TODO: Config
    const BASE_DURATION = 30;
    const DEFAULT_SLOT = {
      price: BASE_PRICE,
      currency: BASE_CURRENCY,
      duration: BASE_DURATION,
      mentor: mentor,
    };
    const now = new Date().getTime();
    const preparedSlots = [
      {
        ...DEFAULT_SLOT,
        id: this.generateUUID(),
        date: new Date(now + 48 * 60 * 60 * 1000).toISOString().split('T')[0], // 48 hours from now
        time: '15:00',
      },
      {
        ...DEFAULT_SLOT,
        id: this.generateUUID(),
        date: new Date(now + 48 * 60 * 60 * 1000).toISOString().split('T')[0], // 48 hours from now
        time: '17:00',
      },
      {
        ...DEFAULT_SLOT,
        id: this.generateUUID(),
        date: new Date(now + 72 * 60 * 60 * 1000).toISOString().split('T')[0], // 72 hours from now
        time: '15:00',
      },
      {
        ...DEFAULT_SLOT,
        id: this.generateUUID(),
        date: new Date(now + 72 * 60 * 60 * 1000).toISOString().split('T')[0], // 72 hours from now
        time: '17:00',
      },
    ];

    // TODO: put slots on-chain here first
    // ... waiting transactions to be mined

    const slots = await this.timeslots.createAndSaveAll(preparedSlots);

    mentor.timeslots = slots;
  }

  private async findMentorByAccount(account: string): Promise<Mentor> {
    const mentor = await this.mentorsRepo.findOne({
      where: { account },
      relations: ['timeslots'],
    });
    if (!mentor) {
      throw new NotFoundException(`Mentor not found for id: ${account}`);
    }
    return mentor;
  }

  private generateUUID(): string {
    return uuidv4(); // Generates a UUID
  }
}
