import { AxiosProgressEvent } from "axios";
import { BYTES_IN_MB } from "constants/files";
import { ApiProgressType } from "types/api";

const apiService = {
  getError: (error: any, fallbackError: string = ""): string => {
    const responseError =
      error.response?.data || "Не удалось зарегистрироваться";

    return responseError && typeof responseError === "string"
      ? responseError
      : fallbackError;
  },
  readableTime: (unixTime: number): string => {
    const date = new Date(unixTime * 1000);
    const hours = date.getHours() - 3;
    const minutes = "0" + date.getMinutes();
    const seconds = "0" + date.getSeconds();

    return hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
  },
  initProgress: function (): ApiProgressType {
    let lastNow: number = new Date().getTime();
    let lastKBytes: number = 0;

    return {
      get: () => ({ lastNow, lastKBytes }),
      set: (newState) => {
        lastNow = newState.lastNow;
        lastKBytes = newState.lastKBytes;
      },
      reset: () => {
        lastNow = new Date().getTime();
        lastKBytes = 0;
      },
    };
  },
  progressHandler: (event: AxiosProgressEvent, state: ApiProgressType) => {
    // считаем размер загруженного и процент от полного размера
    const loadedMb = (event.loaded / BYTES_IN_MB).toFixed(1);
    const totalSizeMb = (event.total / BYTES_IN_MB).toFixed(1);
    const percentLoaded = Math.round((event.loaded / event.total) * 100);
    const leftMb = Number(totalSizeMb) - Number(loadedMb);
    const now = new Date().getTime();
    const bytes = event.loaded;
    const total = event.total;
    const percent = (bytes / total) * 100;
    const kbytes = bytes / 1024;
    const mbytes = kbytes / 1024;
    const stateData = state.get();
    const uploadedkBytes = kbytes - stateData.lastKBytes;
    const elapsed = (now - stateData.lastNow) / 1000;
    const kbps = elapsed ? uploadedkBytes / elapsed : 0;
    let grade = "Kb/s";
    let speed_value = kbps;
    const mbps = kbps / 1024;
    if (kbps > 1000) {
      grade = "Mb/s";
      speed_value = mbps;
    }

    state.set({
      lastKBytes: kbytes,
      lastNow: now,
    });

    const leftTime = leftMb / mbps;

    return {
      percent: percentLoaded,
      timeLeft: `${apiService.readableTime(leftTime)}`,
      speed: `${speed_value.toFixed(1)} ${grade}`,
    };
  },
};

export default apiService;
