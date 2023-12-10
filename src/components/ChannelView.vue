<template>
  <q-scroll-area class="root-area q-pa-md" v-if="channel != null">
    <div class="q-pa-md">
      <q-infinite-scroll reverse ref="infiniteScroll" @load="loadMoreMessages">
        <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner :thickness="2" color="primary" name="dots" size="40px" />
          </div>
        </template>

        <div v-for="(message, index) in channel.messages" :key="index" class="caption q-py-sm">
          <q-chat-message
            :key="message.id"
            :text="[message.content]"
            text-color="white"
            :name="(!message.user) ? 'Removed Author' : message.user.nickname"
            :bg-color="getBgColor(message)"
            class="q-my-sm"
          />
        </div>
      </q-infinite-scroll>
    </div>
    <q-card v-if="userTypingView.kind != 'hidden'" class="fixed-bottom q-ma-sm">
      <q-card-section class="q-pa-sm q-px-md">
        <component v-if="userTypingView.kind == 'select'" :is="userTypingView.text" />
        <template v-else-if="userTypingView.kind == 'user'">
          <q-btn flat icon="chevron_left" padding="0" @click="selectUserTyping(null)" />
          &lt;{{ userTypingView.user.nickname }}&gt; {{ userTypingView.text }}
        </template>
      </q-card-section>
    </q-card>
  </q-scroll-area>
</template>

<style type="scss" scoped>
.root-area {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
</style>

<script lang="ts">
import { QBtn, QInfiniteScroll } from "quasar"
import { api } from "src/boot/axios"
import { Message, ChannelMessage } from "src/contracts/Message"
import { User } from "src/contracts/User"
import { useChannel, useChannelAdapter } from "src/services/ChannelAdapter"
import { useUserAdapter } from "src/services/UserAdapter"
import { VNode, computed, defineComponent, h, ref, shallowRef } from "vue"

export default defineComponent({
  setup(props, ctx) {
    const channel = useChannel({ required: true })
    const userTypingSelected = shallowRef(null as User | null)
    const userAdapter = useUserAdapter()
    const userNickname = userAdapter.getCurrentUser().nickname
    function selectUserTyping(user: User | null) {
      userTypingSelected.value = user
    }
    const channelAdapter = useChannelAdapter()
    const infiniteScroll = ref<QInfiniteScroll>()

    function getBgColor(message: Message) {
      if (userAdapter.checkUserMention(message)) {
        return "positive"
      } else {
        return "primary"
      }
    }

    const loadMoreMessages = async (index: number, done: () => void) => {
      try {
        if (!channelAdapter.selectedChannel) {
          infiniteScroll.value?.stop()
          done()
          return
        }
        const lastMessage = channelAdapter.selectedChannel.messages[0]
        if (!lastMessage) {
          infiniteScroll.value?.stop()
          return
        }

        const channelId = channelAdapter.selectedChannel.id
        const newMessages = await api.get<ChannelMessage[]>(`/api/channel/${channelId}/messages?lastId=${lastMessage.id}`)

        newMessages.data.reverse().forEach(message => {
          channelAdapter.selectedChannel?.messages.unshift(
            new Message({
              ...message,
              user: channel.value.users.find(user => user.id == message.author)
            })
          )
        })

        if (newMessages.data.length === 0) {
          infiniteScroll.value?.stop()
        }
        done()
      } catch (error) {
        console.error("Error loading more messages:", error)
      }
    }

    const userTypingView = computed(() => {
      const usersTyping = channel.value.usersTyping

      if (userTypingSelected.value != null) {
        const selectedAuthor = userTypingSelected.value
        const typingInfo = usersTyping.get(userTypingSelected.value)
        if (typingInfo == null) {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          userTypingSelected.value = null
        } else {
          return { kind: "user" as const, text: typingInfo.text, user: selectedAuthor }
        }
      }

      if (usersTyping.size == 0) {
        return { kind: "hidden" as const }
      }

      const text: (VNode | string)[] = []
      const users = [...usersTyping.keys()]
      for (let i = 0; i < users.length; i++) {
        const user = users[i]
        if (i > 0) {
          if (i == users.length - 1) {
            text.push(" and ")
          } else {
            text.push(", ")
          }
        }
        text.push(h(QBtn, { flat: true, class: "q-pa-sm", padding: "0", label: user.nickname, noCaps: true, onClick: () => selectUserTyping(user) }))
      }

      if (users.length == 1) text.push(" is ")
      else text.push(" are ")
      text.push("typing...")

      return { kind: "select" as const, text: () => text }
    })

    return {
      infiniteScroll,
      loadMoreMessages,
      userNickname,
      channel,
      selectUserTyping,
      getBgColor,
      userTypingView
    }
  }
})
</script>
