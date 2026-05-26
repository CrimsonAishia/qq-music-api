import { Context } from 'koa';
import { vipUserInfo } from '../config';
import services from '../services';

const { getLyric } = services;

export default async (ctx: Context) => {
  // songmid=003rJSwm3TechU
  // 歌词获取使用 VIP 账号（部分歌词需要会员权限）
  const vipCookie = vipUserInfo?.cookie || '';

  const { songmid, isFormat } = ctx.params as Record<string, string>;
  const props = {
    method: 'get',
    params: {
      songmid,
    },
    option: {},
    isFormat: isFormat === 'true' || isFormat === '1',
    cookie: vipCookie,
  };
  if (songmid) {
    const { status, body } = await getLyric(props);
    Object.assign(ctx, {
      status,
      body,
    });
  } else {
    ctx.status = 400;
    ctx.body = {
      response: 'no songmid',
    };
  }
};
