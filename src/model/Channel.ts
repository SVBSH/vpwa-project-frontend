import { InjectionKey, Ref, inject, provide, reactive, toRef } from "vue"
import { User, UserAdapter } from "./User"

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
  public usersTyping = new Map<User, string>()

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
