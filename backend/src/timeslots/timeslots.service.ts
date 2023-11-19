import { InjectRepository } from '@nestjs/typeorm';
import { Timeslot } from './timeslot.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { TimeslotDto } from './responses/timeslot.response.dto';
import { TimeslotStatus } from './types';
import { BookSlotRequest } from './requests/book-slot.request.dto';
import { CompleteSlotRequest } from './requests/complete-slot.request.dto';
import { ZoomService } from '../zoom/zoom.service';
import {
  MINDSHARES,
  getAdjustedGasPrice,
  getMentorsTimeByMentorAddress,
  getSignerWallet,
  getUmaOracle,
} from '../web3/web3Provider';
import { ethers } from 'ethers';

@Injectable()
export class TimeslotsService {
  constructor(
    @InjectRepository(Timeslot)
    private readonly timeslotsRepo: Repository<Timeslot>,
    private readonly zoom: ZoomService,
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

  async findTimeslotByMeetingInfo(
    callInfo: string,
  ): Promise<Timeslot | undefined> {
    const timeslot = await this.timeslotsRepo.findOne({
      where: { callInfo },
    });

    return timeslot;
  }

  async findTimeslotsForMentor(
    mentorAccount: string,
    chainId: number,
  ): Promise<TimeslotDto[]> {
    const timeslots = await this.timeslotsRepo.find({
      where: { mentorAccount, chainId },
    });

    return timeslots.map((timeslot) => new TimeslotDto(timeslot));
  }

  async findBookedTimeslotsForAccount(
    account: string,
    chainId: number,
  ): Promise<TimeslotDto[]> {
    const timeslots = await this.timeslotsRepo.find({
      where: {
        account,
        chainId,
        status: In([TimeslotStatus.Booked, TimeslotStatus.Completed]),
      },
    });

    return timeslots.map((timeslot) => new TimeslotDto(timeslot));
  }

  async getTimeslotsCount(
    mentorAccount: string,
    chainId: number,
  ): Promise<number> {
    const timeslots = await this.timeslotsRepo.find({
      where: { mentorAccount, chainId },
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
    const meeting = await this.zoom.createMeeting({
      topic: `Mindshare Meeting with mentor ${timeslot.mentorAccount}`,
      type: 2,
      start_time: new Date(`${timeslot.date} ${timeslot.time}`),
      duration: timeslot.duration,
      timezone: 'UTC',
    });

    timeslot.callInfo = meeting.id + '';
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

    timeslot.duration = body.duration; // do we need to update here?

    const signerWallet = getSignerWallet(timeslot.chainId);
    const gasPrice = await getAdjustedGasPrice(timeslot.chainId);
    const mentorsTime = await getMentorsTimeByMentorAddress(
      MINDSHARES[timeslot.chainId],
      timeslot.mentorAccount,
      timeslot.chainId,
      signerWallet,
    );
    const tx = await mentorsTime.registerMeetingEnd(
      timeslot.id,
      BigInt(body.duration),
      { gasPrice, gasLimit: 2000000 },
    );
    await tx.wait();
    console.log(`Send settle tx: ${tx.hash}`);

    timeslot.txCompletedHash = tx.hash;
    timeslot.status = TimeslotStatus.Completed;

    await this.timeslotsRepo.save(timeslot);

    // if supported, assert to UMA here
    const signerWalletUma = getSignerWallet(5);
    const gasPriceUma = await getAdjustedGasPrice(5);
    const umaContract = getUmaOracle(
      '0x85782Ea06D28554771928aCdf7f900a354BF9429',
      5,
      signerWalletUma,
    );
    const txUma = await umaContract.assertTruth(
      ethers.encodeBytes32String(timeslot.callInfo),
      ethers.encodeBytes32String(timeslot.duration + ''),
      ethers.encodeBytes32String(timeslot.date),
      { gasPrice: gasPriceUma, gasLimit: 2000000 },
    );
    await txUma.wait();
    console.log(`Send assert tx: ${txUma.hash}`);

    timeslot.assertionLink = `https://goerli.etherscan.io/tx/${txUma.hash}`;

    return new TimeslotDto(timeslot);
  }

  async createAndSaveAll(slots: Partial<Timeslot>[]): Promise<Timeslot[]> {
    const timeslots = await this.timeslotsRepo.save(
      slots.map((slot) => this.timeslotsRepo.create(slot)),
    );

    return timeslots;
  }
}
