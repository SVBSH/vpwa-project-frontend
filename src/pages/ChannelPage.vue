<template>
  <q-page>
    <channel-view />
    <q-inner-loading :showing="loading" dark />
  </q-page>
</template>

<script lang="ts">
import { useQuasar } from "quasar"
import ChannelView from "src/components/ChannelView.vue"
import { useChannelLoader } from "src/model/ChannelList"
import { computed, defineComponent, watch } from "vue"
import { useRoute } from "vue-router"

export default defineComponent({
  setup(props, ctx) {
    const quasar = useQuasar()
    const route = useRoute()
    const channelID = computed(() => parseInt(route.params["id"] as string))
    const { error, loading } = useChannelLoader(channelID)
    watch(error, error => {
      if (error != null)
        quasar.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: error
        })
    })
    return { loading }
  },
  components: { ChannelView }
})
</script>
