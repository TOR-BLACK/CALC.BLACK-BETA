import { NOTE_FILE_TYPE } from "constants/notes";

export interface NotePhotoType {
  id: string | number;
  name: string;
  src: string; // Base64 string or URL
  file?: File;
}

export interface NoteVideoType {
  id: number;
  name: string;

  /** URL */
  src: string;

  /** Uploaded URL for new file  */
  fileURL?: string;

  file?: File;

  /** Array of coords data for every second */
  coords?: string[];
  isProcessing?: boolean;
  isError?: boolean;
  isUploading?: boolean;
}

export interface NoteType {
  id: number;
  number: number;
  text: string;
  photos: NotePhotoType[];
  videos: NoteVideoType[];
  date?: string;
  /** Files directory id */
  link?: string;
  expireDate?: string; 
}

export type NotesType = NoteType[];

export interface NoteApiFileType {
  url: string;
  name: string;
  type: NOTE_FILE_TYPE;
}

export interface NoteApiType {
  id: number;

  /** Note number */
  user_numeric: number;

  /** Note author id */
  owner: number;

  /** UTC date, ex. `2024-08-18T20:20:20` */
  updated_at: string;

  text: string;

  /** Array of file names */
  files: string[] | null;

  /** Files directory id */
  url?: string;
}

export type NotesApiType = NoteApiType[] | FormData;

export type NoteCreateDataType =
  | FormData
  | {
      user_id: string;
      text: string;
      files: File[];
      is_session?: string;
    };

export type NoteUpdateDataType =
  | FormData
  | {
      user_id: string;
      note_id: string;
      text: string;
      files: File[];
    };
