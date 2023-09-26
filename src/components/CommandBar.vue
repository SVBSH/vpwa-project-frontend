<template>
  <form>
    <q-input v-model="messageText" outlined placeholder="Message or command..." dense>
      <template v-slot:after>
        <q-btn round dense flat icon="send" type="submit" @click="handleSubmit" />
      </template>
    </q-input>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue"

export default defineComponent({
  setup(props, ctx) {
    const messageText = ref("")

    function handleSubmit(event: Event) {
      event.preventDefault()

      messageText.value = ""
    }

    return { messageText, handleSubmit }
  },
})
</script>
