import { Inject, Injectable } from '@nestjs/common';
@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    return '<center><h1>Hi Panteon, I hope to like my project.</h1></center>';
  }
}
