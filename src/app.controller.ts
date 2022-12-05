import { Controller, Get, Redirect } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // ensure you change the localhost:3000 to the final path
  @Get()
  @Redirect('http://localhost:3000/contributors')
  getHello(): string {
    return this.appService.getHello();
  }
}
