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
        <q-item
          clickable
          v-ripple
          v-for="state in inactiveUserState"
          :class="state"
          :key="state"
          @click="changeUserState(state)"
        >
          {{ state.toUpperCase() }}
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script lang="ts">
import { useUserAdapter, UserState, USER_STATE } from "src/model/User"
import { defineComponent, computed } from "vue"

export default defineComponent({
  setup (props, ctx) {
    const userAdapter = useUserAdapter()
    const user = userAdapter.getCurrentUser()

    function logout () {
      userAdapter.logout()
    }

    function changeUserState (state: UserState) {
      userAdapter.setUserState(state)
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
