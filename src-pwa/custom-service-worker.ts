/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxPluginMode is set to "InjectManifest"
 */

declare const self: ServiceWorkerGlobalScope &
  typeof globalThis & { skipWaiting: () => void }

import { precacheAndRoute } from "workbox-precaching"

const _1 = console.log
console.log = (...args) => {
  _1("⚙", ...args)
}

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST)
