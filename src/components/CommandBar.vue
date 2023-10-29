<template>
  <form>
    <q-input
      v-model="messageText"
      outlined
      placeholder="Message or command..."
      dense
    >
      <template v-slot:after>
        <q-btn
          round
          dense
          flat
          color="primary"
          icon="send"
          type="submit"
          @click="handleSubmit"
        />
      </template>
    </q-input>
  </form>
</template>

<script lang="ts">
import { useChannelAdapter } from "src/model/Channel";
import { useChannelList } from "src/model/ChannelList";
import { defineComponent, ref } from "vue";
import { useUserAdapter } from "src/model/User";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import CommandParser from "src/utils/CommandParser";

export default defineComponent({
  setup(props, ctx) {
    const quasar = useQuasar();
    const router = useRouter();

    const messageText = ref("");
    const channel = useChannelAdapter();
    const userAdapter = useUserAdapter();
    const channelListAdapter = useChannelList();

    const commandParser = new CommandParser(
      router,
      channel,
      userAdapter,
      channelListAdapter,
      quasar
    );

    function handleSubmit(event: Event) {
      event.preventDefault();
      const message = messageText.value.trim();

      if (commandParser.isCommand(message)) {
        commandParser.parse(message);
      } else {
        channel.sendMessage(message);
      }
      messageText.value = "";
    }
    return { messageText, handleSubmit };
  },
});
</script>
