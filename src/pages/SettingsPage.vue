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
          <q-radio :disable="!notificationsPossible" class="q-mr-md" v-for="state in USER_NOTIFY_SETTINGS" :key="state" dense v-model="userData.notifications" :val="state" :label="capitalize(state)" />
        </div>
      </q-form>
      <q-card v-if="!notificationsPossible" class="q-mt-md bg-red-2" bordered flat>
        <q-card-section>
          Your browser does not support service workers, therefore notification will not be enabled.
        </q-card-section>
      </q-card>
    </q-card-section>
  </q-card>

  <div class="q-ml-md">
    <q-btn label="Save" @click="handleUserUpdate" color="primary" />
    <q-btn flat @click="cancelUserUpdate">Reset</q-btn>
  </div>
</template>

<script lang="ts">
import { useQuasar } from "quasar"
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
    const notificationsPossible = navigator.serviceWorker && process.env.MODE == "pwa"

    function handleUserUpdate() {
      userAdapter.setUserSettings(userData.value).catch(error => {
        if (error instanceof FormError) {
          console.error(error)

          quasar.notify({
            color: "red-5",
            textColor: "white",
            icon: "warning",
            message: error.message
          })

          cancelUserUpdate()
        } else {
          throw error
        }
      })
    }

    function cancelUserUpdate() {
      userData.value = new User(user)
    }

    return { user, userData, handleUserUpdate, cancelUserUpdate, USER_NOTIFY_SETTINGS, capitalize, notificationsPossible }
  },
  components: { UserForm }
})
</script>
