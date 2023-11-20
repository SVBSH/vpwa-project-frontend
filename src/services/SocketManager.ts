import { Emitter } from "@socket.io/component-emitter"
import { Socket, io } from "socket.io-client"
import { api } from "src/boot/axios"
import { Channel, UserAddMessage, UserRemoveMessage } from "src/contracts/Channel"
import { ChannelMessage, RawMessage } from "src/contracts/Message"
import { User, UserState } from "src/contracts/User"
import { markRaw } from "vue"

interface SocketManagerEvents {
  "channel_message": (event: ChannelMessage) => void
  "channel_add": (event: Channel) => void
  "channel_remove": (event: number) => void
  "user_add": (event: UserAddMessage) => void
  "user_remove": (event: UserRemoveMessage) => void
}

export class SocketManager extends Emitter<SocketManagerEvents, SocketManagerEvents, Record<never, never>> {
  protected _socket: Socket | null = null

  public open() {
    const token = api.userAdapter.getToken()
    if (token == null) throw new Error("Cannot call SocketManager.open when no user token")

    if (this._socket != null) {
      this.close()
    }

    this._socket = io({
      path: "/api/socket.io",
      auth: { token }
    })

    this._socket.on("debug", data => console.log("[Server]", data))
    this._socket.on("channel_message", event => {
      console.log(event)
      this.emit("channel_message", event as ChannelMessage)
    })

    this._socket.on("channel_add", event => {
      console.log(event)
      this.emit("channel_add", new Channel(event))
    })

    this._socket.on("channel_remove", event => {
      console.log(event)
      this.emit("channel_remove", event as number)
    })

    this._socket.on("user_add", event => {
      console.log(event)
      this.emit("user_add", { channel: event.channel, user: new User(event.user) })
    })

    this._socket.on("user_remove", event => {
      console.log(event)
      this.emit("user_remove", event as UserRemoveMessage)
    })
  }

  public close() {
    if (this._socket == null) return
    this._socket.disconnect()
    this._socket = null
  }

  public sendMessage(channel: Channel, text: string) {
    if (this._socket == null) throw new Error("Tried to execute SocketManager.sendMessage, but no socket is open")
    this._socket.emit("channel_message", { channel: channel.id, text } as RawMessage)
  }

  public updateStatus(status: UserState) {
    if (this._socket == null) throw new Error("Tried to execute SocketManage.updateStatus, but no socket is open")
    // TODO
  }

  constructor() {
    super()
    markRaw(this)

    const self = window as unknown as { socketManager: SocketManager | null }
    if (self.socketManager != null) {
      self.socketManager.close()
      self.socketManager = null
    }
    self.socketManager = this
  }
}
