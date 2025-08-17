import type { ReactNode } from "react";
import { UserType } from "types/auth";
import { NotesType, NoteType } from "types/notes";
import { NotificationType } from "types/notifications";
import { STORE_ACTION_TYPE } from "./constants";

export interface StoreStateType {
  isInitialized: boolean;
  isAuthenticated: boolean;
  isAuthorized: boolean;
  user: UserType;
  notificationId: number;
  notifications: NotificationType[];
  noteId: number;
  notes: NotesType;
}

export interface StoreContextType extends StoreStateType {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  auth: (user: UserType) => void;
  logout: () => void;
  addNotification: (notification: Partial<NotificationType>) => void;
  removeNotification: (notificationId: number) => void;
  setNotes: (note: NotesType) => void;
  addNote: (note: NoteType) => void;
  updateNote: (note: Partial<NoteType>) => void;
  deleteNote: (noteId: number) => void;
}

export interface StoreProviderProps {
  children: ReactNode;
}

export type InitializeAction = {
  type: STORE_ACTION_TYPE.INITIALIZE;
  payload: {
    isAuthenticated: boolean;
    user: null;
  };
};

export type LoginAction = {
  type: STORE_ACTION_TYPE.LOGIN;
  payload: {
    user: null;
  };
};

export type LogoutAction = {
  type: STORE_ACTION_TYPE.LOGOUT;
};

export type RegisterAction = {
  type: STORE_ACTION_TYPE.REGISTER;
  payload: {
    user: null;
  };
};

export type AuthAction = {
  type: STORE_ACTION_TYPE.AUTH;
  payload: {
    user: UserType;
  };
};

export type AddNotificationAction = {
  type: STORE_ACTION_TYPE.ADD_NOTIFICATION;
  payload: {
    notification: Partial<NotificationType>;
  };
};

export type RemoveNotificationAction = {
  type: STORE_ACTION_TYPE.REMOVE_NOTIFICATION;
  payload: {
    notificationId: number;
  };
};

export type SetNotesAction = {
  type: STORE_ACTION_TYPE.NOTES_SET;
  payload: {
    notes: NotesType;
  };
};

export type AddNoteAction = {
  type: STORE_ACTION_TYPE.NOTES_ADD;
  payload: {
    note: NoteType;
  };
};

export type UpdateNoteAction = {
  type: STORE_ACTION_TYPE.NOTES_UPDATE;
  payload: {
    note: Partial<NoteType>;
  };
};

export type RemoveNoteAction = {
  type: STORE_ACTION_TYPE.NOTES_DELETE;
  payload: {
    noteId: number;
  };
};

export type StoreAction =
  | InitializeAction
  | LoginAction
  | LogoutAction
  | RegisterAction
  | AuthAction
  | AddNotificationAction
  | RemoveNotificationAction
  | SetNotesAction
  | AddNoteAction
  | UpdateNoteAction
  | RemoveNoteAction;
