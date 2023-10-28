<template>
  <form>
    <q-dialog v-model="icon">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Channel Members</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-scroll-area
          style="height: 200px; min-width: 300px; max-width: 500px"
        >
          <ChannelUser v-for="user in getChannelUsers()" :user="user" />
        </q-scroll-area>
      </q-card>
    </q-dialog>

    <q-input
      v-model="messageText"
      outlined
      placeholder="Message or command..."
      dense
    >
      <template v-slot:after>
        <q-btn
          round
          dense
          flat
          icon="send"
          type="submit"
          @click="handleSubmit"
        />
      </template>
    </q-input>
  </form>
</template>

<script lang="ts">
import { ChannelType, useChannelAdapter } from "src/model/Channel";
import { useChannelList } from "src/model/ChannelList";
import { defineComponent, ref } from "vue";
import ChannelUser from "./ChannelUser.vue";
import { User, useUserAdapter } from "src/model/User";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
/**
 * /join channelName [private] - if channel does not exist - it will be created
 * /invite nickName - add user (prereq. private channel)
 * /revoke nickName - remove user (prereq. private channel)
 * /list - list of channel members
 *
 * /quit -
 * /kick nickName
 *
 * // Najprv parsovat, neskor zvalidovat kontext prikazy
 */

function isCommand(message: string) {
  if (message == null || message.length == 0) {
    return false;
  }
  return message[0] == "/";
}

interface CommandDef {
  argCount: number;
  call: CallableFunction;
}

