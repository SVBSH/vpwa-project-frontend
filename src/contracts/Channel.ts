import { reactive } from "vue"
import { Message } from "./Message"
import { User } from "./User"

export type ChannelType = "public" | "private"
export interface UserTypingInfo {
  text: string
  lastUpdate: number
}

export class Channel {
  public id = 0
  public name = ""
  public messages: Message[] = []
  public users: User[] = []
  public usersTyping = new Map<User, UserTypingInfo>()
  public admin: User = null!
  public get adminID() { return typeof this.admin == "string" ? this.admin : this.admin.id }
  public type: ChannelType = "public"
  public restrictedList = new Map<string, string[]>()

  constructor(opt?: Partial<Channel>) {
    if (opt) Object.assign(this, opt)
    return reactive(this)
  }
}

export interface UserAddMessage {
  channel: number
  user: User
}

export interface UserRemoveMessage {
  channel: number
  user: number
}
