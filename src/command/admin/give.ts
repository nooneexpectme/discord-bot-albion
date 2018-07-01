// Imports
import { Client, CommandBase } from '@tanuki/discord-bot-base'
import { Storage } from '../../storage'

// Transformers
import UserType from '../../transformer/user/UserType'
import UserValidator from '../../transformer/user/UserValidator'

// Command
module.exports = class AdminGiveCommand extends CommandBase {
    public client: Client

    constructor(client: Client) {
        super(client, {
            group: 'admin',
            name: 'give',
            description: 'Créer une nouvelle donation pour un utilisateur',
            userIds: client.settings.ownerIds,
            args: [
                { name: 'user', type: UserType, validator: UserValidator },
                { name: 'points', type: Number },
                { name: 'resources', type: Number, isOptional: true, default: 0 }
            ]
        });
    }

    public async run(msg, { user, points, resources }) {
        const storage: Storage = this.client.shared.get('storage')
        const create: any = await storage.donation.create({
            amount: resources,
            points,
            tier: 0,
            resourceId: null,
            userId: user.id,
            timestamp: Date.now()
        })

        return msg.react(create ? '✅' : ':x:')
    }
}
