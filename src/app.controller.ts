import { Get, Controller } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  root(): string {
    return 'Yur backend';
  }
}
