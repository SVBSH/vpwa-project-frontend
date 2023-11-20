import { NamedColor } from "quasar"
import { reactive } from "vue"
import { Channel } from "./Channel"

export type UserState = (typeof USER_STATE)[number]
export const USER_STATE = ["online", "offline", "dnd"] as const
export const USER_STATE_META: Record<UserState, { color: NamedColor, label: string }> = {
  online: { color: "green", label: "Online" },
  dnd: { color: "orange", label: "DND" },
  offline: { color: "red", label: "Offline" }
}

export class User {
  public id = 0
  public name = ""
  public surname = ""
  public nickname = ""
  public password = ""
  public email = ""
  public state: UserState = "online"

  constructor(opt?: Partial<User>) {
    if (opt) Object.assign(this, opt)
    return reactive(this)
  }
}

export interface ApiToken {
  type: "bearer"
  token: string
  expires_at?: string
  expires_in?: number
}

export interface UserData {
  user: User,
  channels: Channel[]
}

export interface UserStateMessage {
  user: number
  state: UserState
}
