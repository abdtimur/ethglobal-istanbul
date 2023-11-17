import { Module } from '@nestjs/common';
import { ZoomService } from './zoom.service';
import { ZoomController } from './zoom.controller';

@Module({
  imports: [],
  providers: [ZoomService],
  controllers: [ZoomController],
  exports: [ZoomService],
})
export class ZoomModule {}
