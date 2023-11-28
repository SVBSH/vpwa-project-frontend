<template>
  <q-layout view="hHh lpR lFf">

    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          {{ channel?.name ?? "Home" }}
        </q-toolbar-title>

        <q-space />

        <user-icon />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered class="column">
      <channel-list class="col-grow" />
      <router-view name="sidebar" />
    </q-drawer>

    <q-page-container>
      <router-view name="center" />
    </q-page-container>

    <q-footer bordered class="bg-white">
      <q-toolbar class="row">
        <command-bar class="col-grow" />
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script>
import ChannelList from "src/components/ChannelList.vue"
import CommandBar from "src/components/CommandBar.vue"
import UserIcon from "src/components/UserIcon.vue"
import { useChannel } from "src/services/ChannelAdapter"
import { ref } from "vue"

export default {
  setup() {
    const channel = useChannel()

    const leftDrawerOpen = ref(false)
    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    return { leftDrawerOpen, toggleLeftDrawer, channel }
  },
  components: { ChannelList, CommandBar, UserIcon }
}
</script>
