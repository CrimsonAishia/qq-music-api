import { AxiosRequestConfig } from 'axios';
import { apiConfig, requestConfig } from '../config';
import { BaseUCommonParams } from '../types/core/request';
import { logger } from '../util/logger';
import request from '../util/request';

export default ({
  options = {},
  method = 'get',
  cookie,
}: BaseUCommonParams & { cookie?: string }) => {
  const customHeaders: Record<string, string> = {
    referer: requestConfig.referer.u,
    host: 'u.y.qq.com',
    'content-type': 'application/x-www-form-urlencoded',
  };

  // 如果传入了 cookie，则附加到上游请求头
  if (cookie) {
    customHeaders.Cookie = cookie;
  }

  const opts: AxiosRequestConfig = {
    // commonParams (g_tk / loginUin 等) 作为 query params，不展开到 axios config 根层
    // 避免与 options.data / options.params 等字段产生冲突
    params: {
      ...apiConfig.commonParams,
      ...(options.params as Record<string, unknown> | undefined),
    },
    ...options,
    headers: {
      // customHeaders 作为默认值，options.headers 优先（后写覆盖前写）
      ...customHeaders,
      ...(options.headers as Record<string, string> | undefined),
    },
  };
  logger.debug(requestConfig.baseURL.u, { opts });
  return request(requestConfig.baseURL.u, method, opts, 'u');
};
