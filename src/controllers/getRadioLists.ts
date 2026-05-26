import services from '../services';

const { getRadioLists } = services;

import { Context } from 'koa';

export default async (ctx: Context) => {
  // 电台内容与用户关联，使用用户自己的 cookie
  const userCookie = ctx.state.userCookie || '';

  const { id, p } = ctx.params as Record<string, string>;

  const props = {
    method: 'get',
    params: {
      id: id ? +id : undefined,
      p: p ? +p : 1,
    },
    option: {},
    cookie: userCookie, // 使用用户自己的 cookie
  };
  const { status, body } = await getRadioLists(props);
  Object.assign(ctx, {
    status,
    body,
  });
};
