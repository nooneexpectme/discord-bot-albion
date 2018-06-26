// Imports
import { Client, CommandBase } from '@tanuki/discord-bot-base'
import { Message, TextChannel } from 'discord.js'
import { Storage } from '../../storage'

// Command
module.exports = class EventDeleteCommand extends CommandBase {
    public client: Client

    constructor(client: Client) {
        super(client, {
            group: 'events',
            name: 'event-delete',
            description: 'Supprime un événement',
            args: [
                { name: 'ref', type: String }
            ]
        })
    }

    public async run(msg: Message, { ref }) {
        if (!this.client.shared.get('config').parameters.limitToChannels.includes(msg.channel.id))
            return
            
        const storage: Storage = this.client.shared.get('storage')

        // 1. Check if the event exists
        const event: any = await storage.event.find({ where: { ref } })
        if (event === null) return await msg.reply(`l'événement ayant pour référence \`${ref}\` n'éxiste pas.`)

        // 2. Delete it and send confirmation message
        const promises = [
            event.destroy(),
            msg.reply('l\'événement a été supprimé.')
        ]

        // 3. Search confirmation message and try to delete it
        const channel: TextChannel = <TextChannel> msg.guild.channels.get(event.channelId)
        if (channel) {
            const message: Message = channel.messages.get(event.messageId)
            if (message && message.deletable) {
                promises.push(message.delete())
            }
        }

        return await Promise.all(promises)
    }
}
