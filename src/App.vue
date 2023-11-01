<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { ChannelAdapter } from "./services/ChannelAdapter"
import { ChannelListAdapter } from "./services/ChannelListAdapter"
import { UserAdapter } from "./services/UserAdapter"

export default defineComponent({
  name: "App",
  setup (props, ctx) {
    const userAdapter = new UserAdapter()
    new ChannelListAdapter()
    new ChannelAdapter(userAdapter)
  }
})
</script>
