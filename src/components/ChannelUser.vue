<template>
  <q-item>
    <q-item-section>{{ user.nickname }}</q-item-section>
    <q-badge v-if="user.state == 'online'" class="user-state bg-green">Online</q-badge>
    <q-badge v-if="user.state == 'dnd'" class="user-state bg-orange">DND</q-badge>
    <q-badge v-if="user.state == 'offline'" class="user-state bg-red">Offline</q-badge>
  </q-item>
</template>

<script lang="ts">
import { User } from "src/model/User"
import { defineComponent } from "vue"
export default defineComponent({
  props: {
    user: { type: User, required: true }
  },
  setup(props, ctx) {
    return {}
  }
})
</script>

<style scoped lang="scss">
.user-state {
  width: 3.4rem;
  padding-inline: 0.8em;
  padding-block: 0.5em;
}
</style>
