import services from '../services';

const { getRadioSongs } = services;

import { Context } from 'koa';

export default async (ctx: Context) => {
  const userCookie = ctx.state.userCookie || '';

  const { id, num } = ctx.params as Record<string, string>;

  if (!id) {
    ctx.status = 400;
    ctx.body = { error: 'id is required' };
    return;
  }

  const { status, body } = await getRadioSongs({
    id: +id,
    num: num ? +num : 10,
    cookie: userCookie,
  });
  Object.assign(ctx, {
    status,
    body,
  });
};
