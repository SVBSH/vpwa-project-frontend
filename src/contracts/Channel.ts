import { reactive } from "vue"
import { Message } from "./Message"
import { User } from "./User"

export type ChannelType = "public" | "private"

export class Channel {
  public id = 0
  public name = ""
  public messages: Message[] = []
  public users: User[] = []
  public usersTyping = new Map<User, string>()
  public admin: User = null!
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
