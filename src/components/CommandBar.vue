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
import { useChannel, useChannelAdapter } from "src/model/Channel"
import { defineComponent, ref } from "vue"

export default defineComponent({
  setup(props, ctx) {
    const messageText = ref("")
    const channel = useChannelAdapter()

    function handleSubmit(event: Event) {
      event.preventDefault()
      const message = messageText.value
      messageText.value = ""

      if (message[0] == "/") {
        // Command
      } else {
        channel.sendMessage(message)
      }
    }

    return { messageText, handleSubmit }
  },
})
</script>
