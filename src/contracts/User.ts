import { reactive } from "vue"

export type UserState = (typeof USER_STATE)[number]
export const USER_STATE = ["online", "offline", "dnd"] as const

export class User {
  public id = 0
  public name = ""
  public surname = ""
  public nickname = ""
  public password = ""
  public state: UserState = "online"

  constructor(opt?: Partial<User>) {
    if (opt) Object.assign(this, opt)
    return reactive(this)
  }
}
