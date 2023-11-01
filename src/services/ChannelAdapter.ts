import { Channel } from "src/contracts/Channel"
import { Message } from "src/contracts/Message"
import { User } from "src/contracts/User"
import { CommandError } from "src/services/errors"
import { InjectionKey, Ref, inject, provide, reactive, toRef } from "vue"
import { UserAdapter } from "./UserAdapter"

const CHANNEL_ADAPTER_KEY = Symbol("channel-adapter-key") as InjectionKey<ChannelAdapter>

export class ChannelAdapter {
  public get selectedChannel() { return this._selectedChannel }
  // Explicit setter required for setting up websocket subscriptions later
  public setSelectedChannel(channel: Channel | null) {
    this._selectedChannel = channel
  }

  public sendMessage(content: string) {
    if (this._selectedChannel == null) return
    const currentUser = this._userAdapter.getCurrentUser()

    this._selectedChannel.messages.push(new Message({ id: Date.now(), content, user: currentUser }))
  }

  protected _selectedChannel: Channel | null = null

  constructor(
    protected readonly _userAdapter: UserAdapter
  ) {
    const self = reactive(this) as this
    provide(CHANNEL_ADAPTER_KEY, self)
    return self
  }

  public async removeUser(nickname: string) {
    if (this._selectedChannel == null) {
      return
    }
    // TODO: send a notification to removed user
    this._selectedChannel.users = this._selectedChannel.users.filter(u => u.nickname != nickname)
  }

  public loadMessages() {
    // TODO:
  }

  public isMember(nickname: string): boolean {
    if (nickname == null || this._selectedChannel == null) {
      return false
    }
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
      await this.removeUser(targetUser)
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
      await this.removeUser(targetUser)
    }
  }

  public async inviteMember(inviteInitiator: User, targetUser: string) {
    if (this._selectedChannel == null || targetUser == null) {
      return ""
    }
    // channel is private and user is not channel admin
    if (
      this._selectedChannel.type === "private" &&
      !this.isMemberAdmin(inviteInitiator.nickname)
    ) {
      throw new CommandError("You do not have a permission to invite other users to channel.")
    }

    // TODO: send user invite message
    if (this.isMember(targetUser)) {
      throw new CommandError(`"${targetUser}" is already a member of the current channel`)
    }

    if (this.isMemberBanned(targetUser) && !this.isMemberAdmin(inviteInitiator.nickname)) {
      throw new CommandError("Only admin is allowed to invite a banned user.")
    } else {
      // TODO: clear ban record - should be done on server side
      console.log("clearing restricted list for: ", targetUser)
      this._selectedChannel.restrictedList.set(targetUser, [])
    }
    // FIXME: only for testing purposes (fake user)
    const user = new User({ id: 1000, nickname: targetUser, state: "online" })
    this._selectedChannel.users.push(user)

    // TODO: API call
    return `Inviting ${targetUser} to current channel.`
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
