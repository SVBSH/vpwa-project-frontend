<template>
  <router-view v-if="ready && !offline" />
  <q-layout view="hHh lpR lFf" v-else-if="offline">
    <q-page-container class="justify-center flex items-center">
      <q-card flat bordered class="my-login-view q-ma-md">
        <q-card-section>
          <div class="text-h6">Offline</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          You are offline. An internet connection is required to use this application.
        </q-card-section>
      </q-card>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { useQuasar } from "quasar"
import { defineComponent, ref } from "vue"
import { api } from "./boot/axios"
import { ServiceWorkerMessage } from "./contracts/SW"
import { ChannelAdapter } from "./services/ChannelAdapter"
import { ChannelListAdapter } from "./services/ChannelListAdapter"
import { SocketManager } from "./services/SocketManager"
import { UserAdapter } from "./services/UserAdapter"

export default defineComponent({
  name: "App",
  setup(props, ctx) {
    const socket = new SocketManager()
    const channelListAdapter = new ChannelListAdapter(socket)
    const userAdapter = new UserAdapter(socket, channelListAdapter)
    const quasar = useQuasar()
    new ChannelAdapter(socket)

    const offline = api.isOffline

    const ready = ref(false)
    userAdapter.initCurrentUser().then(() => {
      ready.value = true
    })

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("message", event => {
        const messageData = event.data
        if (typeof messageData == "object" && messageData != null && "kind" in messageData) {
          console.log(messageData)
          const message = messageData as ServiceWorkerMessage
          if (message.kind == "confirm-notification") {
            const user = userAdapter.isLoggedIn() ? userAdapter.getCurrentUser() : null
            if (user?.id == message.notification.recipient && quasar.appVisible == false) {
              navigator.serviceWorker.ready.then(v => v.active?.postMessage({ kind: "notification-confirmed", notification: message.notification } as ServiceWorkerMessage))
            } else {
              console.log("Rejected notification")
            }
          }
        }
      })
    }

    return { ready, offline }
  }
})
</script>
