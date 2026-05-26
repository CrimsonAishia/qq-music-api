import { Context } from 'koa';
import services from '../services';

const { songLists } = services;

/**
 * @description: 2, 3
 * @param {page} 页数
 * @param {limit} 每页条数[20, 60]
 * @param {categoryId} 分类
 * @param {sortId} 分类
 * @return:
 */
export default async (ctx: Context) => {
  const {
    limit = 20,
    page = 0,
    sortId = 5,
    categoryId = 10000000,
  } = ctx.params as Record<string, string>;
  // BUGFIX: https://github.com/Rain120/qq-music-api/issues/16
  const sin = +page * +limit;
  const ein = +limit * (+page + 1) - 1;
  const params = Object.assign({
    categoryId,
    sortId,
    sin,
    ein,
  });
  const props = {
    method: 'get',
    params,
    option: {},
  };
  const { status, body } = await songLists(props);
  Object.assign(ctx, {
    status,
    body,
  });
};
