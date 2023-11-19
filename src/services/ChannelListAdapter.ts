import { Channel, ChannelType } from "src/contracts/Channel"
import { Message } from "src/contracts/Message"
import { User } from "src/contracts/User"
import { InjectionKey, Ref, inject, onUnmounted, provide, reactive, ref, watch } from "vue"
import { useChannelAdapter } from "./ChannelAdapter"
import { CommandError } from "./errors"
import { api } from "src/boot/axios"
import axios from "axios"
const CHANNEL_LIST_KEY = Symbol("channel-list-key") as InjectionKey<ChannelListAdapter>

export class ChannelListAdapter {
  public channels = new Map<number, Channel>([])

  /**
   * The list of channels is populated with all channels, however they should
   * only contain the data from the Channel database entity, this method
   * fetches the user list and a list of messages.
   * */
  public async getChannel(id: number) {
    const response = await api.get<Channel>(`/api/channel/${id}`)

    const partialChannel = this.channels.get(id)
    if (partialChannel) {
      partialChannel.users = response.data.users.map(user => {
        return new User(user)
      })

      partialChannel.messages = response.data.messages.map(message => {
        return new Message({
          ...message,
          user: response.data.users.find(user => user.id === message.user.id)
        })
      })
    }
    return partialChannel
  }

  public async joinChannel(chName: string, channelType: ChannelType) {
    try {
      const response = await api.post("/api/channel/join", { channelName: chName, isPublic: channelType === "public" })
      return response.data.message
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new CommandError(error.response.data.message)
      }
    }
  }

  public async quitChannel(channelId: number) {
    try {
      const response = await api.delete(`/api/channel/${channelId}/quit`)
      return response.data.message
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new CommandError(error.response.data.message)
      }
    }
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
    /*
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
    */
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
