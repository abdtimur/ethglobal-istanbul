import { InjectRepository } from '@nestjs/typeorm';
import { Mentor } from './mentor.entity';
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MentorDto } from './responses/mentor.response.dto';
import { verifyMentorRequest } from './requests/verify.mentor.request.dto';
import { TimeslotsService } from '../timeslots/timeslots.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateMentorRequest } from './requests/create-mentor.request.dto';
import { CURRENCIES } from '../web3/web3Provider';

@Injectable()
export class MentorsService {
  constructor(
    @InjectRepository(Mentor)
    private readonly mentorsRepo: Repository<Mentor>,
    private readonly timeslots: TimeslotsService,
  ) {}

  async checkIfExists(account: string, chainId: number): Promise<boolean> {
    const mentor = await this.mentorsRepo.findOne({
      where: { account, chainId },
    });
    return !!mentor;
  }

  async initMentor(body: CreateMentorRequest): Promise<MentorDto> {
    const ifExists = await this.checkIfExists(body.account, body.chainId);
    if (ifExists) {
      throw new HttpException(
        `Mentor with account ${body.account} already exists`,
        400,
      );
    }
    const mentor = this.mentorsRepo.create({
      account: body.account,
      chainId: body.chainId,
      displayName: body.displayName ?? null,
      profilePhotoUrl: body.profilePhotoUrl ?? null,
    });

    await this.mentorsRepo.save(mentor);

    return new MentorDto(mentor);
  }

  async findAll(chainId: number): Promise<MentorDto[]> {
    const mentors = await this.mentorsRepo.find({
      where: { chainId },
      relations: ['timeslots'],
    });

    return mentors.map((mentor) => new MentorDto(mentor));
  }

  async findMentor(account: string, chainId: number): Promise<MentorDto> {
    const mentor = await this.findMentorByAccount(account, chainId);
    return new MentorDto(mentor);
  }

  async verifyMentor(
    account: string,
    chainId: number,
    request: verifyMentorRequest,
  ): Promise<MentorDto> {
    const mentor = await this.findMentorByAccount(account, chainId);

    if (request.displayName) {
      mentor.displayName = request.displayName;
    }
    if (request.profilePhotoUrl) {
      mentor.profilePhotoUrl = request.profilePhotoUrl;
    }

    if (request.human) {
      mentor.humanVerified = request.human;
    }
    if (request.tlsn) {
      mentor.tlsnVerified = request.tlsn;
    }
    if (request.polygonId) {
      mentor.polygonIdVerified = request.polygonId;
    }

    const allVerified =
      mentor.humanVerified && mentor.tlsnVerified && mentor.polygonIdVerified;

    if (allVerified) {
      const timeslotsCount = await this.timeslots.getTimeslotsCount(account, chainId);
      if (timeslotsCount === 0) {
        await this.issueNewSlots(mentor);
      }
    }

    await this.mentorsRepo.save(mentor);

    return new MentorDto(mentor);
  }

  async publicIssueNewSlots(
    account: string,
    chainId: number,
  ): Promise<MentorDto> {
    const mentor = await this.findMentorByAccount(account, chainId);
    await this.issueNewSlots(mentor);
    await this.mentorsRepo.save(mentor);
    return new MentorDto(mentor);
  }

  private async issueNewSlots(mentor: Mentor): Promise<void> {
    const BASE_PRICE = '1000000000000000'; // 0.001; // TODO: Config
    const BASE_CURRENCY = CURRENCIES[mentor.chainId] ?? 'ETH';
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

  private async findMentorByAccount(
    account: string,
    chainId: number,
  ): Promise<Mentor> {
    const mentor = await this.mentorsRepo.findOne({
      where: { account, chainId },
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
