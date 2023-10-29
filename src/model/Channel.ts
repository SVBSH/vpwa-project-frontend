import { InjectionKey, inject, provide, reactive, toRef } from "vue"
import { User, UserAdapter } from "./User"


export type ChannelType = "public" | "private"
export type RestrictedList = Map<string, string[]>

export class Message {
  public id = 0
  public user: User = null!
  public content = ""

  constructor(opt?: Partial<Message>) {
    if (opt) Object.assign(this, opt)
  }
}

export class Channel {
  public id = 0
  public name = ""
  public messages: Message[] = []
  public users: User[] = []
  public admin: User = null!
  public type: ChannelType = "public"
  public restrictedList: RestrictedList = new Map<string, string[]>()

  constructor(opt?: Partial<Channel>) {
    if (opt) Object.assign(this, opt)
    return reactive(this)
  }
}

const CHANNEL_ADAPTER_KEY = Symbol() as InjectionKey<ChannelAdapter>

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
    console.log(`User "${nickname}" will be removed from "${this._selectedChannel.name}"`);
    this._selectedChannel.users = this._selectedChannel.users.filter(u => u.nickname != nickname)
  }

   // TODO:
  public loadMessages() {
    return
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
    if (this._selectedChannel.type === 'private') {
      console.log('This command can be invoked only in public channel.');
      return
    }

    // Ban initiator is not a valid member of the current channel
    if (!this.isMember(banInitiator.nickname)) {
      console.log(`You are are not a member of the channel "${this._selectedChannel.name}"`);
      // TODO: throw error
      return
    }

    // user is not a member of the current channel
    if (!this.isMember(targetUser)) {
      console.log(`"${targetUser}" is not a valid member of the current channel`);
      // TODO: throw error
      return
    }

    // user is not allowed to ban himself
    if (banInitiator.nickname === targetUser) {
      console.log(`You are not allowed to ban yourself`);
      return
    }

    // if ban initiator is an admin - remove user from channel
    if (banInitiator.id == this._selectedChannel.admin.id) {
      restrictedList.set(
        targetUser,
        [banInitiator.nickname, banInitiator.nickname, banInitiator.nickname])
      await this.removeUser(targetUser)
      return
    }

    // Target user has not been banned yet
    if (restrictedList.get(targetUser) == null) {
      restrictedList.set(targetUser, [banInitiator.nickname])
    // Ban initiator is not on the user's restricted list
    } else if (!restrictedList.get(targetUser)?.includes(banInitiator.nickname)) {
      restrictedList.get(targetUser)?.push(banInitiator.nickname)
    } else {
      console.log(`You had already banned "${targetUser}"`);
      return
    }

    // remove target user from channel if he reached the maximum amount of ban records
    if (this.isMemberBanned(targetUser)) {
      await this.removeUser(targetUser)
    }
  }

  public async inviteMember(inviteInitiator: User, targetUser: string) {
    if (this._selectedChannel == null || targetUser == null) {
      return
    }
    // channel is private and user is not channel admin
    if (
      this._selectedChannel.type === "private" &&
      !this.isMemberAdmin(inviteInitiator.nickname)
    ) {
      console.log(`You do not have a permission to invite other users to channel.`)
      return;
    }

    // TODO: send user invite message
    if (this.isMember(targetUser)) {
      console.log(`"${targetUser}" is already a member of the current channel`)
      return;
    }

    if (this.isMemberBanned(targetUser) && !this.isMemberAdmin(inviteInitiator.nickname)) {
        console.log(`Only admin is allowed to invite a banned user.`)
        return
    } else {
      // TODO: clear ban record - should be done on server side
      console.log('clearing restricted list for: ', targetUser);
      this._selectedChannel.restrictedList.set(targetUser, [])
    }
    // TODO: API call
    console.log(`Inviting ${targetUser} to current channel.`)
  }

  public async clearRestrictedRecord(nickname: string, banInitiator: User) {
  }
}

export function useChannelAdapter() {
  return inject(CHANNEL_ADAPTER_KEY)!
}

export function useChannel() {
  const channelAdapter = useChannelAdapter()
  return toRef(channelAdapter, "selectedChannel")
}
