<template>
  <q-item>
    <q-item-section>{{ user.nickname }}</q-item-section>
    <q-badge :class="`user-state bg-${USER_STATE_META[user.state].color}`"> {{ USER_STATE_META[user.state].label }}</q-badge>
  </q-item>
</template>

<script lang="ts">
import { USER_STATE_META, User } from "src/contracts/User"
import { defineComponent } from "vue"
export default defineComponent({
  props: {
    user: { type: User, required: true }
  },
  setup(props, ctx) {
    return { USER_STATE_META }
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
