import { AxiosRequestConfig } from 'axios';
import { apiConfig, requestConfig } from '../../config';
import { logServiceFailure, logServiceRequest, logServiceSuccess } from '../../util/observability';
import request from '../../util/request';

interface GetRadioSongsParams {
  id: number;
  num?: number;
  firstplay?: number;
  cookie?: string;
}

const serviceName = 'getRadioSongs';

export default ({ id, num = 10, firstplay = 1, cookie }: GetRadioSongsParams) => {
  const requestData = {
    radioSongs: {
      module: 'pf.radiosvr',
      method: 'GetRadiosonglist',
      param: {
        id,
        firstplay,
        num,
      },
    },
  };

  const upstream = requestConfig.baseURL.u;

  logServiceRequest(serviceName, upstream, requestData);

  const customHeaders: Record<string, string> = {
    referer: requestConfig.referer.u,
    host: 'u.y.qq.com',
    'content-type': 'application/json',
  };

  if (cookie) {
    customHeaders.Cookie = cookie;
  }

  const opts: AxiosRequestConfig = {
    params: {
      ...apiConfig.commonParams,
    },
    data: JSON.stringify(requestData),
    headers: customHeaders,
  };

  return request(upstream, 'post', opts, 'u')
    .then((res) => {
      const response = res.data as Record<string, any>;
      logServiceSuccess(serviceName, upstream, response, { id, num });
      return {
        status: 200,
        body: {
          response: response.radioSongs?.data || response,
        },
      };
    })
    .catch((error: unknown) => {
      logServiceFailure(serviceName, upstream, error, requestData);
      return {
        status: 500,
        body: {
          error,
        },
      };
    });
};
