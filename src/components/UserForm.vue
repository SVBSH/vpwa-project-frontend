<template>
  <q-input key="name" v-if="isRegister" filled v-model="user.name" label="Name" lazy-rules :rules="inputRules ?? []" />
  <q-input key="surname" v-if="isRegister" filled v-model="user.surname" label="Surname" lazy-rules :rules="inputRules ?? []" />
  <q-input key="nickname" filled v-model="user.nickname" label="Nickname" lazy-rules :rules="inputRules ?? []" />
  <q-input key="password" filled v-model="user.password" label="Password" type="password" lazy-rules :rules="inputRules ?? []" />
  <q-input key="email" v-if="isRegister" filled v-model="user.email" label="E-Mail" type="email" lazy-rules :rules="inputRules ?? []" />
</template>

<script lang="ts">
import { ValidationRule } from "quasar"
import { User } from "src/contracts/User"
import { PropType, defineComponent, toRef } from "vue"

export default defineComponent({
  props: {
    user: { type: User, required: true },
    isRegister: { type: Boolean },
    rules: { type: Array as PropType<ValidationRule[]> }
  },
  setup(props, ctx) {
    return { inputRules: toRef(props, "rules") }
  }
})
</script>
