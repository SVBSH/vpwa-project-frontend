<template>
  <form>
    <q-input data-cy="command-bar" v-model="messageText" outlined placeholder="Message or command..." dense>
      <template v-slot:after>
        <q-btn round dense flat color="primary" icon="send" type="submit" @click="handleSubmit" />
      </template>
    </q-input>
  </form>
</template>

<script lang="ts">
import { useQuasar } from "quasar"
import { useChannelAdapter } from "src/services/ChannelAdapter"
import { CommandError } from "src/services/errors"
import CommandParser from "src/utils/CommandParser"
import { defineComponent, ref } from "vue"
export default defineComponent({
  setup(props, ctx) {
    const messageText = ref("")
    const channel = useChannelAdapter()

    const quasar = useQuasar()
    const commandParser = new CommandParser()

    async function handleSubmit(event: Event) {
      event.preventDefault()
      const message = messageText.value.trim()

      if (commandParser.isCommand(message)) {
        // TODO: try/catch
        try {
          const commandMessage = await commandParser.parse(message)
          console.log(commandMessage)

          if (commandMessage != null) {
            quasar.notify({
              type: "positive",
              html: true,
              message: commandMessage
            })
          }
        } catch (err) {
          if (err instanceof CommandError) {
            quasar.notify({
              color: "red-5",
              textColor: "white",
              icon: "warning",
              html: true,
              message: err.message
            })
          }
        }
      } else {
        channel.sendMessage(message)
      }
      messageText.value = ""
    }
    return { messageText, handleSubmit }
  }
})
</script>
