<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Create Channel</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="createChannel">
          <q-input
            filled
            v-model="newChannelName"
            label="Channel Name"
            :error="channelNameError"
            :error-message="channelNameErrorMessage"
          />

          <div class="q-mt-md">
            <q-toggle v-model="isPublic" label="Public Channel" />
          </div>

          <div class="row justify-end q-mt-md">
            <q-btn label="Cancel" flat @click="cancelCreation" class="q-mr-sm" />
            <q-btn label="Create" type="submit" color="primary" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useQuasar, useDialogPluginComponent } from "quasar"

import { ChannelListAdapter } from "src/services/ChannelListAdapter"
import { CommandError } from "src/services/errors"
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const quasar = useQuasar()

const newChannelName = ref("")
const isPublic = ref(false)
const channelNameError = ref(false)
const channelNameErrorMessage = ref("Channel name is required")

async function createChannel() {
  if (newChannelName.value.trim() === "") {
    channelNameError.value = true
    return
  }

  channelNameError.value = false
  const channelType = isPublic.value ? "public" : "private"
  try {
    const response = await props.channelList.joinChannel(newChannelName.value, channelType)
    if (response != null) {
      quasar.notify({
        type: "positive",
        html: true,
        message: response
      })
    }
  } catch (err) {
    if (err instanceof CommandError) {
      quasar.notify({
        color: "red-5",
        textColor: "white",
        icon: "warning",
        html: true,
        message: err.message
      })
    } else {
      console.log(err)
    }
  }

  onDialogOK()
  dialogRef.value?.hide()
}

function cancelCreation() {
  dialogRef.value?.hide()
}

const props = defineProps({
  channelList: {
    type: ChannelListAdapter,
    required: true
  }
})

defineEmits([...useDialogPluginComponent.emits])
</script>
