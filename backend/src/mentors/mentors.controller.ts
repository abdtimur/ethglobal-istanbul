import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { MentorDto } from './responses/mentor.response.dto';
import { verifyMentorRequest } from './requests/verify.mentor.request.dto';

@Controller('mentors')
export class MentorsController {
  constructor(private readonly mentors: MentorsService) {}

  @Get(':account')
  async getMentor(@Param('account') mentor: string): Promise<MentorDto> {
    if (!mentor) {
      throw new Error('Mentor is required');
    }
    return this.mentors.findMentorById(mentor);
  }

  @Post('/:account/verify')
  async verifyMentor(@Param('account') mentor: string, @Body() body: verifyMentorRequest) {
    if (!mentor) {
      throw new Error('Mentor is required');
    }
    return this.mentors.verifyMentor(mentor, body);
  }
}
