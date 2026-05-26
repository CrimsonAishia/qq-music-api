import services from '../services';

const { getComments } = services;

// comments: params error
// id: 专辑或者歌单请求结果的id
// rootcommentid: 上一次请求结果的最后一项, comment.commentlist[commentlist.length - 1].rootcommentid
// id=8220
// rootcommentid=album_8220_1003310416_1558068713
// cid=205360772
import { Context } from 'koa';

export default async (ctx: Context) => {
  const {
    id,
    pagesize = 25,
    pagenum = 0,
    cid = 205360772,
    cmd = 8,
    reqtype = 2,
    biztype = 1,
    rootcommentid = '',
  } = ctx.params as Record<string, string>;
  const pageNumValue = Number(pagenum);
  const checkrootcommentid = pageNumValue === 0 ? true : !!rootcommentid;
  // 评论列表使用用户自己的 cookie（登录后可看到自己的评论状态）
  const userCookie = ctx.state.userCookie || '';

  const params = Object.assign({
    cid,
    reqtype,
    biztype,
    topid: id,
    cmd,
    pagenum,
    pagesize,
    lasthotcommentid: rootcommentid,
  });
  const props = {
    method: 'get',
    params,
    option: {},
    cookie: userCookie,
  };
  if (id && checkrootcommentid) {
    const { status, body } = await getComments(props);
    Object.assign(ctx, {
      status,
      body,
    });
  } else {
    ctx.status = 400;
    ctx.body = {
      data: {
        message: "Don't have id or rootcommentid",
      },
    };
  }
};
