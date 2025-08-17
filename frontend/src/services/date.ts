export const dateService = {
  addOffset: (date: Date | string): Date => {
    const newDate: Date = new Date(date);
    /** Moscow by default */
    const offset: number = newDate.getTimezoneOffset() / 60 || -3;
    newDate.setHours(newDate.getHours() - offset);

    return newDate;
  },
  toString: (date: Date) => {
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    return `${date.toLocaleDateString("ru-RU")} ${date.toLocaleTimeString("ru-RU", timeOptions)}`;
  },
  getTimestamp: (): number => {
    return new Date().getTime();
  },
};
