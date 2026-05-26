import services from '../services';

const { UCommon } = services;

import { Context } from 'koa';
import { commonParams } from '../config';

export default async (ctx: Context) => {
  // Desc: https://github.com/Rain120/qq-music-api/issues/14
  // 1. topId is useless
  // 2. qq api period is change not YYYY-MM-DD
  const {
    topId: topIdStr,
    limit: limitStr,
    page: pageStr,
    period: periodStr,
  } = ctx.params as Record<string, string>;
  const topId = +(topIdStr || 4);
  const num = +(limitStr || 20);
  const offset = +(pageStr || 0);
  const period = periodStr || '';

  const data = {
    comm: {
      ...(commonParams || {}),
      cv: 4747474,
      ct: 24,
      format: 'json',
      inCharset: 'utf-8',
      needNewCode: 1,
      uin: 0,
    },
    req_1: {
      module: 'musicToplist.ToplistInfoServer',
      method: 'GetDetail',
      param: {
        topId,
        offset,
        num,
        period,
      },
    },
    // TODO: 新评论，之后迭代更新再说
    // req_2: {
    // 	module: 'music.globalComment.CommentReadServer',
    // 	method: 'GetNewCommentList',
    // 	param: {
    // 		BizType: 4,
    // 		BizId: '59',
    // 		LastCommentSeqNo: '',
    // 		PageSize: 25,
    // 		PageNum: 0,
    // 		FromCommentId: '',
    // 		WithHot: 1,
    // 	},
    // },
    // TODO: 热门评论，之后迭代更新再说
    // req_3: {
    // 	module: 'music.globalComment.CommentReadServer',
    // 	method: 'GetHotCommentList',
    // 	param: {
    // 		BizType: 4,
    // 		BizId: '59',
    // 		LastCommentSeqNo: '',
    // 		PageSize: 15,
    // 		PageNum: 0,
    // 		HotType: 2,
    // 		WithAirborne: 1,
    // 	},
    // },
  };
  const params = Object.assign({
    format: 'json',
    data: JSON.stringify(data),
  });
  const props = {
    method: 'get',
    params,
    option: {},
  };
  await UCommon(props)
    .then((res: import('axios').AxiosResponse<any>) => {
      const response = res.data;
      ctx.status = 200;
      ctx.body = {
        response,
      };
    })
    .catch((error: unknown) => {
      throw error;
    });
};
