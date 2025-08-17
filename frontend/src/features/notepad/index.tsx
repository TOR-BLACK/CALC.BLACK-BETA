import { FilesApiService } from "api/files";
import { NoteApiService } from "api/notes";
import { LoadingIcon } from "components/icons/loading";
import Popup from "components/popup";
import { NOTIFICATION_TYPE } from "constants/notifications";
import { ROUTE } from "constants/router";
import Note from "features/note";
import notesHelper from "helpers/notes";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import cnService from "services/cn";
import routerService from "services/router";
import useStore from "store/hook";
import "./index.scss";
import { NoteType } from "types/notes";

function Notepad() {
  const cn = cnService.createCn("notepad");
  const navigate = useNavigate();
  const store = useStore();
  const { notes, user, addNotification } = store;
  const [noteToDelete, setNoteToDelete] = useState<NoteType | null>();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const getNotes = async () => {
    try {
      const response = await NoteApiService.getAll(user.id);

      store.setNotes(notesHelper.listFromApi(response.data).reverse());
    } catch (e: any) {
      console.log(e);
      addNotification({
        text: "Не удалось загрузить заметки",
      });
    }
  };

  const deleteNote = async (
    noteId: number,
    number: number,
    directoryId: string,
  ) => {
    setIsDeleting(true);
    try {
      await NoteApiService.delete(user.id, noteId);

      if (directoryId) {
        await FilesApiService.deleteDirectory(directoryId);
      }

      store.deleteNote(noteId);
      addNotification({
        title: `Заметка ${number}`,
        text: "Заметка успешно удалена",
        type: NOTIFICATION_TYPE.SUCCESS,
      });
      setIsDeleting(false);
      setNoteToDelete(null);
    } catch (e: any) {
      setIsDeleting(false);
      addNotification({
        title: `Заметка ${number}`,
        text: "Не удалось удалить заметку",
      });
    }
  };

  useEffect(() => {
    getNotes();
  }, []);

  return (
    <div className={cn()}>
      <div className={cn("title")}>Ваши заметки</div>
      <button
        className={cn("add")}
        type="button"
        onClick={() => navigate(routerService.path(ROUTE.NEW_NOTE))}
      >
        {/* <span className={cn("add-plus")}>+</span> */}
        <span className={cn("add-label")}>Создать новую заметку</span>
      </button>

      <div className={cn("list")}>
        {notes.map((note, index) => (
          <Note
            key={index}
            note={note}
            onDeleteCallback={() => setNoteToDelete(note)}
          />
        ))}
      </div>
      <Popup isVisible={!!noteToDelete}>
        <div className={cn("delete-title")}>
          Вы действительно хотите удалить заметку №{noteToDelete?.number}?
        </div>
        {isDeleting && <LoadingIcon className={cn("delete-loader")} />}
        <div className={cn("delete-footer")}>
          <button
            type="button"
            className={cn("delete-button")}
            disabled={isDeleting}
            onClick={() => {
              setNoteToDelete(null);
            }}
          >
            Отмена
          </button>
          <button
            type="button"
            className={cn("delete-button")}
            disabled={isDeleting}
            onClick={() => {
              deleteNote(
                noteToDelete?.id as number,
                noteToDelete?.number as number,
                noteToDelete?.link as string,
              );
            }}
          >
            Удалить
          </button>
        </div>
      </Popup>
    </div>
  );
}

export default Notepad;
