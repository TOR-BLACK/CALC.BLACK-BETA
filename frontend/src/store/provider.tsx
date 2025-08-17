import { LOCAL_STORAGE_KEY } from "constants/localStorage";
import { NOTIFICATION_TYPE } from "constants/notifications";
import type { FC } from "react";
import { createContext, useEffect, useReducer } from "react";
import { localStorageService } from "services/localStorage";
import { UserType } from "types/auth";
import { NotesType, NoteType } from "types/notes";
import { NotificationType } from "types/notifications";
import { STORE_ACTION_TYPE } from "./constants";
import {
  AddNoteAction,
  AddNotificationAction,
  AuthAction,
  InitializeAction,
  LoginAction,
  RegisterAction,
  RemoveNoteAction,
  RemoveNotificationAction,
  SetNotesAction,
  StoreAction,
  StoreContextType,
  StoreProviderProps,
  StoreStateType as StateType,
  UpdateNoteAction,
} from "./types";

const initialState: StoreContextType = {
  isAuthenticated: false,
  isInitialized: false,
  isAuthorized: false,
  user: {
    id: "",
    login: "",
  },
  notificationId: 1,
  notifications: [],
  noteId: 1,
  notes: [],
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
  auth: () => {},
  addNotification: () => {},
  removeNotification: () => {},
  setNotes: () => {},
  addNote: () => {},
  updateNote: () => {},
  deleteNote: () => {},
};

const handlers: Record<
  string,
  (state: StateType, action: StoreAction) => StateType
> = {
  [STORE_ACTION_TYPE.INITIALIZE]: (
    state: StateType,
    action: InitializeAction | any,
  ): StateType => {
    const { isAuthenticated, user } = action.payload;

    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
    };
  },
  [STORE_ACTION_TYPE.LOGIN]: (
    state: StateType,
    action: LoginAction | any,
  ): StateType => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  [STORE_ACTION_TYPE.REGISTER]: (
    state: StateType,
    action: RegisterAction | any,
  ): StateType => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },

  [STORE_ACTION_TYPE.AUTH]: (
    state: StateType,
    action: AuthAction | any,
  ): StateType => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthorized: true,
      user,
    };
  },
  [STORE_ACTION_TYPE.LOGOUT]: (state: StateType): StateType => ({
    ...state,
    isAuthorized: false,
    user: initialState.user,
  }),

  [STORE_ACTION_TYPE.ADD_NOTIFICATION]: (
    state: StateType,
    action: AddNotificationAction | any,
  ): StateType => {
    const notification = {
      id: state.notificationId,
      type: NOTIFICATION_TYPE.ERROR,
      ...action.payload.notification,
    };

    return {
      ...state,
      notificationId: state.notificationId + 1,
      notifications: [...state.notifications, notification],
    };
  },
  [STORE_ACTION_TYPE.REMOVE_NOTIFICATION]: (
    state: StateType,
    action: RemoveNotificationAction | any,
  ): StateType => {
    const { notificationId } = action.payload;
    const notifications = state.notifications.filter(
      ({ id }) => id !== notificationId,
    );

    return {
      ...state,
      notifications,
    };
  },

  [STORE_ACTION_TYPE.NOTES_SET]: (
    state: StateType,
    action: SetNotesAction | any,
  ): StateType => {
    const { notes } = action.payload;

    return {
      ...state,
      notes,
    };
  },
  [STORE_ACTION_TYPE.NOTES_ADD]: (
    state: StateType,
    action: AddNoteAction | any,
  ): StateType => {
    const { note } = action.payload;

    return {
      ...state,
      notes: [...state.notes, note],
    };
  },
  [STORE_ACTION_TYPE.NOTES_UPDATE]: (
    state: StateType,
    action: UpdateNoteAction | any,
  ): StateType => {
    const { note } = action.payload;
    const newNotes = [...state.notes];
    const noteIndex = newNotes.findIndex((item) => item.id === note.id);
    newNotes[noteIndex] = {
      ...newNotes[noteIndex],
      ...note,
    };

    return {
      ...state,
      notes: newNotes,
    };
  },
  [STORE_ACTION_TYPE.NOTES_DELETE]: (
    state: StateType,
    action: RemoveNoteAction | any,
  ): StateType => {
    const { noteId } = action.payload;
    const newNotes = [...state.notes].filter(({ id }) => id !== noteId);

    return {
      ...state,
      notes: newNotes,
    };
  },
};

