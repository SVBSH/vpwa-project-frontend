<template>
  <q-scroll-area class="root-area q-pa-md" v-if="channel != null">
    <div class="q-pa-md">
      <q-infinite-scroll @load="" reverse>
        <!-- TODO: wait for API call -->
        <!-- <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner :thickness="2" color="primary" name="dots" size="40px" />
          </div>
        </template> -->

        <div
          v-for="(message, index) in channel.messages"
          :key="index"
          class="caption q-py-sm"
        >
          <!-- <q-badge class="shadow-1">
            {{ channel.messages.length - index }}
          </q-badge> -->

          <q-chat-message
            :key="message.id"
            :text="[message.content]"
            text-color="white"
            :name="message.user.nickname"
            bg-color="primary"
            class="q-my-sm"
          />
        </div>
      </q-infinite-scroll>
    </div>
  </q-scroll-area>
</template>

<style type="scss" scoped>
.root-area {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
</style>

<script lang="ts">
import { useChannel, useChannelAdapter } from "src/model/Channel";
import { defineComponent, ref } from "vue";

export default defineComponent({
  setup(props, ctx) {
    const channel = useChannel();
    return { channel };
  },
});
</script>
