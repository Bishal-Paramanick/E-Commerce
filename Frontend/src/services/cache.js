/**
 * Stale-While-Revalidate (SWR) Client-Side In-Memory Cache
 * Eliminates redundant API calls and prevents layout shifts during back/forward navigation.
 */

class ClientCache {
  constructor() {
    this.cache = new Map();
    this.subscribers = new Map();
  }

  /**
   * Generate a normalized deterministic cache key from an endpoint and parameters.
   */
  createKey(prefix, params = {}) {
    if (!params || Object.keys(params).length === 0) {
      return prefix;
    }
    const sortedKeys = Object.keys(params).sort();
    const query = sortedKeys
      .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== "")
      .map((k) => `${k}=${params[k]}`)
      .join("&");
    return `${prefix}?${query}`;
  }

  /**
   * Retrieve cached item. Returns { data, isStale } or null if not in cache.
   */
  get(key, maxAgeMs = 5 * 60 * 1000) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    const isStale = age > maxAgeMs;

    return {
      data: entry.data,
      isStale,
      timestamp: entry.timestamp,
    };
  }

  /**
   * Store data in cache.
   */
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    this.notify(key, data);
  }

  /**
   * Remove specific key or pattern from cache.
   */
  invalidate(pattern) {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Subscribe to cache updates for background revalidations.
   */
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);
    return () => {
      const subs = this.subscribers.get(key);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  notify(key, data) {
    const subs = this.subscribers.get(key);
    if (subs) {
      subs.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error("Cache subscriber error:", e);
        }
      });
    }
  }
}

export const clientCache = new ClientCache();

