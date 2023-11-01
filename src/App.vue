<template>
  <router-view v-if="ready" />
</template>

<script lang="ts">
import { defineComponent, ref } from "vue"
import { ChannelAdapter } from "./services/ChannelAdapter"
import { ChannelListAdapter } from "./services/ChannelListAdapter"
import { UserAdapter } from "./services/UserAdapter"

export default defineComponent({
  name: "App",
  setup(props, ctx) {
    const userAdapter = new UserAdapter()
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
