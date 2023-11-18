import { Controller, Get } from '@nestjs/common';
import * as did from './.well-known/did.json';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('./well-known/:id')
  returnWellKnown(): any {
    return did;
  }
}
