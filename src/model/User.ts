import { InjectionKey, inject, provide, reactive } from "vue"
import { useRouter } from "vue-router"
import { FormError } from "./FormError"

export type UserState = typeof USER_STATE[number]
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

const USER_KEY = Symbol("user-key") as InjectionKey<UserAdapter>

export class UserAdapter {
  protected readonly _router
  protected _user: User | null = null

  public getCurrentUser() {
    if (this._user == null) {
      this._handleNoUser()
    }
    return this._user!
  }

  public async login(data: User) {
    throw new FormError("User not found")
  }

  public async register(data: User) {
    /* throw new FormError("Nickname already taken") */

    this._user = data
    localStorage.setItem("user-login", JSON.stringify(this._user))
  }

  public logout() {
    this._user = null
    localStorage.removeItem("user-login")
    this._handleNoUser()
  }

  protected _handleNoUser() {
    this._router.replace({ name: "Login", query: { redirect: this._router.currentRoute.value.fullPath } }).finally(() => {
      // When a user is requested but not given an error may be thrown by the requesting component.
      // This error will stop Vue rendering and prevent the login page from loading. Resetting
      // the whole Vue app by reloading solves this problem.
      location.reload()
    })
  }

  public setUserState(state: UserState) {
    if (this._user == null) {
      throw new Error("User does not exist")
    }
    this._user.state = state
  }

  constructor() {
    provide(USER_KEY, this)
    this._router = useRouter()

    const savedUser = localStorage.getItem("user-login")
    if (savedUser) {
      this._user = new User(JSON.parse(savedUser))
    }
  }
}

export function useUserAdapter() {
  return inject(USER_KEY)!
}
