import services from '../services';

const { songListDetail } = services;

/**
 * @description: 歌单详情
 * @param {disstid} 歌单 ID
 */
import { Context } from 'koa';

export default async (ctx: Context) => {
  const { disstid } = ctx.params;
  // 歌单详情可能涉及用户私有歌单，使用用户自己的 cookie
  const userCookie = ctx.state.userCookie || '';

  const props = {
    params: {
      disstid,
    },
    cookie: userCookie,
  };
  const { status, body } = await songListDetail(props);
  Object.assign(ctx, {
    status,
    body,
  });
};
