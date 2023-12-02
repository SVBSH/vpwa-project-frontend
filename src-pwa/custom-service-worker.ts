/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxPluginMode is set to "InjectManifest"
 */

import type { PushMessage } from "../src/contracts/Message"
import type { ServiceWorkerMessage } from "../src/contracts/SW"

declare const self: ServiceWorkerGlobalScope &
  typeof globalThis & { skipWaiting: () => void }

import { precacheAndRoute } from "workbox-precaching"

const _1 = console.log
console.log = (...args) => {
  _1("⚙", ...args)
}

function showNotification(notification: PushMessage) {
  if (Notification.permission == "granted") {
    (self as unknown as { registration: ServiceWorkerRegistration }).registration.showNotification(
      notification.author,
      {
        body: notification.text,
        actions: [{ action: "/channel/" + notification.channel, title: "View" }]
      }
    )
  }
}

self.addEventListener("push", (event: any) => {
  console.log("Push event", event.data?.json())
  event.waitUntil((async () => {
    const clients = await (self as any).clients.matchAll({ type: "window", includeUncontrolled: false })
    const data = event.data?.json() as PushMessage | undefined
    if (data == null || !("author" in data)) return

    if (clients.length == 0) {
      showNotification(data)
    } else {
      for (const client of clients) {
        client.postMessage({ kind: "confirm-notification", notification: data } as ServiceWorkerMessage)
      }
    }
  })())
})

self.addEventListener("notificationclick", (event: any) => {
  const action = event.action
  event.waitUntil((self as any).clients.openWindow("/#" + action))
})

self.addEventListener("pushsubscriptionchange", event => {
  (self as unknown as { registration: ServiceWorkerRegistration }).registration.pushManager.getSubscription().then((v: PushSubscription | null) => console.log("Received pushsubscriptionchange, ", v))
})

self.addEventListener("message", event => {
  const messageData = event.data
  if (typeof messageData == "object" && messageData != null && "kind" in messageData) {
    const message = messageData as ServiceWorkerMessage
    if (message.kind == "notification-confirmed") {
      showNotification(message.notification)
    }
  }
})

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST)
