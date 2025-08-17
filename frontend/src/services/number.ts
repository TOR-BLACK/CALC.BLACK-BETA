export const numberService = {
  maxFloating: (number: number): number => {
    return Math.floor(number * 1000) / 1000;
  },
  maxExponential: (number: number, fraction: number = 7): number | string => {
    const numberLength = number.toString().length;
    if (numberLength > fraction + 1) return number.toExponential(fraction);

    return number;
  },
};
