import React from "react";
import "./index.scss";
import cnService from "services/cn";
import { NotePhotoType } from "types/notes";

interface NotePhotoProps {
  photo: NotePhotoType;
  disabled?: boolean;
  onDeleteCallback?: () => void;
}

function NotePhoto(props: NotePhotoProps) {
  const { photo, disabled, onDeleteCallback } = props;
  const { name, src } = photo;
  const cn = cnService.createCn("note-photo");

  return (
    <div className={cn()}>
      <div className={cn("photo")}>
        <img src={src} alt={name} />
      </div>
      <div className={cn("name")}>{name}</div>
      <button
        className={cn("delete")}
        type="button"
        disabled={disabled}
        onClick={onDeleteCallback}
      >
        Удалить
      </button>
    </div>
  );
}

export default NotePhoto;
