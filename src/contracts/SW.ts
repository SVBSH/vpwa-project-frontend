import { PushMessage } from "./Message"

export type ServiceWorkerMessage =
  | { kind: "confirm-notification", notification: PushMessage }
  | { kind: "notification-confirmed", notification: PushMessage }