export default defineComponent({
  setup(props, ctx) {
    const quasar = useQuasar();
    const router = useRouter();

    const messageText = ref("");
    const channel = useChannelAdapter();
    const userAdapter = useUserAdapter();

    const channelListAdapter = useChannelList();
    let icon = ref(false);

    async function selectChannel(channelId: number) {
      const reqChannel = await channelListAdapter.getChannel(channelId);
      if (reqChannel != undefined) {
        channel.setSelectedChannel(reqChannel);
        router.push(`/channel/${channelId}`);
      }
    }

    function commandShowChannelMembers(args: [string]) {
      icon.value = true;
    }

    async function commandJoin(args: string[]) {
      const channelType: ChannelType =
        args[args.length - 1] == "private" ? "private" : "public";

      let channelName = "";
      if (channelType == "private") {
        channelName = args.slice(0, args.length - 1).join(" ");
      } else {
        channelName = args.slice(0, args.length).join(" ");
      }

      // TODO: validate max. message length
      const requestedChannel = channelListAdapter.getChannelByName(channelName);
      const currentUser: User = userAdapter.getCurrentUser();

      let errMessage = null;
      // Create a new channel
      if (requestedChannel == null) {
        channelListAdapter.addChannel(channelName, channelType, currentUser);
        quasar.notify({
          type: "positive",
          message: `Creating channel \"${channelName}\"`,
        });

        const createdChannel = channelListAdapter.getChannelByName(channelName);
        if (createdChannel != null) {
          await selectChannel(createdChannel?.id);
        }
        return;
      } else if (requestedChannel.type != "public") {
        errMessage = `Could not join to requested channel because \"${channelName}\" is not a public channel.`;
      } else if (requestedChannel.hasMember(currentUser.nickname)) {
        errMessage = `User \"${currentUser.nickname}\" is already a member of channel \"${requestedChannel.name}\".`;
      } else if (requestedChannel.hasMemberBanned(currentUser.nickname)) {
        errMessage = `User \"${currentUser.nickname}\" is banned from channel <${requestedChannel.name}>,`;
        // Add user to channel
      } else {
        requestedChannel.users.push(currentUser);
        quasar.notify({
          type: "positive",
          message: `Adding user \"${currentUser.nickname}\" to channel <${channelName}>`,
        });
        selectChannel(requestedChannel.id);
        return;
      }
      quasar.notify({
        type: "negative",
        message: errMessage,
      });
    }

    async function commandCancel(args: string[]) {
      const user: User = userAdapter.getCurrentUser();
      let message = "";

      if (
        channel.selectedChannel != null &&
        channel.selectedChannel.admin != null
      ) {
        if (channel.selectedChannel?.admin.id == user.id) {
          channelListAdapter.removeChannel(channel.selectedChannel);
          message = `Removing channel \"${channel.selectedChannel.name}\"`;
        } else {
          channelListAdapter.removeUserFromChannel(
            user,
            channel.selectedChannel
          );
          message = `Removing user from channel \"${channel.selectedChannel.name}\"`;
        }
        quasar.notify({
          type: "positive",
          message: message,
        });
      }
    }

    // správca môže kanál zatvoriť/zrušiť príkazom /quit
    function commandQuit(args: string[]) {
      const user: User = userAdapter.getCurrentUser();

      if (channel.selectedChannel != null) {
        if (user.id === channel.selectedChannel.admin.id) {
          quasar.notify({
            type: "positive",
            message: `Removing channel \"${channel.selectedChannel.name}\"`,
          });
        } else {
          quasar.notify({
            type: "negative",
            message: `Non admin user is not allowed to remove channel`,
          });
        }
      }
    }

    // do verejného kanála môže člen kanála pozvať iného používateľa príkazom /invite nickName
    function commandInvite(args: string[]) {
      const user: User = userAdapter.getCurrentUser();
      const nickname: string = args[0];
      if (channel.selectedChannel == null) {
        return;
      }

      const currentChannelAdmin: User = channel.selectedChannel.admin;
      // if user is not channel admin
      if (
        currentChannelAdmin.id != user.id &&
        channel.selectedChannel.type === "private"
      ) {
        quasar.notify({
          type: "negative",
          message: `User has not a permission to invite other users to channel.`,
        });
        return;
      }

      // TODO: verify if user exist
      // TODO: send user invite message
      if (channel.selectedChannel.hasMember(nickname)) {
        quasar.notify({
          type: "negative",
          message: `\"${user.nickname}\" is already a member of the current channel`,
        });
        return;
      }

      quasar.notify({
        type: "positive",
        message: `Inviting ${nickname} to current channel.`,
      });
    }

    const commandDefs: { [id: string]: CommandDef } = {
      list: {
        argCount: 0,
        call: commandShowChannelMembers,
      },
      cancel: {
        argCount: 0,
        call: commandCancel,
      },
      revoke: {
        argCount: 1,
        call: () => console.log("revoke"),
      },
      quit: {
        argCount: 0,
        call: commandQuit,
      },
      kick: {
        argCount: 1,
        call: () => console.log("kick"),
      },
      invite: {
        argCount: 1,
        call: commandInvite,
      },
      join: {
        argCount: 1, // 1 is optional
        call: commandJoin,
      },
    };

    function parseMessage(message: string) {
      if (message.length == 1) {
        return null;
      }
      let parsedMessage: string[] = message.split(" ");
      const messageArgCount = parsedMessage.length - 1;
      const command: string = parsedMessage[0].slice(1);
      if (command in commandDefs) {
        // if (commandDefs[command].argCount != messageArgCount) {
        //   console.log(`Error in command <${command}>: invalid parameters`);
        //   return;
        // }
        parsedMessage.shift();
        commandDefs[command].call(parsedMessage);
      }
      return;
    }

    function getChannelUsers() {
      return channel.selectedChannel?.users;
    }

    function handleSubmit(event: Event) {
      event.preventDefault();
      const message = messageText.value.trim();
      if (message.length == 0) {
        return;
      }
      if (isCommand(message)) {
        parseMessage(message);
      } else {
        channel.sendMessage(message);
      }
      messageText.value = "";
    }
    return { messageText, handleSubmit, icon, getChannelUsers };
  },
  components: { ChannelUser },
});
</script>
