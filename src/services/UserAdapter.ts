import axios, { AxiosError } from "axios"
import { api } from "src/boot/axios"
import { ApiToken, User, UserData, UserState } from "src/contracts/User"
import { FormError } from "src/services/errors"
import { InjectionKey, inject, provide } from "vue"
import { useRouter } from "vue-router"

const USER_KEY = Symbol("user-key") as InjectionKey<UserAdapter>

export class UserAdapter {
  protected readonly _router
  protected _user: User | null = null
  protected _token: string | null = null

  public getCurrentUser() {
    if (this._user == null) {
      this._handleNoUser()
    }
    return this._user!
  }

  public getToken() {
    return this._token
  }

  public async login(data: User) {
    let response

    try {
      response = await axios.post<ApiToken>("/api/auth/login", { nickname: data.nickname, password: data.password })
    } catch (err) {
      if (err instanceof AxiosError) {
        console.error(err)
        throw new FormError("Nickname or password incorrect")
      } else {
        throw err
      }
    }

    this._token = response.data.token
    this._saveToken()
    await this.initCurrentUser()
  }

  public async register(data: User) {
    let response

    try {
      response = await axios.post<ApiToken>("/api/auth/register", data)
    } catch (err) {
      if (err instanceof AxiosError) {
        console.error(err)
        const serverError = err.response?.data.errors[0]
        if (serverError?.rule == "unique") {
          throw new FormError("This " + serverError.field + " is already in use")
        } else {
          // Unexpected error
          throw new FormError("Cannot create account")
        }
      } else {
        throw err
      }
    }

    this._token = response.data.token
    this._saveToken()
    await this.initCurrentUser()
  }

  public logout() {
    this._user = null
    localStorage.removeItem("user-login")
    this._handleNoUser()
  }

  public async initCurrentUser() {
    api.userAdapter = this

    if (this._token != null) {
      try {
        const response = await api.get<UserData>("/api/auth/me")
        this._user = new User(response.data.user)
        // TODO: Add user channels to ChannelList
      } catch (err) {
        if (err instanceof AxiosError) {
          // Token is invalid
          this._token = null
          this._saveToken()
        } else {
          throw err
        }
      }
    }
  }

  protected _handleNoUser() {
    this._router.replace({ name: "Login", query: { redirect: this._router.currentRoute.value.fullPath } }).finally(() => {
      // When a user is requested but not given an error may be thrown by the requesting component.
      // This error will stop Vue rendering and prevent the login page from loading. Resetting
      // the whole Vue app by reloading solves this problem.
      location.reload()
    })
  }

  protected _saveToken() {
    if (this._token == null) {
      localStorage.removeItem("user-token")
    } else {
      localStorage.setItem("user-token", this._token)
    }
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

    const savedToken = localStorage.getItem("user-token")
    if (savedToken) {
      this._token = savedToken
    }
  }
}

export function useUserAdapter() {
  return inject(USER_KEY)!
}
