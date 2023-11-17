import { InjectRepository } from '@nestjs/typeorm';
import { Mentor } from './mentor.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MentorDto } from './responses/mentor.response.dto';
import { verifyMentorRequest } from './requests/verify.mentor.request.dto';

@Injectable()
export class MentorsService {
  constructor(
    @InjectRepository(Mentor)
    private readonly mentorsRepo: Repository<Mentor>,
  ) {}

  async findMentorById(id: string): Promise<MentorDto> {
    const mentor = await this.findMentorByAccount(id);
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

    await this.mentorsRepo.save(mentor);

    return new MentorDto(mentor);
  }

  private async issueNewSlots(mentor: Mentor): Promise<void> {

    const BASE_PRICE = 0.001; // TODO: Config
    const BASE_CURRENCY = 'MATIC'; // TODO: Config

    const now = new Date();
    const preparedSlots = [

    ];

    // TODO: put slots on-chain here first

  }

  private async findMentorByAccount(account: string): Promise<Mentor> {
    const mentor = await this.mentorsRepo.findOne({
      where: { id: account },
      relations: ['timeslots', 'bookings'],
    });
    if (!mentor) {
      throw new NotFoundException(`Mentor not found for id: ${account}`);
    }
    return mentor;
  }
}
