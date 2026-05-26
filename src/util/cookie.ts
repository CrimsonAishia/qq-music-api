/*
 * @Author: Rainy [https://github.com/rain120]
 * @Date: 2021-01-23 16:19:21
 * @LastEditors: Rainy
 * @LastEditTime: 2021-06-19 22:20:01
 */

import { Context, Next } from 'koa';
import { userInfo } from '../config';

/**
 * Cookie 中间件
 *
 * 优先级：
 * 1. 用户通过请求头 `X-User-Cookie` 传入的 cookie（用于个性化接口）
 * 2. 服务端配置的全局 cookie（兜底）
 *
 * 会将最终使用的 cookie 挂载到 ctx.state.userCookie 供后续使用
 */
export default () => async (ctx: Context, next: Next) => {
  // 优先使用用户通过请求头传入的 cookie
  const userProvidedCookie = ctx.get('X-User-Cookie');

  if (userProvidedCookie) {
    // 用户自己提供的 cookie
    (ctx.request as unknown as { cookie: string }).cookie = userProvidedCookie;
    ctx.state.userCookie = userProvidedCookie;
    ctx.state.userUin = extractUinFromCookie(userProvidedCookie);
  } else if (userInfo.cookie) {
    // 兜底使用服务端配置的 cookie
    (ctx.request as unknown as { cookie: string }).cookie = userInfo.cookie;
    ctx.state.userCookie = userInfo.cookie;
    ctx.state.userUin = userInfo.uin || '';

    const cookieHeader = ctx.request.headers;
    if (cookieHeader && userInfo.cookieList) {
      userInfo.cookieList.forEach((cookie: string) => {
        const [key, value = ''] = cookie.split('=');
        if (value) {
          ctx.cookies.set(key, value.trim(), {
            maxAge: 24 * 60 * 60 * 1000,
          });
        }
      });
    }
  } else {
    ctx.state.userCookie = '';
    ctx.state.userUin = '';
  }

  await next();
};

/**
 * 从 cookie 字符串中提取 uin
 */
function extractUinFromCookie(cookie: string): string {
  const match = cookie.match(/(?:^|;\s*)uin=([^;]*)/);
  if (match) {
    // QQ cookie 中 uin 通常是 o + 数字，去掉前缀 o
    return match[1].replace(/^o/, '');
  }
  return '';
}
