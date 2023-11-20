import { QVueGlobals, useQuasar } from "quasar"
import DialogChannelUsers from "src/components/DialogChannelUsers.vue"
import { ChannelType } from "src/contracts/Channel"
import { User } from "src/contracts/User"
import { ChannelAdapter, useChannelAdapter } from "src/services/ChannelAdapter"
import { ChannelListAdapter, useChannelList } from "src/services/ChannelListAdapter"
import { UserAdapter, useUserAdapter } from "src/services/UserAdapter"
import { CommandError } from "src/services/errors"
import { Router, useRouter } from "vue-router"

export default class CommandParser {
  public router: Router
  public channel: ChannelAdapter
  public userAdapter: UserAdapter
  public quasar: QVueGlobals
  public channelListAdapter: ChannelListAdapter
  public message = ""

  constructor() {
    this.router = useRouter()
    this.channel = useChannelAdapter()
    this.userAdapter = useUserAdapter()
    this.channelListAdapter = useChannelList()
    this.quasar = useQuasar()
  }

  public isCommand(message: string): boolean {
    if (message == null || message.length == 0) {
      return false
    }
    return message[0] == "/"
  }

  public async parse(message: string) {
    this.message = message
    const args = message.split(" ")

    const command: string = args[0].slice(1)
    args.shift()
    const commandMessage = await this.processCommand(command, args)
    return commandMessage
  }

  private async processCommand(command: string, args: string[]) {
    let commandMessage: string | null = null
    switch (command) {
      case "list": {
        if (this.channel.selectedChannel == null) {
          throw new CommandError("This command could be only called inside channel")
        }
        commandMessage = await this.commandShowChannelMembers(args)
        break
      }
      case "cancel": {
        if (this.channel.selectedChannel == null) {
          throw new CommandError("This command could be only called inside channel")
        }
        commandMessage = await this.commandCancel(args)
        break
      }
      case "quit": {
        if (this.channel.selectedChannel == null) {
          throw new CommandError("This command could be only called inside channel")
        }
        commandMessage = await this.commandQuit(args)
        break
      }
      case "invite": {
        commandMessage = await this.commandInvite(args)
        break
      }
      case "join": {
        commandMessage = await this.commandJoin(args)
        break
      }
      case "revoke": {
        if (this.channel.selectedChannel == null) {
          throw new CommandError("This command could be only called inside channel")
        }
        commandMessage = await this.commandRevoke(args)
        break
      }
      case "kick": {
        if (this.channel.selectedChannel == null) {
          throw new CommandError("This command could be only called inside channel")
        }
        commandMessage = await this.commandKick(args)
        break
      }
      default: {
        throw new CommandError("Invalid command")
      }
    }
    return commandMessage
  }

  private async selectChannel(channelId: number) {
    const reqChannel = await this.channelListAdapter.getChannel(channelId)
    if (reqChannel != undefined) {
      this.channel.setSelectedChannel(reqChannel)
      this.router.push(`/channel/${channelId}`)
    }
  }

  private async commandJoin(args: string[]) {
    if (args.length == 0) {
      throw new CommandError("Invalid command")
    }
    const channelType: ChannelType =
      args[args.length - 1] == "private" ? "private" : "public"

    let channelName = ""
    // TODO: validate max. channel length
    if (channelType == "private") {
      channelName = args.slice(0, args.length - 1).join(" ")
    } else {
      channelName = args.slice(0, args.length).join(" ")
    }
    const response = await this.channelListAdapter.joinChannel(channelName, channelType)
    return `${response}`
  }

  private async commandCancel(args: string[]) {
    if (args.length != 0) {
      throw new CommandError("Invalid Command")
    }
    const user: User = this.userAdapter.getCurrentUser()
    if (
      this.channel.selectedChannel != null &&
      this.channel.selectedChannel.admin != null
    ) {
      const response = await this.channel.removeUser(this.channel.selectedChannel.id)
      this.router.push("/")
      return response
    }
    return null
  }

  private async commandKick(args: string[]) {
    if (args.length != 1) {
      throw new CommandError("Invalid command")
    }

    const targetUserNickname = args[0]
    const response = await this.channel.kick(targetUserNickname)
    return response
  }

  private async commandRevoke(args: string[]) {
    if (args.length != 1) {
      throw new CommandError("Invalid command")
    }
    const nickname = args[0]
    const response = this.channel.revoke(nickname)
    return response
  }

  private async commandShowChannelMembers(args: string[]) {
    if (args.length != 0) {
      throw new CommandError("Invalid command")
    }
    this.quasar.dialog({
      component: DialogChannelUsers,

      componentProps: {
        channelUsers: this.channel.selectedChannel!.users
      }
    })
    return null
  }

  /**
   * Allow admin of the channel to leave his channel. After that,
   * the channel will be destroyed.
   */
  private async commandQuit(args: string[]) {
    if (args.length != 0) {
      throw new CommandError("Invalid command")
    }
    if (this.channel.selectedChannel == null) {
      return null
    }
    console.log(this.channel.selectedChannel.id)

    const respose = await this.channelListAdapter.quitChannel(this.channel.selectedChannel.id)
    this.router.push("/")
    return respose
  }

  // TODO: vymazat zoznam uzivatel v restrictedList
  private async commandInvite(args: string[]) {
    if (args.length != 1) {
      throw new CommandError("Invalid command")
    }

    const user: User = this.userAdapter.getCurrentUser()
    const nickname: string = args[0]
    if (this.channel.selectedChannel == null) {
      return null
    }
    const message = await this.channel.inviteMember(user, nickname)
    return message
  }
}
