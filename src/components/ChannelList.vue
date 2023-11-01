<template>
  <q-scroll-area>
    <q-list separator>
      <q-item
        v-for="channel in channelList.channels.values()"
        :key="channel.id"
        clickable
        v-ripple
        :to="`/channel/${channel.id}`"
        @click="selectChannel(channel.id)"
      >
        <q-item-section>{{ channel.name }}</q-item-section>
      </q-item>
    </q-list>
  </q-scroll-area>
</template>

<script lang="ts">
import { useChannelAdapter } from "src/services/ChannelAdapter"
import { useChannelList } from "src/services/ChannelListAdapter"
import { defineComponent } from "vue"
import { useRouter } from "vue-router"
export default defineComponent({
  setup(props, ctx) {
    const channelList = useChannelList()
    const channelAdapter = useChannelAdapter()
    const router = useRouter()

    async function selectChannel(channelId: number) {
      const reqChannel = await channelList.getChannel(channelId)
      if (reqChannel != undefined) {
        channelAdapter.setSelectedChannel(reqChannel)
        router.push(`/channel/${channelId}`)
      }
    }
    return { channelList, selectChannel }
  }
})
</script>
