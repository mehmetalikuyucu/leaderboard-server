import { ConfigService } from '@nestjs/config';
import { RedisModuleOptions } from '@liaoliaots/nestjs-redis';

export const getRedisConfig = async (
  configService: ConfigService,
): Promise<RedisModuleOptions> => {
  return {
    config: {
      host: configService.get('REDIS_HOST'),
      port: configService.get('REDIS_PORT'),
    },
  };
};
