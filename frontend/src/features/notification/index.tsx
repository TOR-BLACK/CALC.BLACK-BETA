import { CloseIcon } from "components/icons/close";
import { NOTIFICATION_DURATION } from "constants/notifications";
import { TRANSITION_DURATION } from "constants/styles";
import React, { useEffect, useState } from "react";
import "./index.scss";
import cnService from "services/cn";
import useStore from "store/hook";
import { NotificationType } from "types/notifications";

interface NotificationProps {
  notification: NotificationType;
}

function Notification(props: NotificationProps) {
  const { notification } = props;
  const { id, text, title, type = "" } = notification;
  const cn = cnService.createCn("notification");
  const { removeNotification } = useStore();
  const [isToRemove, setIsToRemove] = useState<boolean>(false);

  const remove = () => {
    setIsToRemove(true);
    setTimeout(() => {
      removeNotification(id);
    }, TRANSITION_DURATION.X2 + 50);
  };

  useEffect(() => {
    setTimeout(remove, NOTIFICATION_DURATION.DEFAULT);
  }, []);

  return (
    <div className={cn("", { [type]: type, remove: isToRemove })}>
      {title && <div className={cn("title")}>{title}</div>}
      {text && <div className={cn("text")}>{text}</div>}
      <button className={cn("close")} onClick={remove} type="button">
        <CloseIcon />
      </button>
    </div>
  );
}

export default Notification;
