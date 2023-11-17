import { User } from "./User"

export class Message {
  public id = 0
  public user: User = null!
  public content = ""

  constructor(opt?: Partial<Message>) {
    if (opt) Object.assign(this, opt)
  }
}

export interface RawMessage {
  channel: number
  text: string
}

export interface ChannelMessage extends RawMessage {
  channel: number
  text: string
  author: number
}
