// Imports
import { Client, CommandBase } from '@tanuki/discord-bot-base'
import { Message, TextChannel, Client as DJSClient, User } from 'discord.js'
import { Storage } from '../../storage'
import { generateString } from '../../service/generateString'
import { eventEmbed } from '../../embed/event'
import * as moment from 'moment'

// Command
module.exports = class EventCreateCommand extends CommandBase {
    public client: Client
    public timeouts: NodeJS.Timer[] = []

    constructor(client: Client) {
        super(client, {
            group: 'events',
            name: 'event-create',
            description: 'Créer un nouvel événement',
            userIds: client.settings.ownerIds,
            channelIds: client.shared.get('config').parameters.limitToChannels,
            args: [
                {
                    name: 'date',
                    type: arg => moment(arg, 'DD/MM/YYYY HH:mm'),
                    validator: arg => {
                        return !arg.isValid()
                        ? [ false, 'Invalid date supplied instead of `DD/MM/YYYY HH:mm`' ]
                        : [ true, null ]
                    }
                },
                { name: 'name', type: String },
                { name: 'description', type: String }
            ]
        });
    }

    public async load(): Promise<void> {
        const storage: Storage = this.client.shared.get('storage')
        const events: any[] = await storage.event.findAll()
        await Promise.all(events.map(event => this.handleEventTimeout(event)))
    }

    public async unload(): Promise<void> {
        for (const timeout of this.timeouts) {
            clearTimeout(timeout)
        }
        this.timeouts = []
    }

    public async run(msg: Message, { date, name, description }) {
        const storage: Storage = this.client.shared.get('storage')

        // 1. Create unique ref and register event in database
        const ref = generateString()
        const event: any = await storage.event.create({
            channelId: msg.channel.id,
            timestamp: date.unix(),
            ref, name, description
        })

        // 2. Create the RichEmbed
        const embed = eventEmbed(msg.author.client.user.avatarURL, name, description, date, ref)

        // 3. Send the RichEmbed and delete the default message
        const promises = [ msg.channel.send({ embed }) ]
        if (msg.deletable)
            promises.push(msg.delete())
        const [ confirmationMessage ] = await Promise.all(promises)

        // 5. Update the event with the right message id and handle event timeout
        await event.update({ messageId: (<Message> confirmationMessage).id })
        this.handleEventTimeout(event)
    }

    private async handleEventTimeout(event: any): Promise<void> {
        const { eventCreate } = this.client.shared.get('config').parameters
        const actualDate = moment()
        const eventDate = moment.unix(event.timestamp)
        const deadlineDates = this.getDeadlines(actualDate, eventDate, eventCreate.deadlines)
        if (deadlineDates.length === 0) return

        for (const deadlineDate of deadlineDates) {
            const timeout = setTimeout(() => {
                this.sendEventAlert(eventCreate.notifChannelId || event.channelId, event.messageId)
                    .catch(console.error)
            }, deadlineDate.diff(actualDate))
            this.timeouts.push(timeout)
        }
    }

    private getDeadlines(actualDate: moment.Moment, eventDate: moment.Moment, deadlines: number[]): moment.Moment[] {
        const accessibleDeadlines = []
        if (eventDate.isBefore(actualDate)) return accessibleDeadlines

        for (const deadline of deadlines) {
            const deadlineDate = moment(eventDate).subtract(deadline, 'seconds')
            if (deadlineDate.isAfter(actualDate)) {
                accessibleDeadlines.push(deadlineDate)
            }
        }

        return accessibleDeadlines
    }

    private async sendEventAlert(channelId: string, messageId: string): Promise<Message|Message[]> {
        // Retrieve the original message
        const channel: TextChannel = <TextChannel> (<DJSClient> this.client.discord).channels.get(channelId)
        if (!channel) return
        const message: Message = await channel.fetchMessage(messageId)
        if (!message) return

        // Construct the message url
        const messageUrl = [ 'https://discordapp.com/channels', message.guild.id, channel.id, message.id ].join('/')

        // Retrieve users who react to the message
        const users = await Promise.all(message.reactions.map(reaction => reaction.fetchUsers()))
        const usersToPrevent: string[] = []
        users.forEach(list => usersToPrevent.push(...list.map(user => user.id)))

        // Prevent users
        return channel.send([
            'Un événement auquel vous avez réagis va bientôt débuter.',
            messageUrl,
            usersToPrevent.map(userId => `<@${userId}>`).join(', ')
        ])
    }
}
