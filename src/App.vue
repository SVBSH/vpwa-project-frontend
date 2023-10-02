<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { UserAdapter } from "./model/User"

export default defineComponent({
  name: 'App',
  setup(props, ctx) {
    const userAdapter = new UserAdapter()
  },
})
</script>
