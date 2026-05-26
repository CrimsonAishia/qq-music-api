import { AxiosRequestConfig } from 'axios';
import { logServiceFailure, logServiceRequest, logServiceSuccess } from '../../util/observability';
import { formatSearchResult } from '../../util/searchFormatter';
import u_common from '../u_common';

interface GetSearchByKeyParams {
  method?: string;
  params?: Record<string, unknown>;
  option?: AxiosRequestConfig;
}

const upstream = 'u.y.qq.com/cgi-bin/musicu.fcg';

export default ({ params = {} }: GetSearchByKeyParams) => {
  const {
    w,
    n = 10,
    p = 1,
    t = 0,
  } = params as {
    w?: string;
    n?: number;
    p?: number;
    t?: number;
  };

  const searchType = Number(t);

  const requestData = {
    'music.search.SearchCgiService': {
      module: 'music.search.SearchCgiService',
      method: 'DoSearchForQQMusicDesktop',
      param: {
        search_type: searchType,
        query: w,
        page_num: Number(p),
        num_per_page: Number(n),
      },
    },
  };

  logServiceRequest('getSearchByKey', upstream, requestData);

  const options: AxiosRequestConfig = {
    data: requestData,
    headers: {
      'Content-Type': 'application/json',
      Referer: 'https://y.qq.com/',
    },
  };

  return u_common({
    method: 'post',
    options,
  })
    .then((res: import('axios').AxiosResponse<any>) => {
      const response = res.data;
      logServiceSuccess('getSearchByKey', upstream, response, {
        keyword: typeof w === 'string' ? w : undefined,
      });

      // 格式化搜索结果
      const formatted = formatSearchResult(response, searchType);

      return {
        status: 200,
        body: {
          ...formatted,
        },
      };
    })
    .catch((error: unknown) => {
      logServiceFailure('getSearchByKey', upstream, error, requestData);
      return {
        status: 500,
        body: {
          code: -1,
          error,
        },
      };
    });
};
