import { Emitter } from "@socket.io/component-emitter"
import { Socket, io } from "socket.io-client"
import { api } from "src/boot/axios"
import { Channel } from "src/contracts/Channel"
import { ChannelMessage, RawMessage } from "src/contracts/Message"
import { UserState } from "src/contracts/User"

interface SocketManagerEvents {
  "channel_message": (event: ChannelMessage) => void
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

    const self = window as unknown as { socketManager: SocketManager | null }
    if (self.socketManager != null) {
      self.socketManager.close()
      self.socketManager = null
    }
    self.socketManager = this
  }
}
