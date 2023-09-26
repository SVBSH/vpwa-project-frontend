<template>
  <q-separator />
  <q-scroll-area class="col-5">
    <q-list separator>
      <q-item>
        <q-item-section>User 1</q-item-section>
        <q-badge class="bg-green">Online</q-badge>
      </q-item>
      <q-item>
        <q-item-section>User 2</q-item-section>
        <q-badge class="bg-green">Online</q-badge>
      </q-item>
      <q-item>
        <q-item-section>User 3</q-item-section>
        <q-badge class="bg-orange">DND</q-badge>
      </q-item>
      <q-item>
        <q-item-section>User 4</q-item-section>
        <q-badge class="bg-red">Offline</q-badge>
      </q-item>
    </q-list>
  </q-scroll-area>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  setup(props, ctx) {

  },
})
</script>
