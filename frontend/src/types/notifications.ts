import { NOTIFICATION_TYPE } from "constants/notifications";

export interface NotificationType {
  id: number;
  text?: string;
  title?: string;
  type?: NOTIFICATION_TYPE;
}
