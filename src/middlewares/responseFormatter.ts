/**
 * 统一响应格式化中间件
 *
 * 将所有 API 接口的响应统一为以下格式：
 * {
 *   "code": 0,         // 0=成功, 非0=失败
 *   "data": { ... },   // 业务数据
 *   "message": ""      // 错误时的提示信息
 * }
 */
import { Context, Next } from 'koa';

/** 不需要格式化的路径前缀 */
const EXCLUDED_PATHS = ['/explorer', '/user/'];

/** 判断是否需要格式化 */
function shouldFormat(ctx: Context): boolean {
  const path = ctx.path;

  // 静态资源和 Explorer 相关路径不格式化
  if (EXCLUDED_PATHS.some((prefix) => path.startsWith(prefix))) {
    return false;
  }

  // 非 JSON 响应不格式化（如静态文件）
  const contentType = ctx.response.get('Content-Type') || '';
  if (contentType && !contentType.includes('json') && ctx.body !== undefined) {
    // koa 默认 JSON 对象不设置 Content-Type，在 respond 阶段才设置
    // 如果已经显式设置了非 JSON 的 Content-Type，跳过
    return false;
  }

  // body 为 undefined 或 null 时不格式化（404 等）
  if (ctx.body === undefined || ctx.body === null) {
    return false;
  }

  // 非对象类型不格式化（如字符串、Buffer）
  if (typeof ctx.body !== 'object') {
    return false;
  }

  return true;
}

/**
 * 从各种旧格式中提取业务数据
 */
function extractData(body: any, status: number): { code: number; data: any; message: string } {
  // 已经是新格式（有 code + data 字段，且 data 不是简单的 message 对象）
  if (
    'code' in body &&
    'data' in body &&
    typeof body.code === 'number' &&
    !('response' in body) &&
    !('status' in body && 'response' in body)
  ) {
    return {
      code: body.code,
      data: body.data,
      message: body.message || '',
    };
  }

  // 错误响应
  if (status >= 400) {
    const message = extractErrorMessage(body);
    return {
      code: status,
      data: null,
      message,
    };
  }

  // Pattern: { response: { code, data, ... } } — 大多数 service 返回
  if ('response' in body && typeof body.response === 'object' && body.response !== null) {
    const resp = body.response;
    // 上游返回的 code
    const upstreamCode = resp.code ?? resp.retcode ?? 0;
    return {
      code: upstreamCode,
      data: resp.data ?? resp,
      message: resp.msg || resp.message || '',
    };
  }

  // Pattern: { response: string } — 错误字符串
  if ('response' in body && typeof body.response === 'string') {
    return {
      code: status >= 400 ? status : -1,
      data: null,
      message: body.response,
    };
  }

  // Pattern: { response: null } — 空响应（如 smartbox 无结果）
  if ('response' in body && body.response === null) {
    return {
      code: 0,
      data: null,
      message: '',
    };
  }

  // Pattern: { data: { playUrl } } — getMusicPlay
  if ('data' in body && !('code' in body) && !('response' in body)) {
    return {
      code: 0,
      data: body.data,
      message: '',
    };
  }

  // Pattern: { status: number, response: ... } — getSingerList, getNewDisks
  if ('status' in body && 'response' in body) {
    const resp = body.response;
    if (typeof resp === 'object' && resp !== null) {
      const upstreamCode = resp.code ?? 0;
      return {
        code: upstreamCode,
        data: resp.data ?? resp,
        message: resp.msg || resp.message || '',
      };
    }
    return {
      code: body.status >= 400 ? body.status : 0,
      data: resp,
      message: typeof resp === 'string' ? resp : '',
    };
  }

  // Pattern: { error: string } — observability catch
  if ('error' in body && Object.keys(body).length === 1) {
    return {
      code: 500,
      data: null,
      message: typeof body.error === 'string' ? body.error : 'Internal Server Error',
    };
  }

  // 兜底：直接作为 data
  return {
    code: 0,
    data: body,
    message: '',
  };
}

/**
 * 从错误响应体中提取错误信息
 */
function extractErrorMessage(body: any): string {
  if (typeof body === 'string') return body;
  if (body?.data?.message) return body.data.message;
  if (body?.response?.msg) return body.response.msg;
  if (body?.response && typeof body.response === 'string') return body.response;
  if (body?.message) return body.message;
  if (body?.error && typeof body.error === 'string') return body.error;
  return 'Request failed';
}

export default function responseFormatter() {
  return async (ctx: Context, next: Next) => {
    await next();

    if (!shouldFormat(ctx)) {
      return;
    }

    const { code, data, message } = extractData(ctx.body, ctx.status);

    ctx.body = {
      code,
      data,
      message,
    };

    // 确保 HTTP 状态码与业务码一致
    if (ctx.status >= 400 && code === 0) {
      // 保持原始 HTTP 状态码
    } else if (code > 0 && code < 600 && ctx.status === 200) {
      // 如果业务码表示错误但 HTTP 状态是 200，保持 200（前端通过 code 判断）
    }
  };
}
