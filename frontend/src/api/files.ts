import { DvdApi } from "api/index";
import { AxiosProgressEvent } from "axios";
import { ENV_FILEHOSTING_URL } from "constants/env";
import { FILE_LIFE } from "constants/files";
import {
  FileAddCoordsType,
  FileCreateDataType,
  FileCreateParamsType,
} from "types/files";

export const FilesApiService = {
  /** @return file url */
  get: (directoryId: string, fileName: string, isSafari?: boolean) => {
    return `${ENV_FILEHOSTING_URL}/api/get_file?id=${directoryId}&file_name=${fileName}${isSafari ? "&ios=true" : ""}`;
  },
  /** @return directory id */
  create: (
    data: FileCreateDataType,
    params: FileCreateParamsType = {
      life: FILE_LIFE.INFINITY,
      compress: false,
    },
    onProgressCallback: (progressEvent: AxiosProgressEvent) => void = () => {},
  ) => {
    return DvdApi.post<string>("upload_file", data, {
      params,
      onUploadProgress: onProgressCallback,
    });
  },
  /** File directory id */
  add: (
    data: FileCreateDataType,
    id: string,
    onProgressCallback: (progressEvent: AxiosProgressEvent) => void = () => {},
  ) => {
    return DvdApi.post("add_files", data, {
      params: { id },
      onUploadProgress: onProgressCallback,
    });
  },
  /** Add coords for video file
   * @return prepared file URL */
  addCoords: (
    data: FileAddCoordsType,
    onProgressCallback: (progressEvent: AxiosProgressEvent) => void = () => {},
  ) => {
    return DvdApi.post<string>("apply_coords", data, {
      onUploadProgress: onProgressCallback,
    });
  },
  delete: (directoryId: string, fileName: string) => {
    return DvdApi.delete("delete_file", {
      params: {
        /** Directory id */
        id: directoryId,
        filename: fileName,
      },
    });
  },
  deleteDirectory: (directoryId: string) => {
    return DvdApi.get("delete_dir", {
      params: {
        /** Directory id */
        id: directoryId,
      },
    });
  },
};
