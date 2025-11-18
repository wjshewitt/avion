interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  tags?: Set<string>;
}

export class WeatherCache {
  private store = new Map<string, CacheEntry<any>>();
  private tagIndex = new Map<string, Set<string>>();

  set<T>(key: string, data: T, ttlSeconds: number, tags: string[] = []): void {
    const tagSet = new Set(tags.filter(Boolean));

    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
      tags: tagSet.size ? tagSet : undefined,
    });

    if (tagSet.size) {
      for (const tag of tagSet) {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set());
        }
        this.tagIndex.get(tag)!.add(key);
      }
    }
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.removeKeyFromTags(key, entry.tags);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.store.clear();
    this.tagIndex.clear();
  }

  prune(): void {
    const now = Date.now();
    const entries = Array.from(this.store.entries());
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        this.removeKeyFromTags(key, entry.tags);
      }
    }
  }

  invalidateTag(tag: string): void {
    const keys = this.tagIndex.get(tag);
    if (!keys) return;

    for (const key of keys) {
      const entry = this.store.get(key);
      if (entry) {
        this.store.delete(key);
      }
    }

    this.tagIndex.delete(tag);
  }

  invalidateTags(tags: string[]): void {
    for (const tag of tags) {
      this.invalidateTag(tag);
    }
  }

  private removeKeyFromTags(key: string, tags?: Set<string>): void {
    if (!tags) return;
    for (const tag of tags) {
      const keys = this.tagIndex.get(tag);
      if (!keys) continue;
      keys.delete(key);
      if (!keys.size) {
        this.tagIndex.delete(tag);
      }
    }
  }
}
