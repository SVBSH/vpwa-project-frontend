<template>
  <q-separator />
  <q-scroll-area class="col-5">
    <q-list separator v-if="channel != null">
      <ChannelUser v-for="user in channel.users" :key="user.id" :user="user" />
    </q-list>
  </q-scroll-area>
</template>

<script lang="ts">
import { useChannel } from "src/services/ChannelAdapter"
import { defineComponent } from "vue"
import ChannelUser from "./ChannelUser.vue"

export default defineComponent({
  setup(props, ctx) {
    const channel = useChannel()
    return { channel }
  },
  components: { ChannelUser }
})
</script>
