import { InjectionKey, Ref, inject, onUnmounted, provide, reactive, ref, watch } from "vue"
import { Channel, ChannelType, Message, useChannelAdapter } from "./Channel"
import { CommandError } from "./CommandError"
import { User } from "./User"
const CHANNEL_LIST_KEY = Symbol("channel-list-key") as InjectionKey<ChannelListAdapter>

// FIXME: will be replaced with an API call
let channelId = 2

export class ChannelListAdapter {
  public channels = new Map<number, Channel>([])

  /**
   * The list of channels is populated with all channels, however they should
   * only contain the data from the Channel database entity, this method
   * fetches the user list and a list of messages.
   * */
  public async getChannel(id: number) {
    return this.channels.get(id)
  }

  public async addChannel(channelName: string, channelType: ChannelType, user: User) {
    if (channelName == null || channelName.length == 0) {
      return
    }
    // if channel already exist
    if (this.getChannelByName(channelName) != null) {
      throw new CommandError("This channel already exist")
    }

    channelId++

    const newChannel = new Channel({
      id: channelId,
      name: channelName,
      type: channelType,
      admin: user,
      users: [user],
      messages: []
    })
    this.channels.set(channelId, newChannel)
    return newChannel
  }

  public async joinChannel(channelName: string, channelType: ChannelType, user: User) {
    //   const requestedChannel = this.getChannelByName(channelName);
    //   const channelAdapter = useChannelAdapter()
    //    // Create a new channel
    //   if (requestedChannel == null) {
    //     // TODO: try to create a channel
    //     const newChannel = await this.addChannel(
    //       channelName,
    //       channelType,
    //       user
    //     );
    //     if (newChannel == undefined) {
    //       return '';
    //     }
    //     return `Creating channel <strong>${channelName}</strong>`
    //   } else if (requestedChannel.type != "public") {
    //     throw new CommandError(`You could not join to requested channel because <strong>${channelName}</strong> is not a public channel.`)
    //   } else if (channelAdapter.isMember(user.nickname)) {
    //     throw new CommandError(`You are <strong>${user.nickname}</strong> already a member of channel <strong>${requestedChannel.name}</strong>.`)
    //   } else if (channelAdapter.isMemberBanned(user.nickname)) {
    //     throw new CommandError(`<strong>${user.nickname}</strong> is banned from channel <strong>${requestedChannel.name}</strong>.`)
    //   } else {
    //     // Add user to channel
    //     requestedChannel.users.push(user)
    //     return `Adding user <strong>${user.nickname}</strong> to channel <strong>${channelName}</strong>`
    //   }
  }

  public async quitChannel(channelId: number, user: User) {
    const channel = await this.getChannel(channelId)
    if (channel == undefined) {
      return
    }
    if (user.id === channel.admin.id) {
      this.channels.delete(channelId)
    } else {
      throw new CommandError("You do not have a permission to remove channel")
    }
  }

  public async cancelMembership() {
    console.log("cancelMembership")
  }

  public getChannelByName(name: string): Channel | null {
    for (const [_, channel] of this.channels) {
      if (channel.name == name) {
        return channel
      }
    }
    return null
  }

  constructor() {
    const self = reactive(this)
    provide(CHANNEL_LIST_KEY, self)

    // Default mock data
    const user1 = new User({ id: 1, nickname: "foo", state: "dnd" })
    const user2 = new User({ id: 2, nickname: "bar", state: "offline" })
    const user3 = new User({ id: 3, nickname: "baz", state: "online" })
    const user4 = new User({ id: 4, nickname: "buz", state: "dnd" })
    const user5 = new User({ id: 5, nickname: "asd", state: "online" })
    const user6 = new User({ id: 6, nickname: "123", state: "online" })
    const user7 = new User({ id: 7, nickname: "kakak", state: "online" })
    const user8 = new User({ id: 8, nickname: "wasas", state: "online" })
    const user9 = new User({ id: 9, nickname: "rtrtr", state: "online" })

    this.channels.set(0, new Channel({
      id: 0,
      name: "Channel 1",
      type: "public",
      admin: user1,
      users: [user1, user2, user3, user4, user5, user6, user7, user8, user9],
      restrictedList: new Map([
        ["bar", ["asd", "baz"]],
        ["456", ["asd", "baz", "wasas"]]
      ]),
      messages: [
        new Message({ user: user1, content: "Lorem ipsum dolor sit amet" }),
        new Message({ user: user2, content: "consectetur adipisicing elit" }),
        new Message({ user: user3, content: "Beatae, ea at cupiditate quisquam voluptatem modi" }),
        new Message({ user: user1, content: "neque voluptates omnis est ipsam" })
      ]
    }))
    this.channels.set(1, new Channel({
      id: 1,
      name: "Channel 2",
      type: "private",
      admin: user2,
      users: [user1],
      messages: [
        new Message({ user: user1, content: "Lorem ipsum dolor sit amet" })
      ]
    }))
    // Mock for user typing
    setInterval(() => {
      const typing = this.channels.get(0)!.usersTyping
      let text = typing.get(user3)

      if (text != null && text.length > 100) {
        typing.delete(user3)
        return
      }

      if (text == null) {
        text = Math.random().toString().substring(2)
      } else {
        text += " " + Math.random().toString().substring(2)
      }

      typing.set(user3, text)
    }, 1000)

    return self
  }
}

export function useChannelList() {
  return inject(CHANNEL_LIST_KEY)!
}

export function useChannelLoader(id: Ref<number>) {
  const channelList = useChannelList()
  const channelAdapter = useChannelAdapter()
  const loading = ref(false)
  const error = ref<string | null>(null)
  watch(id, id => {
    loading.value = true
    channelAdapter.setSelectedChannel(null)
    error.value = null
    channelList.getChannel(id).then(newChannel => {
      if (newChannel == null) {
        error.value = "Channel not found"
      } else {
        channelAdapter.setSelectedChannel(newChannel)
      }
    }).finally(() => {
      loading.value = false
    })
  }, { immediate: true })

  onUnmounted(() => {
    channelAdapter.setSelectedChannel(null)
  })

  return { loading, error }
}
