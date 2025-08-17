import { FILE_LIFE } from "constants/files";

export interface FileCreateParamsType {
  life: FILE_LIFE;
  compress: boolean;
}

export interface FileCoordsType {
  /** The video file name corresponding to the coordinates */
  name: string;

  /** Strings with geo data */
  coords: string[];
}

export type FileCreateDataType =
  | FormData
  | {
      files: File;
      coords?: FileCoordsType[];
    };

export interface FileAddParamsType {}

export type FileAddDataType =
  | FormData
  | {
      files: File;
      coords_file: FileCoordsType;
    };

export type FileAddCoordsType =
  | FormData
  | {
      files: File;
      coords_file?: FileCoordsType[];
    };

export interface DeleteFileParamsType {
  /** Directory id */
  id: string;

  filename: string;
}
