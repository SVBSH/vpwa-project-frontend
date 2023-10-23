<template>
  <q-scroll-area class="root-area q-pa-md" v-if="channel != null">
    <div class="q-my-sm" v-for="message in channel.messages" :key="message.id">&lt;{{ message.user.nickname }}&gt; {{ message.content }}</div>
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
import { useChannel } from "src/model/Channel"
import { defineComponent } from "vue"

export default defineComponent({
  setup(props, ctx) {
    return { channel }
    const channel = useChannel({ required: true })
  },
})
</script>
