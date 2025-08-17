import { ENV_FILEHOSTING_DOMAIN, ENV_FILEHOSTING_URL } from "constants/env";
import NoteVideoItem from "features/note-video-item";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import cnService from "services/cn";
import routerService from "services/router";
import { NoteType } from "types/notes";
import { CookieService } from "api/cookie";
import { DeleteIcon } from "components/icons/delete";
import { EditIcon } from "components/icons/edit";
import { TGIcon } from "components/icons/tg";

interface NoteProps {
  note: NoteType;
  onDeleteCallback?: () => void;
}

function Note(props: NoteProps) {
  const { note, onDeleteCallback } = props;
  const { id, number, text, date, videos, photos, link, expireDate } = note;
  
  const cn = cnService.createCn("note");
  const navigate = useNavigate();
  const isBigMedia = videos.length + photos.length === 1;
  const preparedLink = `${ENV_FILEHOSTING_DOMAIN}/note/${link}`;
  const preparedLinkURL = `${ENV_FILEHOSTING_URL}/note/${link}`;

  return (
    <div className={cn()}>
      <div className={cn("title")}>Заметка {CookieService.getCookie('session-active')? '' : <><br/>#{number}</>} от {date}</div>
      {CookieService.getCookie('session-active') === 'true' ? <div className={cn("title")}>Будет удалена: {expireDate}</div> : "" }
      <div className={cn("media")}>
        {photos.map((photo) => {
          return (
            <div
              key={photo.id}
              className={cn("media-item")}
            >
              <img className={cn("photo")} src={photo.src} alt={photo.name} />
            </div>
          );
        })}
        {videos.map((video, index) => {
          return <NoteVideoItem key={video.id} video={video} />;
        })}
      </div>
      {link && (
        <div className={cn("link-block")}>
          Ссылка:{" "}
          <a
            target="_blank"
            href={preparedLinkURL}
            className={cn("link")}
            onClick={async function (event) {
              event.preventDefault();
              window.open(
                `${ENV_FILEHOSTING_URL}/cookie.php?cookie=note_${link}&value=true&url=${link}`,
                "_blank",
              );
            }}
          >
            {preparedLink}
          </a>
        </div>
      )}
      {text && <div className={cn("text")}>{text}</div>}
      <div className={cn("footer")}>
        <div style={{cursor: 'pointer', width: '30px'}}>
          <TGIcon/>
        </div>
        <div style={{cursor: 'pointer', width: '30px'}} onClick={() => navigate(routerService.note(id))}>
          <EditIcon/>
        </div>
        <div style={{cursor: 'pointer', width: '30px'}} onClick={onDeleteCallback}>
          <DeleteIcon/>
        </div>
      </div>
    </div>
  );
}

export default Note;
