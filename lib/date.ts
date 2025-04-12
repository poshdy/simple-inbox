import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
export const toISOString = (value: string | number | Date): string => {
  if (value instanceof Number) {
    return dayjs(value).toISOString();
  }
  return dayjs(value).toISOString();
};

export const timeFromNow = (value: string | Date): string => {
  return dayjs(value).fromNow();
};
