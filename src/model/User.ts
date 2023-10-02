import { InjectionKey, inject, provide } from "vue"
import { useRouter } from "vue-router"
import { FormError } from "./FormError"

export class User {
  public name = ""
  public surname = ""
  public nickname = ""
  public password = ""

  constructor(opt?: Partial<User>) {
    if (opt) Object.assign(this, opt)
  }
}

const USER_KEY = Symbol() as InjectionKey<UserAdapter>

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
    this._router.replace({ name: "Login", query: { redirect: this._router.currentRoute.value.fullPath } })
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
