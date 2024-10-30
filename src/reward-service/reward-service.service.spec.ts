import { Test, TestingModule } from '@nestjs/testing';
import { RewardServiceService } from './reward-service.service';

describe('RewardServiceService', () => {
  let service: RewardServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RewardServiceService],
    }).compile();

    service = module.get<RewardServiceService>(RewardServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
