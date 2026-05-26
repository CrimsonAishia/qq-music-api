import services from '../services';

const { downloadQQMusic } = services;

import { Context } from 'koa';
import { vipUserInfo } from '../config';

export default async (ctx: Context) => {
  // 下载链接使用固定 VIP 账号
  const vipCookie = vipUserInfo?.cookie || '';

  const props = {
    method: 'get',
    params: {},
    option: {},
    cookie: vipCookie,
  };
  const { status, body } = await downloadQQMusic(props);
  Object.assign(ctx, {
    status,
    body,
  });
};
