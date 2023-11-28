import axios from "axios"
import { api } from "src/boot/axios"
import { Channel, ChannelType } from "src/contracts/Channel"
import { Message } from "src/contracts/Message"
import { User } from "src/contracts/User"
import { InjectionKey, Ref, inject, onUnmounted, provide, reactive, ref, watch } from "vue"
import { useChannelAdapter } from "./ChannelAdapter"
import { SocketManager } from "./SocketManager"
import { CommandError } from "./errors"
const CHANNEL_LIST_KEY = Symbol("channel-list-key") as InjectionKey<ChannelListAdapter>

export class ChannelListAdapter {
  public channels = new Map<number, Channel>([])

  /**
   * The list of channels is populated with all channels, however they should
   * only contain the data from the Channel database entity, this method
   * fetches the user list and a list of messages.
   * */
  public async getChannel(id: number) {
    try {
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
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new CommandError(error.response.data.message)
      }
      throw error
    }
  }

  public async joinChannel(chName: string, channelType: ChannelType) {
    try {
      const response = await api.post("/api/channel/join", { channelName: chName, isPublic: channelType === "public" })
      return response.data.message
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new CommandError(error.response.data.message)
      }
      throw error
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
      throw error
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

  constructor(
    protected _socket: SocketManager
  ) {
    const self = reactive(this) as this
    provide(CHANNEL_LIST_KEY, self)

    this._socket.on("channel_message", (event) => {
      const channel = self.channels.get(event.channel)
      if (!channel) {
        console.warn(`Received message on unknown channel "${event.channel}" - ${JSON.stringify(event.text)}`)
        return
      }

      const author = channel.users.find(v => v.id == event.author)
      if (!author) {
        console.warn(`Received message from unknown user "${event.author}" - ${JSON.stringify(event.text)}`)
        return
      }

      const message = new Message({
        id: event.id,
        content: event.text,
        user: author
      })

      channel.messages.push(message)

      if (Notification.permission == "granted") {
        const user = api.userAdapter.getCurrentUser()
        if (user.notifications == "all" || (user.notifications == "mentioned" && api.userAdapter.checkUserMention(message))) {
          if (document.visibilityState == "hidden") {
            new Notification(author.name, { body: event.text })
          }
        }
      }
    })

    this._socket.on("user_typing", (event) => {
      const user = api.userAdapter.getCurrentUser()
      if (event.author == user.id) return
      const channel = this.channels.get(event.channel)
      if (!channel) {
        console.warn(`Received user typing message on unknown channel "${event.channel}" - ${JSON.stringify(event.text)}`)
        return
      }

      const author = channel.users.find(v => v.id == event.author)
      if (!author) {
        console.warn(`Received user typing message from unknown user "${event.author}" - ${JSON.stringify(event.text)}`)
        return
      }

      // If the received text is empty, that means the user has stopped typing, so delete the message.
      if (event.text != "") {
        channel.usersTyping.set(author, { lastUpdate: performance.now(), text: event.text })
      } else {
        channel.usersTyping.delete(author)
      }
    })

    // When the an user stops typing (becomes idle), we delete the typing message after 2 seconds.
    setInterval(() => {
      const now = performance.now()
      for (const channel of this.channels.values()) {
        for (const [author, typing] of [...channel.usersTyping]) {
          const age = now - typing.lastUpdate
          if (age > 2000) {
            channel.usersTyping.delete(author)
          }
        }
      }
    }, 100)

    this._socket.on("channel_add", (event) => {
      self.channels.set(event.id, event)
    })

    this._socket.on("channel_remove", (event) => {
      self.channels.delete(event)
    })

    this._socket.on("user_add", (event) => {
      const channel = self.channels.get(event.channel)
      if (!channel) {
        console.warn(`Received user add on unknown channel "${event.channel}"`)
        return
      }
      channel.users.push(event.user)
    })

    this._socket.on("user_remove", (event) => {
      const channel = self.channels.get(event.channel)
      if (!channel) {
        console.warn(`Received user remove on unknown channel "${event.channel}"`)
        return
      }
      channel.users = channel.users.filter(v => v.id != event.user)
    })

    this._socket.on("user_state", (event) => {
      for (const channel of self.channels.values()) {
        for (const user of channel.users) {
          if (user.id == event.user) {
            user.state = event.state
          }
        }
      }
    })

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
    if (isNaN(id)) return

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
