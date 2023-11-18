import { reactive } from "vue"
import { ChannelMessage, Message } from "./Message"
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

export class ChannelData {
  public id = 0
  public name = ""
  public messages: ChannelMessage[] = []
  public users: User[] = []
  public admin = 0
  public type: ChannelType = "public"
  // public restrictedList = new Map<string, string[]>()
}
