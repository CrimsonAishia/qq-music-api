import { Context } from 'koa';
import services from '../services';

const { UCommon } = services;

// singermid=0025NhlN2yWrP4

export default async (ctx: Context) => {
  const { singermid, limit, page } = ctx.params as Record<string, string>;
  const num = +(limit || 5);
  const begin = +(page || 0);
  const data = {
    comm: {
      ct: 24,
      cv: 0,
    },
    singer: {
      method: 'GetAlbumList',
      param: {
        sort: 5,
        singermid,
        begin,
        num,
      },
      module: 'music.musichallAlbum.AlbumListServer',
    },
  };
  const params = Object.assign({
    format: 'json',
    singermid,
    data: JSON.stringify(data),
  });
  const props = {
    method: 'get',
    params,
    option: {},
  };
  if (singermid) {
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
  } else {
    ctx.status = 400;
    ctx.body = {
      response: 'no singermid',
    };
  }
};
