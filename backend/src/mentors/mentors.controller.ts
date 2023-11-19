import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { MentorDto } from './responses/mentor.response.dto';
import { verifyMentorRequest } from './requests/verify.mentor.request.dto';
import { CreateMentorRequest } from './requests/create-mentor.request.dto';

@Controller('api/mentors')
export class MentorsController {
  constructor(private readonly mentors: MentorsService) {}

  @Post('/create')
  async createMentor(@Body() body: CreateMentorRequest): Promise<MentorDto> {
    return await this.mentors.initMentor(body);
  }

  @Get('')
  async getAllMentors(@Query('chainId') chainId: number): Promise<MentorDto[]> {
    return this.mentors.findAll(chainId);
  }

  @Get(':account')
  async getMentor(
    @Param('account') mentor: string,
    @Query('chainId') chainId: number,
  ): Promise<MentorDto> {
    if (!mentor) {
      throw new Error('Mentor is required');
    }
    return this.mentors.findMentor(mentor, chainId);
  }

  @Post('/:account/verify')
  async verifyMentor(
    @Param('account') mentor: string,
    @Query('chainId') chainId: number,
    @Body() body: verifyMentorRequest,
  ) {
    if (!mentor) {
      throw new Error('Mentor is required');
    }
    return this.mentors.verifyMentor(mentor, chainId, body);
  }
}
