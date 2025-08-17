export const arrayService = {
  fromNumber: <ItemType>(
    number: number,
    fill: ItemType | null = null,
  ): ItemType[] => {
    return new Array(Math.floor(number)).fill(fill);
  },
};
