<template>
  <q-scroll-area>
    <q-list separator>
      <q-item clickable v-ripple to="/channel/1">
        <q-item-section>Channel 1</q-item-section>
      </q-item>
      <q-item clickable v-ripple to="/channel/2">
        <q-item-section>Channel 2</q-item-section>
      </q-item>
      <q-item clickable v-ripple to="/channel/3">
        <q-item-section>Channel 3</q-item-section>
        <q-badge class="bg-red">5</q-badge>
      </q-item>
      <q-item clickable v-ripple to="/channel/4">
        <q-item-section>Channel 4</q-item-section>
      </q-item>
      <q-item clickable v-ripple to="/channel/5">
        <q-item-section>Channel 5</q-item-section>
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
