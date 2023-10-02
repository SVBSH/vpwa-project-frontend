<template>
  <q-btn flat :label="user.nickname" icon="person" no-caps>
    <q-menu>
      <q-list>
        <q-item clickable v-ripple @click="logout">
          <q-item-section>Sign out</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script lang="ts">
import { useUserAdapter } from "src/model/User"
import { defineComponent } from "vue"

export default defineComponent({
  setup(props, ctx) {
    const userAdapter = useUserAdapter()
    const user = userAdapter.getCurrentUser()

    function logout() {
      userAdapter.logout()
    }

    return { user, logout }
  },
})
</script>