const reducer = (state: StateType, action: StoreAction): StateType =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

const StoreContext = createContext<StoreContextType>({
  ...initialState,
});

export const StoreProvider: FC<StoreProviderProps> = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // TODO check is token fresh
    const userId = localStorageService.getItem(LOCAL_STORAGE_KEY.USER_ID);

    if (userId) {
      auth({
        id: userId,
        login: "",
      });
    }
    // const initialize = async (): Promise<void> => {
    //   try {
    //     const accessToken = window.localStorage.getItem("accessToken");
    //
    //     if (accessToken) {
    //       const user: null = await new Promise((resolve) => resolve(null));
    //
    //       dispatch({
    //         type: STORE_ACTION_TYPE.INITIALIZE,
    //         payload: {
    //           isAuthenticated: true,
    //           user,
    //         },
    //       });
    //     } else {
    //       dispatch({
    //         type: STORE_ACTION_TYPE.INITIALIZE,
    //         payload: {
    //           isAuthenticated: false,
    //           user: null,
    //         },
    //       });
    //     }
    //   } catch (err) {
    //     console.error(err);
    //     dispatch({
    //       type: STORE_ACTION_TYPE.INITIALIZE,
    //       payload: {
    //         isAuthenticated: false,
    //         user: null,
    //       },
    //     });
    //   }
    // };
    //
    // initialize();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const accessToken: string = await new Promise((resolve) => resolve(""));
    const user: null = await new Promise((resolve) => resolve(null));

    localStorage.setItem("accessToken", accessToken);

    dispatch({
      type: STORE_ACTION_TYPE.LOGIN,
      payload: {
        user,
      },
    });
  };

  const register = async (
    email: string,
    name: string,
    password: string,
  ): Promise<void> => {
    const accessToken: string = await new Promise((resolve) => resolve(""));
    const user: null = await new Promise((resolve) => resolve(null));

    localStorage.setItem("accessToken", accessToken);

    dispatch({
      type: STORE_ACTION_TYPE.REGISTER,
      payload: {
        user,
      },
    });
  };

  const auth = (user: UserType) => {
    localStorageService.setItem(LOCAL_STORAGE_KEY.USER_ID, user.id);
    dispatch({ type: STORE_ACTION_TYPE.AUTH, payload: { user } });
  };

  const logout = async (): Promise<void> => {
    localStorageService.removeItem(LOCAL_STORAGE_KEY.USER_ID);
    dispatch({ type: STORE_ACTION_TYPE.LOGOUT });
  };

  const addNotification = (notification: Partial<NotificationType>) => {
    dispatch({
      type: STORE_ACTION_TYPE.ADD_NOTIFICATION,
      payload: { notification },
    });
  };

  const removeNotification = (notificationId: number) => {
    dispatch({
      type: STORE_ACTION_TYPE.REMOVE_NOTIFICATION,
      payload: { notificationId },
    });
  };

  const setNotes = (notes: NotesType) => {
    dispatch({ type: STORE_ACTION_TYPE.NOTES_SET, payload: { notes } });
  };

  const addNote = (note: NoteType) => {
    dispatch({ type: STORE_ACTION_TYPE.NOTES_ADD, payload: { note } });
  };

  const updateNote = (note: Partial<NoteType>) => {
    dispatch({ type: STORE_ACTION_TYPE.NOTES_UPDATE, payload: { note } });
  };

  const deleteNote = (noteId: number) => {
    dispatch({ type: STORE_ACTION_TYPE.NOTES_DELETE, payload: { noteId } });
  };

  return (
    <StoreContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
        auth,
        addNotification,
        removeNotification,
        setNotes,
        addNote,
        updateNote,
        deleteNote,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContext;
