import { ChannelAdapter } from "src/model/Channel";
import { Router } from "vue-router";
import { ChannelListAdapter } from "src/model/ChannelList";
import { User, UserAdapter } from "src/model/User";
import { ChannelType } from "src/model/Channel";
import { QVueGlobals } from "quasar";
import DialogChannelUsers from "src/components/DialogChannelUsers.vue";


export default class CommandParser {
  public router: Router;
  public channel: ChannelAdapter;
  public userAdapter: UserAdapter;
  public quasar: QVueGlobals;
  public channelListAdapter: ChannelListAdapter;
  public message = ''

  constructor(
    router: Router,
    channel: ChannelAdapter,
    userAdapter: UserAdapter,
    channelListAdapter: ChannelListAdapter,
    quasar: QVueGlobals
    )
    {
    this.router = router
    this.channel = channel
    this.userAdapter = userAdapter
    this.channelListAdapter = channelListAdapter
    this.quasar = quasar
  }

  public isCommand(message: string): boolean {
    if (message == null || message.length == 0) {
      return false;
    }
    return message[0] == "/";
  }

  public parse(message: string) {
    this.message = message
    const args = message.split(" ");

    const command: string = args[0].slice(1);
    args.shift();
    this.processCommand(command, args)
  }

  private processCommand(command: string, args: string[]) {
    switch (command) {
      case 'list': {
        if (this.channel.selectedChannel == null) {
          return
        }
        this.commandShowChannelMembers()
        break
      }
      case 'cancel': {
        this.commandCancel()
        break
      }
      case 'quit': {
        this.commandQuit()
        break
      }
      case 'invite': {
        // if (this.channel.selectedChannel != null) {
        //   this.channel.selectedChannel.admin = this.userAdapter.getCurrentUser()
        // }
        this.commandInvite(args)
        break
      }
      case 'join': {
        this.commandJoin(args)
        break
      }
      case 'revoke': {
        // TODO: vymazat z restrictedListu po kicknuti
        this.commandRevoke(args)
        break
      }
      case 'kick': {
        // if (this.channel.selectedChannel != null) {
        //   this.channel.selectedChannel.admin = this.userAdapter.getCurrentUser()
        // }
        this.commandKick(args)
        break
      }
      default: {
        console.log('Invalid command');
      }
    }
  }

  private async selectChannel(channelId: number) {
    const reqChannel = await this.channelListAdapter.getChannel(channelId);
    if (reqChannel != undefined) {
      this.channel.setSelectedChannel(reqChannel);
      this.router.push(`/channel/${channelId}`);
    }
  }

  private async commandJoin(args: string[]) {
    const channelType: ChannelType =
      args[args.length - 1] == "private" ? "private" : "public";

    let channelName = "";
    // TODO: validate max. channel length
    if (channelType == "private") {
      channelName = args.slice(0, args.length - 1).join(" ");
    } else {
      channelName = args.slice(0, args.length).join(" ");
    }
    const requestedChannel = this.channelListAdapter.getChannelByName(channelName);
    const currentUser: User = this.userAdapter.getCurrentUser();

    let errMessage = null;
    // Create a new channel
    if (requestedChannel == null) {
      // TODO: try create a channel
      const newChannel = await this.channelListAdapter.addChannel(
        channelName,
        channelType,
        currentUser
      );
      if (newChannel == null) {
        // TODO: user message
        return;
      }
      console.log(this.channelListAdapter.channels);

      this.quasar.notify({
        type: "positive",
        html: true,
        message: `Creating channel <strong>${channelName}</strong>`,
      });

      await this.selectChannel(newChannel?.id);
      // TODO: catch error and print message
      return;
    } else if (requestedChannel.type != "public") {
      errMessage = `You could not join to requested channel because <strong>${channelName}</strong> is not a public channel.`;
    } else if (this.channel.isMember(currentUser.nickname)) {
      errMessage = `You are <strong>${currentUser.nickname}</strong> already a member of channel <strong>${requestedChannel.name}</strong>.`;
    } else if (this.channel.isMemberBanned(currentUser.nickname)) {
      errMessage = `<strong>${currentUser.nickname}</strong> is banned from channel <strong>${requestedChannel.name}</strong>.`;
      // Add user to channel
    } else {
      requestedChannel.users.push(currentUser);

      this.quasar.notify({
        type: "positive",
        html: true,
        message: `Adding user <strong>${currentUser.nickname}</strong> to channel <strong>${channelName}</strong>`,
      });
      await this.selectChannel(requestedChannel.id);
      return;
    }
    this.quasar.notify({
      type: "negative",
      html: true,
      message: errMessage,
    });
  }
 // partialy
  private async commandCancel() {
    const user: User = this.userAdapter.getCurrentUser();
    let message = "";
    // TODO: throw
    if (
      this.channel.selectedChannel != null &&
      this.channel.selectedChannel.admin != null
    ) {
      if (this.channel.selectedChannel?.admin.id == user.id) {
        // await this.channelListAdapter.quitChannel(this.channel.selectedChannel.id);
        message = `Removing channel <strong>${this.channel.selectedChannel.name}</strong>`;
      } else {
        await this.channel.removeUser(user.nickname);
        message = `Removing user from channel <strong>${this.channel.selectedChannel.name}</strong>`;
      }
      this.quasar.notify({
        type: "positive",
        html: true,
        message: message,
      });
    }
  }

  private async commandKick(args: string[]) {
    const banInitiator: User = this.userAdapter.getCurrentUser();
    const targetUserNickname = args[0]
    await this.channel.banMember(banInitiator, targetUserNickname)
  }

  private async commandRevoke(args: string[]) {
    const currentUser: User = this.userAdapter.getCurrentUser();
    const nickname = args[0]

    if (this.channel.selectedChannel == null) {
      return
    }

    if (this.channel.selectedChannel.type === "public") {
      this.quasar.notify({
        type: 'negative',
        message: 'This command should be invoked only in public channels'
      })
      return
    }

    if (!this.channel.isMemberAdmin(currentUser.nickname)) {
      this.quasar.notify({
        type: 'negative',
        message: 'Your are not allowed to add user to this channel'
      })
      return
    }

    await this.channel.removeUser(nickname)
  }

  private async commandShowChannelMembers() {
    this.quasar.dialog({
      component: DialogChannelUsers,

      componentProps: {
        channelUsers: this.channel.selectedChannel?.users,
      }
    })
  }

  /**
   * Allow admin of the channel to leave his channel. After that,
   * the channel will be destroyed.
   */
  // partialy
  private async commandQuit() {
    if (this.channel.selectedChannel == null) {
      return
    }
    const user: User = this.userAdapter.getCurrentUser();
    await this.channelListAdapter.quitChannel(this.channel.selectedChannel.id, user)
    this.router.push(`/`);

    // if (this.channel.selectedChannel != null) {
    //   if (user.id === this.channel.selectedChannel.admin.id) {
    //     this.quasar.notify({
    //       type: "positive",
    //       html: true,
    //       message: `Channel <strong>${this.channel.selectedChannel.name}</strong> was removed"`,
    //     });
    //   } else {
    //     this.quasar.notify({
    //       type: "negative",
    //       message: `You do not have a permission to remove channel`,
    //     });
    //   }
    // }
  }

   // TODO: vymazat zoznam uzivatel v restrictedList
  private commandInvite(args: string[]) {
    const user: User = this.userAdapter.getCurrentUser();
    const nickname: string = args[0];
    if (this.channel.selectedChannel == null) {
      return;
    }
    this.channel.inviteMember(user, nickname)
  }
}
