<template>
  <q-layout view="hHh lpR lFf">

    <q-page-container class="justify-center flex items-center">
      <q-card flat bordered class="my-login-view q-ma-md">
        <q-card-section>
          <div class="text-h6">{{ isRegister ? 'Register' : 'Login' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="handleSubmit" class="q-gutter-md">
            <q-input key="name" v-if="isRegister" filled v-model="user.name" label="Name" lazy-rules :rules="inputRules" />
            <q-input key="surname" v-if="isRegister" filled v-model="user.surname" label="Surname" lazy-rules :rules="inputRules" />
            <q-input key="nickname" filled v-model="user.nickname" label="Nickname" lazy-rules :rules="inputRules" />
            <q-input key="password" filled v-model="user.password" label="Password" type="password" lazy-rules :rules="inputRules" />

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
import { FormError } from "src/model/FormError"
import { User, useUserAdapter } from "src/model/User"
import { defineComponent, ref } from "vue"
import { useRoute, useRouter } from "vue-router"

export default defineComponent({
  setup(props, ctx) {
    const quasar = useQuasar()
    const user = ref(new User({ name: "Janko", surname: "Mrkvicka", nickname: "user-1", password: "12345" }))
    const inputRules = [(val: string) => (val && val.length > 0) || "Please type something"]
    const userAdapter = useUserAdapter()
    const route = useRoute()
    const router = useRouter()
    const isRegister = ref(false)

    function handleSubmit() {
      userAdapter[isRegister.value ? "register" : "login"](user.value).then(() => {
        router.replace((route.query.redirect as string) ?? "/")
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

    return { handleSubmit, user, inputRules, isRegister, setLogin, setRegister }
  }
})
</script>
