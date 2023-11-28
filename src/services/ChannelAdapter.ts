import axios from "axios"
import { api } from "src/boot/axios"
import { Channel } from "src/contracts/Channel"
import { User } from "src/contracts/User"
import { CommandError } from "src/services/errors"
import { InjectionKey, Ref, inject, provide, reactive, toRef } from "vue"
import { SocketManager } from "./SocketManager"

const CHANNEL_ADAPTER_KEY = Symbol("channel-adapter-key") as InjectionKey<ChannelAdapter>

export class ChannelAdapter {
  public get selectedChannel() { return this._selectedChannel }

  public setSelectedChannel(channel: Channel | null) {
    this._selectedChannel = channel
  }

  public sendMessage(content: string) {
    if (this._selectedChannel == null) return
    this._socket.sendMessage(this._selectedChannel, content)
  }

  public updateTyping(content: string) {
    if (this._selectedChannel == null) return
    this._socket.updateTyping(this._selectedChannel, content)
  }

  protected _selectedChannel: Channel | null = null

  constructor(
    protected _socket: SocketManager
  ) {
    const self = reactive(this) as this
    provide(CHANNEL_ADAPTER_KEY, self)

    this._socket.on("channel_remove", event => {
      if (self._selectedChannel?.id == event) {
        self.setSelectedChannel(null)
      }
    })

    return self
  }

  public async removeUser(channelId: number) {
    try {
      const response = await api.delete(`/api/channel/${channelId}/cancel`)
      return response.data.message
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new CommandError(error.response.data.message)
      }
      throw error
    }
  }

  public loadMessages() {
    // TODO:
  }

  public isMember(nickname: string): boolean {
    if (nickname == null || this._selectedChannel == null) {
      return false
    }
    // const response = await api.post("/api/channel/1/invite", {userNickname: nickname})
    for (const member of this._selectedChannel.users) {
      if (member.nickname == nickname) {
        return true
      }
    }
    return false
  }

  public isMemberBanned(nickname: string): boolean {
    if (nickname == null || this._selectedChannel == null) {
      return false
    }
    return this._selectedChannel.restrictedList.get(nickname)?.length == 3
  }

  public isMemberAdmin(nickname: string): boolean {
    if (this._selectedChannel == null) {
      return false
    }
    return this._selectedChannel.admin.nickname === nickname
  }

  public async banMember(banInitiator: User, targetUser: string) {
    if (this._selectedChannel == null || targetUser == null) {
      return
    }
    const restrictedList = this._selectedChannel.restrictedList

    // non admin user can not ban other users
    if (this._selectedChannel.type === "private") {
      throw new CommandError("This command can be invoked only in public channel.")
    }

    // Ban initiator is not a valid member of the current channel
    if (!this.isMember(banInitiator.nickname)) {
      throw new CommandError(`You are are not a member of the channel "${this._selectedChannel.name}"`)
    }

    // user is not a member of the current channel
    if (!this.isMember(targetUser)) {
      throw new CommandError(`"${targetUser}" is not a valid member of the current channel`)
    }

    // user is not allowed to ban himself
    if (banInitiator.nickname === targetUser) {
      throw new CommandError("You are not allowed to ban yourself")
    }

    // if ban initiator is an admin - remove user from channel
    if (banInitiator.id == this._selectedChannel.admin.id) {
      restrictedList.set(
        targetUser,
        [banInitiator.nickname, banInitiator.nickname, banInitiator.nickname])
      // FIXME:
      // await this.removeUser(targetUser)
    }

    // Target user has not been banned yet
    if (restrictedList.get(targetUser) == null) {
      restrictedList.set(targetUser, [banInitiator.nickname])
      // Ban initiator is not on the user's restricted list
    } else if (!restrictedList.get(targetUser)?.includes(banInitiator.nickname)) {
      restrictedList.get(targetUser)?.push(banInitiator.nickname)
    } else {
      throw new CommandError(`You had already banned "${targetUser}"`)
    }

    // remove target user from channel if he reached the maximum amount of ban records
    if (this.isMemberBanned(targetUser)) {
      // FIXME:
      // await this.removeUser(targetUser)
    }
  }

  public async inviteMember(inviteInitiator: User, targetUser: string) {
    if (this._selectedChannel == null || targetUser == null) {
      return ""
    }
    try {
      const response = await api.post("/api/channel/invite", {
        channelId: this._selectedChannel.id,
        userNickname: targetUser
      })
      return response.data.message
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new CommandError(error.response.data.message)
      }
      throw error
    }
  }

  public async revoke(tUser: string) {
    try {
      const response = await api.post(
        "/api/channel/revoke", { targetUser: tUser, channelId: this._selectedChannel?.id })
      return response.data.message
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new CommandError(error.response.data.message)
      }
      throw error
    }
  }

  public async kick(tUser: string) {
    try {
      const response = await api.post(
        "/api/channel/kick", { targetUser: tUser, channelId: this._selectedChannel?.id })
      return response.data.message
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new CommandError(error.response.data.message)
      }
      throw error
    }
  }
}

export function useChannelAdapter() {
  return inject(CHANNEL_ADAPTER_KEY)!
}

export function useChannel(): Ref<Channel | null>
export function useChannel(opt: { required: true }): Ref<Channel>
export function useChannel({ required = false } = {}) {
  const channelAdapter = useChannelAdapter()

  if (required) {
    if (channelAdapter.selectedChannel == null) throw new Error("Executed useChannel with required flag, but no channel is selected")
  }

  return toRef(channelAdapter, "selectedChannel")
}
