<template>
  <q-layout view="hHh lpR lFf">

    <q-page-container class="justify-center flex items-center">
      <q-card flat bordered class="my-login-view q-ma-md">
        <q-card-section>
          <div class="text-h6">{{ isRegister ? 'Register' : 'Login' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="handleSubmit" class="q-gutter-md">
            <user-form :user="user" :is-register="isRegister" :rules="inputRules" />

            <div>
              <q-btn :label="isRegister ? 'Register' : 'Login'" type="submit" color="primary" />
              <q-btn v-if="!isRegister" flat @click="setRegister">Create account</q-btn>
              <q-btn v-if="isRegister" flat @click="setLogin">Use existing account</q-btn>
            </div>
          </q-form>

        </q-card-section>
      </q-card>
    </q-page-container>

  </q-layout>
</template>

<style lang="scss" scoped>
.my-login-view {
  min-width: 500px;
}
</style>

<script lang="ts">
import { useQuasar } from "quasar"
import UserForm from "src/components/UserForm.vue"
import { User } from "src/contracts/User"
import { useUserAdapter } from "src/services/UserAdapter"
import { FormError } from "src/services/errors"
import { defineComponent, ref } from "vue"
import { useRoute, useRouter } from "vue-router"

export default defineComponent({
  setup(props, ctx) {
    const quasar = useQuasar()
    const inputRules = [(val: string) => (val && val.length > 0) || "Please type something"]
    const user = ref(new User({ name: "", surname: "", nickname: "", password: "", email: "user@example.com" }))
    const userAdapter = useUserAdapter()
    const route = useRoute()
    const router = useRouter()
    const isRegister = ref(false)
    function redirectBack() {
      router.replace((route.query.redirect as string) ?? "/")
    }
    if (userAdapter.isLoggedIn()) {
      redirectBack()
    }
    function handleSubmit() {
      userAdapter[isRegister.value ? "register" : "login"](user.value).then(() => {
        redirectBack()
      }, error => {
        if (error instanceof FormError) {
          quasar.notify({
            color: "red-5",
            textColor: "white",
            icon: "warning",
            message: error.message
          })
        } else {
          console.error(error)
        }
      })
    }
    function setLogin() {
      isRegister.value = false
    }
    function setRegister() {
      isRegister.value = true
    }
    return { handleSubmit, user, isRegister, setLogin, setRegister, inputRules }
  },
  components: { UserForm }
})
</script>
