import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse } from '@nestjs/swagger';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
  ) {}

  @ApiResponse({ status: 200, description: 'Returns A Hope' })
  @Get()
  getHello(): Promise<string> {
    return this.appService.getHello();
  }

}
