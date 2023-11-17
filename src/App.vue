<template>
  <router-view v-if="ready" />
</template>

<script lang="ts">
import { defineComponent, ref } from "vue"
import { ChannelAdapter } from "./services/ChannelAdapter"
import { ChannelListAdapter } from "./services/ChannelListAdapter"
import { UserAdapter } from "./services/UserAdapter"
import { SocketManager } from "./services/SocketManager"

export default defineComponent({
  name: "App",
  setup(props, ctx) {
    const socket = new SocketManager()
    const userAdapter = new UserAdapter(socket)
    new ChannelListAdapter()
    new ChannelAdapter()

    const ready = ref(false)
    userAdapter.initCurrentUser().then(() => {
      ready.value = true
    })

    return { ready }
  }
})
</script>
