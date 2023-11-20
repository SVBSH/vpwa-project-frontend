<template>
  <q-scroll-area class="root-area q-pa-md" v-if="channel != null">
    <div class="q-pa-md">
      <q-infinite-scroll
        ref="infiniteScroll"
        @load="loadMoreMessages"
        reverse
        >
        <!-- TODO: wait for API call -->
        <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner :thickness="2" color="primary" name="dots" size="40px" />
          </div>
        </template>

        <div v-for="(message, index) in channel.messages" :key="index" class="caption q-py-sm">
          <!-- <q-badge class="shadow-1">
            {{ channel.messages.length - index }}
          </q-badge> -->

          <q-chat-message
            :key="message.id"
            :text="[message.content]"
            text-color="white"
            :name="(!message.user) ? '(Deleted)' : message.user.nickname"
            :bg-color="getBgColor(message.content)"
            class="q-my-sm" />
        </div>
      </q-infinite-scroll>
    </div>
    <!-- <q-card v-if="userTypingView.kind != 'hidden'" class="fixed-bottom q-ma-sm">
      <q-card-section class="q-pa-sm q-px-md">
        <component v-if="userTypingView.kind == 'select'" :is="userTypingView.text" />
        <template v-else-if="userTypingView.kind == 'user'">
          <q-btn flat icon="chevron_left" padding="0" @click="selectUserTyping(null)" />
          &lt;{{ userTypingView.user.nickname }}&gt; {{ userTypingView.text }}
        </template>
      </q-card-section>
    </q-card> -->
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
import { Message } from "src/contracts/Message"
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
    const infiniteScroll = ref<QInfiniteScroll | null>(null)

    const getBgColor = (messageContent: string) => {
      if (messageContent.includes(`@${userAdapter.getCurrentUser().nickname}`)) {
        return "green"
      }
      return "primary"
    }

    const loadMoreMessages = async () => {
      try {
        if (!channelAdapter.selectedChannel) {
          return
        }
        console.log("Before")
        console.log(channel.value.messages)

        const lastMessage = channel.value.messages[0]
        console.log("last message: ", lastMessage.id)

        const newMessages = await api.get<Message[]>(`/api/channel/1/messages?lastId=${lastMessage.id}`)
        if (newMessages) {
          console.log("New messages")
          console.log(newMessages.data)
          channel.value.messages.unshift(
            ...newMessages.data.map(message => new Message(message)),
            ...channel.value.messages)
        }

        console.log("After")
        console.log("messages: ", channel.value.messages)

        if (newMessages.data.length === 0) {
          infiniteScroll.value?.stop()
        }
      } catch (error) {
        console.error("Error loading more messages:", error)
      }
    }
    // FIXME: enable
    // const userTypingView = computed(() => {
    //   const usersTyping = channel.value.usersTyping

    //   if (userTypingSelected.value != null) {
    //     const text = usersTyping.get(userTypingSelected.value)
    //     if (text == null) {
    //       // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    //       userTypingSelected.value = null
    //     } else {
    //       return { kind: "user" as const, text, user: userTypingSelected.value }
    //     }
    //   }

    //   if (usersTyping.size == 0) {
    //     return { kind: "hidden" as const }
    //   }

    //   const text: (VNode | string)[] = []
    //   const users = [...usersTyping.keys()]
    //   for (let i = 0; i < users.length; i++) {
    //     const user = users[i]
    //     if (i > 0) {
    //       if (i == users.length - 1) {
    //         text.push(" and ")
    //       } else {
    //         text.push(", ")
    //       }
    //     }
    //     text.push(h(QBtn, { flat: true, class: "q-pa-sm", padding: "0", label: user.nickname, noCaps: true, onClick: () => selectUserTyping(user) }))
    //   }

    //   if (users.length == 1) text.push(" is ")
    //   else text.push(" are ")
    //   text.push("typing...")

    //   return { kind: "select" as const, text: () => text }
    // })

    return { getBgColor, infiniteScroll, loadMoreMessages, userNickname, channel, selectUserTyping /* userTypingView, getBgColor */ }
  }
})
</script>
