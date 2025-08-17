import Notification from "features/notification";
import React from "react";
import "./index.scss";
import cnService from "services/cn";
import useStore from "store/hook";

interface NotificationsProps {}

function Notifications(props: NotificationsProps) {
  const cn = cnService.createCn("notifications");
  const { notifications } = useStore();

  return (
    <div className={cn("wrapper")}>
      <div className={cn()}>
        <div className={cn("list")}>
          {notifications.map((notification) => {
            return (
              <Notification key={notification.id} notification={notification} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Notifications;
