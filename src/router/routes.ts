import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    name: "Index",
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', components: { "center": () => import('pages/IndexPage.vue') } }]
  },
  {
    name: "Channel",
    path: '/channel/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', components: { "center": () => import("pages/ChannelPage.vue"), "sidebar": () => import("components/ChannelUsers.vue") } }]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
