import { AxiosRequestConfig } from 'axios';
import { BaseServiceParams, BaseServiceResponse } from '../../types/core/request';
import { logServiceFailure, logServiceRequest, logServiceSuccess } from '../../util/observability';
import u_common from '../u_common';

export interface SongListDetailParams extends BaseServiceParams {
  cookie?: string;
}

const upstream = 'u.y.qq.com/cgi-bin/musicu.fcg';

export default ({ params = {}, cookie }: SongListDetailParams): Promise<BaseServiceResponse> => {
  const {
    disstid,
    song_begin = 0,
    song_num = 100,
    onlysonglist = 0,
  } = params as {
    disstid?: string | number;
    song_begin?: number;
    song_num?: number;
    onlysonglist?: number;
  };

  const requestData = {
    comm: {
      g_tk: 5381,
      uin: 0,
      format: 'json',
      platform: 'yqq.json',
      needNewCode: 0,
    },
    req_0: {
      module: 'srf_diss_info.DissInfoServer',
      method: 'CgiGetDiss',
      param: {
        disstid: Number(disstid),
        onlysonglist: Number(onlysonglist),
        song_begin: Number(song_begin),
        song_num: Number(song_num),
      },
    },
  };

  logServiceRequest('songListDetail', upstream, requestData);

  const options: AxiosRequestConfig = {
    data: requestData,
    headers: {
      'Content-Type': 'application/json',
      Referer: 'https://y.qq.com/',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  };

  return u_common({
    method: 'post',
    options,
    cookie,
  })
    .then((res: import('axios').AxiosResponse<any>) => {
      const response = res.data;
      logServiceSuccess('songListDetail', upstream, response, {
        disstid,
      });
      return {
        status: 200,
        body: {
          response,
        },
      };
    })
    .catch((error: unknown) => {
      logServiceFailure('songListDetail', upstream, error, requestData);
      return {
        status: 500,
        body: {
          error,
        },
      };
    });
};
