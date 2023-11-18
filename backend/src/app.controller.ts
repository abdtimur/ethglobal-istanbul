import { Controller, Get, Param, Res } from '@nestjs/common';
import * as did from './.well-known/did.json';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('.well-known/:id')
  returnWellKnown(@Res() res: Response, @Param('id') id: string): void {
    res.json(did);
    res.send();
  }
}
