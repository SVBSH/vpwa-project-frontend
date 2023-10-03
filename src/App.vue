<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ChannelAdapter } from './model/Channel'
import { ChannelListAdapter } from './model/ChannelList'
import { UserAdapter } from "./model/User"

export default defineComponent({
  name: 'App',
  setup(props, ctx) {
    const userAdapter = new UserAdapter()
    new ChannelListAdapter()
    new ChannelAdapter(userAdapter)
  },
})
</script>
