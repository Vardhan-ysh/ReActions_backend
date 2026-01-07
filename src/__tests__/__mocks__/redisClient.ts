const store = new Map<string, string>();

export const redis = {
  get: async (key: string) => store.get(key) ?? null,
  set: async (key: string, value: string) => {
    store.set(key, value);
  },
  del: async (key: string) => {
    store.delete(key);
  },
  clear: () => store.clear(),
};
