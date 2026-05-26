import { AxiosRequestConfig } from 'axios';
import { apiConfig, requestConfig } from '../config';
import { BaseYCommonParams } from '../types/core/request';
import { logger } from '../util/logger';
import request from '../util/request';

export default ({
  url,
  method = 'get',
  options = {},
  hasCommonParams = true,
  cookie,
}: BaseYCommonParams & { cookie?: string }) => {
  const commonParams = hasCommonParams ? apiConfig.commonParams : {};

  const customHeaders: Record<string, string> = {
    referer: requestConfig.referer.c,
    host: 'c.y.qq.com',
  };

  // 如果传入了 cookie，则附加到上游请求头
  if (cookie) {
    customHeaders.Cookie = cookie;
  }

  const opts: AxiosRequestConfig = Object.assign({}, options, commonParams, {
    headers: {
      ...customHeaders,
      ...(options.headers as Record<string, string> | undefined),
    },
  });
  logger.debug(url, { opts });
  return request(url, method, opts);
};
