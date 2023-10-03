<template>
  <q-separator />
  <q-scroll-area class="col-5">
    <q-list separator v-if="channel != null">
      <q-item v-for="user in channel.users" :key="user.id">
        <q-item-section>{{ user.nickname }}</q-item-section>
        <q-badge v-if="user.state == 'online'" class="bg-green">Online</q-badge>
        <q-badge v-if="user.state == 'dnd'" class="bg-orange">DND</q-badge>
        <q-badge v-if="user.state == 'offline'" class="bg-red">Offline</q-badge>
      </q-item>
    </q-list>
  </q-scroll-area>
</template>

<script lang="ts">
import { useChannel } from "src/model/Channel"
import { defineComponent } from "vue"

export default defineComponent({
  setup(props, ctx) {
    const channel = useChannel()
    return { channel }
  },
})
</script>
