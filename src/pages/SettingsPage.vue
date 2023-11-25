<template>
  <q-card flat bordered class="q-ma-md">
    <q-card-section>
      <div class="text-h6">Account Setting</div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <user-form :user="userData" is-register />
    </q-card-section>
  </q-card>

  <q-card flat bordered class="q-ma-md">
    <q-card-section>
      <div class="text-h6">Notifications</div>
    </q-card-section>
    <q-card-section class="q-pt-none">
      <q-form @submit="handleUserUpdate" class="q-gutter-md">
        <div>
          <q-radio class="q-mr-md" v-for="state in USER_NOTIFY_SETTINGS" :key="state" dense v-model="user.notifications" :val="state" :label="capitalize(state)" />
        </div>

      </q-form>
    </q-card-section>
  </q-card>

  <div class="q-ml-md">
    <q-btn label="Save" @click="handleUserUpdate" color="primary" />
    <q-btn flat @click="cancelUserUpdate">Reset</q-btn>
  </div>
</template>

<script lang="ts">
import { useQuasar } from "quasar"
import { api } from "src/boot/axios"
import UserForm from "src/components/UserForm.vue"
import { USER_NOTIFY_SETTINGS, User } from "src/contracts/User"
import { useUserAdapter } from "src/services/UserAdapter"
import { FormError } from "src/services/errors"
import { capitalize, defineComponent, shallowRef } from "vue"

export default defineComponent({
  setup(props, ctx) {
    const userAdapter = useUserAdapter()
    const user = userAdapter.getCurrentUser()
    const userData = shallowRef(new User(user))
    const quasar = useQuasar()

    function handleUserUpdate() {
      const settingsPayload: Record<string, string | null> = {}

      for (const key of ["nickname", "name", "surname", "email", "password", "notifications"] as const) {
        settingsPayload[key] = userData.value[key] || null
      }

      api.post("/api/user/settings", settingsPayload).then(() => {
        userAdapter.initCurrentUser()
      }, error => {
        if (error instanceof FormError) {
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
      })
    }

    function cancelUserUpdate() {
      userData.value = new User(user)
    }

    return { user, userData, handleUserUpdate, cancelUserUpdate, USER_NOTIFY_SETTINGS, capitalize }
  },
  components: { UserForm }
})
</script>