<template>
  <q-scroll-area>
    <q-list separator>
      <q-item v-for="channel in channelList.channels.values()" :key="channel.id" clickable v-ripple :to="`/channel/${channel.id}`">
        <q-item-section>{{ channel.name }}</q-item-section>
      </q-item>
    </q-list>
  </q-scroll-area>
</template>

<script lang="ts">
import { useChannelList } from "src/model/ChannelList"
import { defineComponent } from "vue"

export default defineComponent({
  setup(props, ctx) {
    const channelList = useChannelList()
    return { channelList }
  },
})
</script>
