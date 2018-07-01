// Imports
import { Client, CommandBase } from '@tanuki/discord-bot-base'
import { join } from 'path'

// Command
module.exports = class AdminReloadConfigCommand extends CommandBase {
    public client: Client

    constructor(client: Client) {
        super(client, {
            group: 'admin',
            name: 'reload-config',
            description: 'Met à jour la configuration du bot',
            userIds: client.settings.ownerIds
        });
    }

    public async run(msg) {
        const config = join(__dirname, '../../..', 'config')
        delete require.cache[require.resolve(config)]
        this.client.shared.set('config', require(config))
        return msg.react('✅')
    }
}
