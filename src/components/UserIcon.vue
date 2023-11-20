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

  <q-btn flat :class="user.state" :label="user.state">
    <q-menu>
      <q-list>
        <q-item clickable v-ripple v-for="state in inactiveUserState" :class="state" :key="state" @click="changeUserState(state)">
          {{ state.toUpperCase() }}
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script lang="ts">
import { useQuasar } from "quasar"
import { USER_STATE, UserState } from "src/contracts/User"
import { useUserAdapter } from "src/services/UserAdapter"
import { CommandError } from "src/services/errors"
import { computed, defineComponent } from "vue"

export default defineComponent({
  setup(props, ctx) {
    const userAdapter = useUserAdapter()
    const user = userAdapter.getCurrentUser()
    const quasar = useQuasar()

    function logout() {
      userAdapter.logout()
    }

    async function changeUserState(state: UserState) {
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
    const inactiveUserState = computed(() =>
      USER_STATE.filter((state) => state != user.state)
    )

    return { user, logout, changeUserState, inactiveUserState }
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
