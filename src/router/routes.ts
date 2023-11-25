import { RouteRecordRaw } from "vue-router"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", components: { center: () => import("pages/IndexPage.vue") } }]
  },
  {
    path: "/channel/:id",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", components: { center: () => import("pages/ChannelPage.vue"), sidebar: () => import("components/ChannelUsers.vue") } }]
  },
  {
    name: "Login",
    path: "/login",
    component: () => import("pages/LoginPage.vue")
  },
  {
    path: "/settings",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ name: "Settings", path: "", components: { center: () => import("pages/SettingsPage.vue") } }]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue")
  }
]

export default routes
