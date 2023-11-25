import axios, { AxiosError } from "axios"
import { api } from "src/boot/axios"
import { Channel } from "src/contracts/Channel"
import { ApiToken, User, UserData, UserState } from "src/contracts/User"
import { CommandError, FormError } from "src/services/errors"
import { InjectionKey, inject, provide } from "vue"
import { useRouter } from "vue-router"
import { ChannelListAdapter } from "./ChannelListAdapter"
import { SocketManager } from "./SocketManager"
import { Message } from "src/contracts/Message"

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

  public checkUserMention(message: Message) {
    return message.content.includes(`@${this._user!.nickname}`)
  }

  public isLoggedIn() {
    return this._user != null
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
    this._handleStateChange()
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
    this._handleStateChange()
    await this.initCurrentUser()
  }

  public logout() {
    this._user = null
    this._token = null
    this._handleStateChange()
    this._router.replace({ name: "Login", query: { redirect: this._router.currentRoute.value.fullPath } })
  }

  public async initCurrentUser() {
    api.userAdapter = this

    if (this._token != null) {
      try {
        const response = await api.get<UserData>("/api/auth/me")
        const channelList = new Map<number, Channel>([])

        const newUser = new User(response.data.user)
        if (this._user != null) {
          Object.assign(this._user, newUser)
        } else {
          this._user = newUser
        }

        response.data.channels.forEach((channel: Channel) => {
          channelList.set(channel.id, new Channel(channel))
        })

        this._channelListAdapter.channels = channelList

        // TODO: Add user channels to ChannelList
        this._handleStateChange()
      } catch (err) {
        if (err instanceof AxiosError && err.code != "ERR_NETWORK") {
          // Token is invalid
          this._token = null
          this._handleStateChange()
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
      console.log("Reloading: no user")
    })
  }

  protected _handleStateChange() {
    if (this._token == null) {
      localStorage.removeItem("user-token")
      this._socket.close()
    } else {
      localStorage.setItem("user-token", this._token)
      this._socket.open()

      if (Notification.permission != "denied" && Notification.permission != "granted") {
        Notification.requestPermission()
      }
    }
  }

  public async setUserState(state: UserState) {
    if (this._user == null) {
      throw new Error("User does not exist")
    }
    try {
      await api.post("/api/user/state", { state })
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new CommandError(error.response.data.message)
      }
      throw error
    }
  }

  constructor(
    protected readonly _socket: SocketManager,
    protected readonly _channelListAdapter: ChannelListAdapter
  ) {
    provide(USER_KEY, this)
    this._router = useRouter()

    const savedToken = localStorage.getItem("user-token")
    if (savedToken) {
      this._token = savedToken
    }

    this._socket.on("user_state", (event) => {
      if (event.user == this._user?.id) {
        this._user.state = event.state
      }
    })
  }
}

export function useUserAdapter() {
  return inject(USER_KEY)!
}
