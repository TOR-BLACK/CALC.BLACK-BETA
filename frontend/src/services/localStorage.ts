export const localStorageService = {
  getItem: function <Type>(key: string): string | Type {
    if (typeof window !== "undefined") {
      const item = window.localStorage.getItem(key);

      if (item === null) return "";

      return JSON.parse(item);
    }
    return "";
  },
  setItem: function (key: string, value: any) {
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  removeItem: function (key: string) {
    window.localStorage.removeItem(key);
  },
};
