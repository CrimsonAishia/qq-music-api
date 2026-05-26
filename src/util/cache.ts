/**
 * 简单的内存缓存工具
 * 支持 TTL（过期时间）
 */

interface CacheEntry<T> {
  data: T;
  expireAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<any>>();

  /**
   * 获取缓存
   * @returns 缓存数据，过期或不存在返回 null
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expireAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param data 缓存数据
   * @param ttlMs 过期时间（毫秒）
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, {
      data,
      expireAt: Date.now() + ttlMs,
    });
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.store.clear();
  }
}

export const cache = new MemoryCache();

/** 常用 TTL 常量 */
export const TTL = {
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  HALF_DAY: 12 * 60 * 60 * 1000,
};
