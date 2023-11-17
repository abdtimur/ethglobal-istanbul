import { TypeOrmModule } from '@nestjs/typeorm';
import { Mentor } from './mentor.entity';
import { Module } from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { MentorsController } from './mentors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mentor])],
  providers: [MentorsService],
  controllers: [MentorsController],
  exports: [MentorsService],
})
export class MentorsModule {}
