import { InjectionKey, Ref, inject, onUnmounted, provide, reactive, ref, watch } from "vue"
import { Channel, Message, useChannelAdapter } from "./Channel"
import { User } from "./User"

const CHANNEL_LIST_KEY = Symbol() as InjectionKey<ChannelListAdapter>

export class ChannelListAdapter {
  public channels = new Map<number, Channel>()

  /**
   * The list of channels is populated with all channels, however they should
   * only contain the data from the Channel database entity, this method
   * fetches the user list and a list of messages.
   * */
  public async getChannel(id: number) {
    return this.channels.get(id)
  }

  constructor() {
    const self = reactive(this)
    provide(CHANNEL_LIST_KEY, self)

    // Default mock data
    const user1 = new User({ id: 1, nickname: "foo", state: "dnd" })
    const user2 = new User({ id: 2, nickname: "bar", state: "offline" })
    const user3 = new User({ id: 3, nickname: "baz", state: "online" })
    this.channels.set(0, new Channel({
      id: 0, name: "Channel 1",
      users: [user1, user2, user3],
      messages: [
        new Message({ user: user1, content: "Lorem ipsum dolor sit amet" }),
        new Message({ user: user2, content: "consectetur adipisicing elit" }),
        new Message({ user: user3, content: "Beatae, ea at cupiditate quisquam voluptatem modi" }),
        new Message({ user: user1, content: "neque voluptates omnis est ipsam" }),
      ]
    }))


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
