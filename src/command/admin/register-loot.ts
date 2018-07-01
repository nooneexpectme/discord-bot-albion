// Imports
import { Client, CommandBase } from '@tanuki/discord-bot-base'
import { Storage } from '../../storage'

// Transformers
import ResourceType from '../../transformer/resource/ResourceType'
import ResourceValidator from '../../transformer/resource/ResourceValidator'
import UserType from '../../transformer/user/UserType'
import UserValidator from '../../transformer/user/UserValidator'

// Constants
const TIER_TO_STRING = {
    1: 'tierFirst',
    2: 'tierSecond',
    3: 'tierThird',
    4: 'tierFourth',
    5: 'tierFifth',
    6: 'tierSixth',
    7: 'tierSeventh',
    8: 'tierEighth',
}

// Command
module.exports = class AdminRegisterLootCommand extends CommandBase {
    public client: Client

    constructor(client: Client) {
        super(client, {
            group: 'admin',
            name: 'register-loot',
            description: 'Met à jour les points du joueur sélectionné',
            args: [
                { name: 'user', type: UserType, validator: UserValidator },
                { name: 'resource', type: ResourceType, validator: ResourceValidator },
                { name: 'tier', type: Number },
                { name: 'amount', type: Number }
            ],
            userIds: client.settings.ownerIds
        });
    }

    public async run(msg, { user, resource, tier, amount }) {
        const storage: Storage = this.client.shared.get('storage')
        
        // Check user job
        if (user.jobId !== resource.jobId)
            return msg.reply('The resource that the user wants to register is not farmable by his job.')

        // Check user tier
        if (tier > user.tier)
            return msg.reply(`This user can only give \`${resource.name}\` greater than or equal to tier \`${user.tier}\`.`)

        // Retrieve our needs for this resource
        const needs: any = await storage.need.findOne({ where: { resourceId: resource.id } })
        if (!needs)
            return msg.reply('Fuck off, this error should never appear.')

        // Logic, Math.min in rate is for preventing the 0 / 0 = NaN
        const { registerLoot } = this.client.shared.get('config').parameters
        const tierString = TIER_TO_STRING[tier]
        const needsTotal = Object.values(TIER_TO_STRING).map(tierName => needs[tierName]).reduce((a, b) => a + b)
        const rate = Math.max(registerLoot.minRate, (needs[tierString] / Math.max(1, needsTotal)) * tier)
        const points = amount * rate

        // Add donation
        const create = await storage.donation.create({
            amount, points, tier,
            resourceId: resource.id,
            userId: user.id,
            timestamp: Date.now()
        })

        if (create !== null) {
            needs.update({
                [tierString]: Math.max(0, needs[tierString] - amount)
            })
        }

        return create !== null ? msg.react('✅') : null
    }
}
