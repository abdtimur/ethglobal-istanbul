import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { MentorDto } from './responses/mentor.response.dto';
import { verifyMentorRequest } from './requests/verify.mentor.request.dto';
import { CreateMentorRequest } from './requests/create-mentor.request.dto';

@Controller('mentors')
export class MentorsController {
  constructor(private readonly mentors: MentorsService) {}

  @Post('/create')
  async createMentor(@Body() body: CreateMentorRequest): Promise<MentorDto> {
    return await this.mentors.initMentor(body);
  }

  @Get('')
  async getAllMentors(): Promise<MentorDto[]> {
    return this.mentors.findAll();
  }

  @Get(':account')
  async getMentor(@Param('account') mentor: string): Promise<MentorDto> {
    if (!mentor) {
      throw new Error('Mentor is required');
    }
    return this.mentors.findMentor(mentor);
  }

  @Post('/:account/verify')
  async verifyMentor(@Param('account') mentor: string, @Body() body: verifyMentorRequest) {
    if (!mentor) {
      throw new Error('Mentor is required');
    }
    return this.mentors.verifyMentor(mentor, body);
  }
}
