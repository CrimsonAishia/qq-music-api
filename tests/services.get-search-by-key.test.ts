const mockUCommon = jest.fn();

jest.mock('../src/services/u_common', () => ({
  __esModule: true,
  default: mockUCommon,
}));

jest.mock('../src/util/logger', () => ({
  __esModule: true,
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import getSearchByKey from '../src/services/search/getSearchByKey';
import { logger } from '../src/util/logger';

const mockedLogger = logger as jest.Mocked<typeof logger>;

describe('services/getSearchByKey', () => {
  beforeEach(() => {
    mockUCommon.mockReset();
    jest.clearAllMocks();
  });

  it('应在成功时返回标准响应并构建正确的搜索请求体', async () => {
    mockUCommon.mockResolvedValue({
      data: {
        'music.search.SearchCgiService': {
          code: 0,
          data: { body: { song: { list: ['jay'] } } },
        },
      },
    });

    const result = await getSearchByKey({
      params: {
        w: '周杰伦',
        n: 20,
        p: 2,
        t: 0,
      },
    });

    expect(mockUCommon).toHaveBeenCalledWith({
      method: 'post',
      options: {
        data: {
          'music.search.SearchCgiService': {
            module: 'music.search.SearchCgiService',
            method: 'DoSearchForQQMusicDesktop',
            param: {
              search_type: 0,
              query: '周杰伦',
              page_num: 2,
              num_per_page: 20,
            },
          },
        },
        headers: {
          'Content-Type': 'application/json',
          Referer: 'https://y.qq.com/',
        },
      },
    });
    expect(result).toEqual({
      status: 200,
      body: {
        code: 0,
        data: {
          list: expect.any(Array),
          total: 0,
          page: 1,
          pageSize: 1,
          hasMore: false,
        },
      },
    });
    expect(mockedLogger.info).toHaveBeenCalledWith(
      'service.requesting',
      expect.objectContaining({
        service: 'getSearchByKey',
      }),
    );
    expect(mockedLogger.info).toHaveBeenCalledWith(
      'service.succeeded',
      expect.objectContaining({
        service: 'getSearchByKey',
        keyword: '周杰伦',
      }),
    );
  });

  it('应在未传入参数时使用默认值', async () => {
    mockUCommon.mockResolvedValue({
      data: {
        'music.search.SearchCgiService': {
          code: 0,
        },
      },
    });

    await getSearchByKey({});

    expect(mockUCommon).toHaveBeenCalledWith({
      method: 'post',
      options: {
        data: {
          'music.search.SearchCgiService': {
            module: 'music.search.SearchCgiService',
            method: 'DoSearchForQQMusicDesktop',
            param: {
              search_type: 0,
              query: undefined,
              page_num: 1,
              num_per_page: 10,
            },
          },
        },
        headers: {
          'Content-Type': 'application/json',
          Referer: 'https://y.qq.com/',
        },
      },
    });
  });

  it('应在底层请求失败时返回 500', async () => {
    const error = new Error('network failed');
    mockUCommon.mockRejectedValue(error);

    const result = await getSearchByKey({
      params: {
        w: 'test',
      },
    });

    expect(result).toEqual({
      status: 500,
      body: {
        code: -1,
        error,
      },
    });
    expect(mockedLogger.error).toHaveBeenCalledWith(
      'service.failed',
      expect.objectContaining({
        service: 'getSearchByKey',
        error: {
          name: 'Error',
          message: 'network failed',
        },
      }),
    );
  });
});
