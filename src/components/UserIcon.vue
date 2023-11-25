<template>
  <q-btn flat :label="user.nickname" icon="person" no-caps>
    <q-menu :key="iteration">
      <q-list>
        <q-item clickable v-ripple @click="logout">
          <q-item-section>Sign out</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="settings">
          <q-item-section>Settings</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>

  <q-btn no-caps :color="USER_STATE_META[user.state].color" :class="user.state" :label="USER_STATE_META[user.state].label">
    <q-menu :key="iteration">
      <q-list>
        <q-item clickable v-ripple v-for="state in inactiveUserState" :class="state" :key="state" @click="changeUserState(state)">
          {{ USER_STATE_META[state].label }}
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script lang="ts">
import { useQuasar } from "quasar"
import { USER_STATE, USER_STATE_META, UserState } from "src/contracts/User"
import { useUserAdapter } from "src/services/UserAdapter"
import { CommandError } from "src/services/errors"
import { computed, defineComponent, ref } from "vue"
import { useRouter } from "vue-router"

export default defineComponent({
  setup(props, ctx) {
    const userAdapter = useUserAdapter()
    const user = userAdapter.getCurrentUser()
    const quasar = useQuasar()
    const iteration = ref(0)
    const router = useRouter()

    function logout() {
      userAdapter.logout()
    }

    function settings() {
      router.push({ name: "Settings" })
      iteration.value++
    }

    async function changeUserState(state: UserState) {
      iteration.value++
      try {
        await userAdapter.setUserState(state)
      } catch (error) {
        if (error instanceof CommandError) {
          quasar.notify({
            color: "red-5",
            textColor: "white",
            icon: "warning",
            html: true,
            message: error.message
          })
        } else {
          throw error
        }
      }
    }
    const inactiveUserState = computed(() => USER_STATE.filter((state) => state != user.state))
    return { user, iteration, USER_STATE_META, logout, changeUserState, inactiveUserState, settings }
  }
})
</script>

<style scoped>
.online {
  color: limegreen;
}

.offline {
  color: red;
}

.dnd {
  color: orange;
}
</style>
