import { FilesApiService } from "api/files";
import { FileImageExtensions, FileVideoExtensions } from "constants/files";
import { isSafari } from "react-device-detect";
import { dateService } from "services/date";
import fileService from "services/file";
import {
  FileAddCoordsType,
  FileAddDataType,
  FileCreateDataType,
} from "types/files";
import {
  NoteApiType,
  NoteCreateDataType,
  NotePhotoType,
  NoteType,
  NoteUpdateDataType,
  NoteVideoType,
} from "types/notes";

interface ToApiParamsType {
  text: string;

  /** File names */
  fileNames: string[];
  userId: string;
  noteId?: number;

  /** directory where files was uploaded */
  directoryId?: string;
  is_session?: string | unknown;
}

const notesHelper = {
  fromApi: function (note: NoteApiType): NoteType {
    const { id, user_numeric, text, updated_at, files = [], url = "" } = note;
    const fileNames = files ? files : [];
    const date = dateService.addOffset(updated_at);
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 5);
    const expireDate = dateService.toString(newDate);
    const dateString = dateService.toString(date);
    const photos: NotePhotoType[] = [];
    const videos: NoteVideoType[] = [];

    fileNames.forEach((fileName, index) => {
      const extension: string = fileService.getExtension(fileName);

      if (FileVideoExtensions.includes(extension)) {
        videos.push({
          id: videos.length + 1,
          name: fileName,
          src: FilesApiService.get(url, fileName, isSafari),
        });
      } else if (FileImageExtensions.includes(extension)) {
        photos.push({
          id: index,
          name: fileName,
          src: FilesApiService.get(url, fileName, isSafari),
        });
      }
    });

    return {
      id: id,
      number: user_numeric,
      text: text,
      date: dateString,
      link: url,
      photos,
      videos,
      expireDate,
    };
  },
  listFromApi: function (notes: NoteApiType[]): NoteType[] {
    return notes.map(notesHelper.fromApi);
  },
  /** @return FormData as NoteCreateDataType */
  toApi: function (
    params: ToApiParamsType,
  ): NoteCreateDataType | NoteUpdateDataType {
    const formData = new FormData();
    const { text, fileNames, userId, noteId, directoryId, is_session } = params;

    formData.append("user_id", userId);
    typeof noteId === "number" && formData.append("note_id", `${noteId}`);
    formData.append("text", text);
    directoryId && formData.append("url", directoryId);
    formData.append("files", fileNames.length ? fileNames.join("!;") : "");
    typeof noteId != "number" && formData.append("is_session", `${is_session}`);

    return formData;
  },
  /** @return FormData as FileCreateDataType */
  filesToApi: function (
    files: (NoteVideoType | NotePhotoType)[],
  ): FileCreateDataType | FileAddDataType | FileAddCoordsType {
    const formData: FormData = new FormData();
    const videoLinks: string[] = [];

    files.forEach((file) => {
      /** For default files */
      if (file.file) {
        formData.append("files", file.file as File, file.name);

        /** For files with coordinates */
      } else {
        const videoFile = file as NoteVideoType;

        if (videoFile.fileURL) {
          videoLinks.push(videoFile.fileURL);
        }
      }
    });

    if (videoLinks.length) {
      formData.append("note_videos", JSON.stringify(videoLinks));
    }

    return formData;
  },
  /** @return FormData as FileAddCoordsType */
  fileToAddCoords: function (file: NoteVideoType): FileAddCoordsType {
    const formData = new FormData();
    formData.append("files", file.file as File, file.name);
    if ("coords" in file && file.coords) {
      formData.append(
        "coords",
        JSON.stringify({
          name: file.name,
          coords: file.coords,
        }),
      );
    }

    return formData;
  },
};

export default notesHelper;
