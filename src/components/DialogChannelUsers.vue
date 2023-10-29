<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Channel Members</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-scroll-area
          style="height: 200px; min-width: 300px; max-width: 500px"
        >
          <ChannelUser v-for="user in channelUsers" :user="user" :key="user.nickname" />
        </q-scroll-area>
      </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { User } from 'src/model/User';
import ChannelUser from './ChannelUser.vue';


const props = defineProps({
  channelUsers: {
    type: Array<User>,
    required: true
  }
})

defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

// this is part of our example (so not required)
function onOKClick () {
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK()
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
