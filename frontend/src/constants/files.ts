export enum FILE_LIFE {
  INFINITY = "infinity",
}

export const FILE_SEQUENCE_NUMBER_REGEX = /\([0-9]+\)/g;
export const BYTES_IN_MB = 1048576;

export const FileVideoExtensions = [
  "webm",
  "mkv",
  "flv",
  "vob",
  "ogv",
  "ogg",
  "drc",
  "gif",
  "gifv",
  "mng",
  "avi",
  "mov",
  "wmv",
  "yuv",
  "mp4",
  "mpg",
  "mp2",
  "mpeg",
  "mpe",
  "mpv",
  "m2v",
  "3gp",
  "flv",
];

export const FileImageExtensions = [
  "apng",
  "png",
  "avif",
  "gif",
  "jpg",
  "jpeg",
  "jfif",
  "pjpeg",
  "pjp",
  "png",
  "svg",
  "webp",
  "bmp",
  "ico",
];

// TODO add tiff converter
export const FileImageDecodeExtensions = ["heic", "tiff", "tif", "heif"];
