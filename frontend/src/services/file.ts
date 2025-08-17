import { FILE_SEQUENCE_NUMBER_REGEX } from "constants/files";
import { stringService } from "services/string";

const fileService = {
  getExtension: (name: string): string => {
    const extension: string | undefined = name.split(".").at(-1);

    return extension || "";
  },
  changeExtension: (name: string, newExtension: string): string => {
    const nameSplit = name.split(".");
    nameSplit[nameSplit.length - 1] = newExtension;

    return nameSplit.join(".");
  },
  prepareFilename: (names: string[], name: string): string => {
    let newName = name;

    if (names.includes(name)) {
      const sequence: string | undefined = (
        name.match(FILE_SEQUENCE_NUMBER_REGEX) || []
      ).at(-1); // ex. `(1)`

      /** Increase value in () */
      if (sequence) {
        const sequenceNumber = Number(sequence.replaceAll(/[()]/g, "")); // ex. 1
        newName = stringService.replaceLast(
          newName,
          sequence,
          `(${sequenceNumber + 1})`,
        );
        /** Add sequence (1) to name before extension */
      } else {
        const nameSplit: string[] = name.split(".");
        nameSplit[nameSplit.length - 2] =
          `${nameSplit[nameSplit.length - 2]}(1)`;
        newName = nameSplit.join(".");
      }

      /** Recheck name uniqueness  */
      return fileService.prepareFilename(names, newName);
    }

    return newName;
  },
  changeName: (file: File, name: string): File => {
    return new File([file], name, {
      type: file.type,
      lastModified: file.lastModified,
    });
  },
  dataURLtoFile: (dataURL: string, filename: string) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[arr.length - 1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  },
  getVideoDuration: (file: File, callback: (duration: number) => void) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = function () {
      window.URL.revokeObjectURL(video.src);
      callback(video.duration);
    };

    video.src = URL.createObjectURL(file);
  },
};

export default fileService;
