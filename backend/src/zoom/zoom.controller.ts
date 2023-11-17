import { Controller } from '@nestjs/common';
import { ZoomService } from './zoom.service';

@Controller('zoom')
export class ZoomController {
  constructor(private readonly zoom: ZoomService) {}

  // @Post callback
}
