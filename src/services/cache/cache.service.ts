import { RedisClientType } from '@redis/client';
import { createClient } from 'redis';
import { CacheTypeDTO } from './types';
import { params } from '@serverless/cloud';

const { CACHE_USERNAME, CACHE_PASSWORD, CACHE_HOST, CACHE_PORT } =
  params;

export class CacheService {
  private readonly redisClient: RedisClientType;
  constructor() {
    this.redisClient = createClient({
      url: `redis://${CACHE_USERNAME}:${CACHE_PASSWORD}@${CACHE_HOST}:${CACHE_PORT}`,
    });
    this.redisClient.connect();
    this.redisClient.on('error', (err) =>
      console.log('Redis Client Error', err),
    );
  }

  async getCachedData(key: string) {
    try {
      const response = await this.redisClient.get(key);
      return JSON.parse(response);
    } catch (error) {
      return error;
    }
  }

  async setCacheData(cacheData: CacheTypeDTO) {
    let { key, value } = cacheData;

    try {
      await this.redisClient.set(key, JSON.stringify(value));
    } catch (error) {
      return error;
    }
  }

  async deleteCachedData(key: string) {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      return error;
    }
  }
}
