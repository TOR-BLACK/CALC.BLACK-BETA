export enum FILE_INPUT_TYPE {
  DEFAULT = "image",
  IMAGE = "image",
  VIDEO = "video",
}

const imageFileTypes = [
  "image/apng",
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/pjpeg",
  "image/png",
  "image/svg+xml",
  "image/tiff",
  "image/webp",
  "image/x-icon",
];

const videoFileTypes = [
  "video/mp4",
  "video/mpeg",
  "video/ogg",
  "video/webm",
  "video/x-msvideo",
  "video/3gpp",
  "video/3gpp2",
];

export const FileInputTypeData = {
  [FILE_INPUT_TYPE.DEFAULT]: {
    accept: "*/*",
  },
  [FILE_INPUT_TYPE.IMAGE]: {
    accept: imageFileTypes.join(", "),
    allowedTypes: imageFileTypes,
    typeError: "Необходимо загрузить изображение",
  },
  [FILE_INPUT_TYPE.VIDEO]: {
    accept: videoFileTypes.join(", "),
    allowedTypes: videoFileTypes,
    typeError: "Необходимо загрузить видео",
  },
};
