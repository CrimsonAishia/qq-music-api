import services from '../services';

const { getHotKey } = services;

import { Context } from 'koa';
import { cache, TTL } from '../util/cache';

const CACHE_KEY = 'hotkey';

export default async (ctx: Context) => {
  // 热搜关键词频率限制严格，缓存一天
  const cached = cache.get<{ status: number; body: any }>(CACHE_KEY);
  if (cached) {
    Object.assign(ctx, {
      status: cached.status,
      body: { ...cached.body, _cached: true },
    });
    return;
  }

  const props = {
    method: 'get',
    params: {},
    option: {},
  };
  const { status, body } = await getHotKey(props);

  // 只缓存成功的响应
  if (status === 200) {
    cache.set(CACHE_KEY, { status, body }, TTL.ONE_DAY);
  }

  Object.assign(ctx, {
    status,
    body,
  });
};
