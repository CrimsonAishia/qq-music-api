import { Context } from 'koa';
import services from '../services';

const { getSearchByKey } = services;

export default async (ctx: Context) => {
  const params = (ctx as any).params || {};
  const w = params.key;
  const n = params.limit;
  const p = params.page;
  const catZhida = params.catZhida;
  const remoteplace = (ctx.query as Record<string, string>).remoteplace || 'song';
  const t = (ctx.query as Record<string, string>).t;
  const props = {
    method: 'get',
    params: {
      // w：搜索关键字
      // p：当前页
      // n：每页歌曲数量
      // t: 搜索类型 0-歌曲 2-歌单 7-歌词 8-专辑 9-歌手 12-MV
      // catZhida: 0表示歌曲, 2表示歌手, 3表示专辑, 4, 5
      w,
      n: Number(n) || 10,
      p: Number(p) || 1,
      t: Number(t) || 0,
      catZhida: Number(catZhida) || 1,
      remoteplace: `txt.yqq.${remoteplace}`,
    },
    option: {},
  };
  if (w) {
    const { status, body } = await getSearchByKey(props);
    Object.assign(ctx, {
      status,
      body,
    });
  } else {
    ctx.status = 400;
    ctx.body = {
      response: 'search key is null',
    };
  }
};
