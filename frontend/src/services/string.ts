export const stringService = {
  replaceLast: (string: string, substring: string, newSubstring: string) => {
    const startIndex: number = string.lastIndexOf(substring);
    const endIndex: number = startIndex + substring.length;
    const result: string =
      string.slice(0, startIndex) +
      newSubstring +
      string.slice(endIndex, string.length);

    return result;
  },
};
