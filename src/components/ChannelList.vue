<template>
  <q-scroll-area>
    <q-list separator>
      <q-item v-for="channel in channelList.channels.values()" :key="channel.id" clickable v-ripple :to="`/channel/${channel.id}`" @click="selectChannel(channel.id)" class="q-pa-sm">
        <q-item-section>
          {{ channel.name }}
        </q-item-section>

        <!-- Conditional Button Rendering -->
        <q-item-section side>
          <div>
            <q-icon v-if="channel.type === 'private'" name="lock">
            </q-icon>
            <q-btn v-if="channel.adminID == currentUserId" flat dense icon="delete" @click.stop="removeChannel(channel.id)" />
            <q-btn v-else flat dense icon="logout" @click.stop="removeChannel(channel.id)" />
          </div>
        </q-item-section>
      </q-item>
      <q-item clickable @click="createChannel">
        <q-item-section>
          <div>
            <q-icon name="add"></q-icon>
            Add Channel
          </div>
        </q-item-section>
      </q-item>

    </q-list>
  </q-scroll-area>
</template>

<script lang="ts">
import { useQuasar } from "quasar"
import DialogCreateChannel from "src/components/DialogCreateChannel.vue"
import { useChannelAdapter } from "src/services/ChannelAdapter"
import { useChannelList } from "src/services/ChannelListAdapter"
import { useUserAdapter } from "src/services/UserAdapter"
import { defineComponent } from "vue"
import { useRouter } from "vue-router"

export default defineComponent({
  setup(props, ctx) {
    const quasar = useQuasar()
    const channelList = useChannelList()
    const channelAdapter = useChannelAdapter()
    const router = useRouter()
    const userAdapter = useUserAdapter()
    async function selectChannel(channelId: number) {
      const reqChannel = await channelList.getChannel(channelId)
      if (reqChannel != undefined) {
        channelAdapter.setSelectedChannel(reqChannel)
        router.push(`/channel/${channelId}`)
      }
    }
    const currentUserId = userAdapter.getCurrentUser().id

    async function removeChannel(channelId: number) {
      channelAdapter.removeUser(channelId)
    }

    function createChannel() {
      quasar.dialog({
        component: DialogCreateChannel,
        componentProps: {
          channelList
        }
      })
    }

    return { channelList, selectChannel, currentUserId, removeChannel, createChannel }
  }
})
</script>
