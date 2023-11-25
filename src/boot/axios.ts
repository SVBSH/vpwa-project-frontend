import axios, { AxiosInstance } from "axios"
import { boot } from "quasar/wrappers"
import { UserAdapter } from "src/services/UserAdapter"
import { shallowRef } from "vue"

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $axios: AxiosInstance
    $api: AxiosInstance
  }
}

const api = axios.create() as AxiosInstance & { userAdapter: UserAdapter, isOffline: { value: boolean } }
api.isOffline = shallowRef(false)
api.interceptors.request.use((config) => {
  const token = api.userAdapter.getToken()

  if (token != null) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
void ((window as unknown as Record<string, object>).api = api)

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api }
