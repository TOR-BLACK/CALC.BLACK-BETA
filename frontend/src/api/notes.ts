import { Api } from "api/index";
import {
  NoteApiType,
  NoteCreateDataType,
  NoteUpdateDataType,
} from "types/notes";

export const NoteApiService = {
  URL: "note",
  getAll: (userId: string) => {
    return Api.get<NoteApiType[]>("notes", {
      params: {
        user_id: userId,
      },
    });
  },
  get: (userId: string, noteId: number) => {
    return Api.get<NoteApiType>(NoteApiService.URL, {
      params: {
        user_id: userId,
        note_id: noteId,
      },
    });
  },
  update: (data: NoteUpdateDataType) => {
    return Api.put(NoteApiService.URL, data);
  },
  create: (data: NoteCreateDataType) => {
    return Api.post(NoteApiService.URL, data);
  },
  delete: (userId: string, noteId: number) => {
    return Api.delete(NoteApiService.URL, {
      params: {
        user_id: userId,
        note_id: noteId,
      },
    });
  },
};
