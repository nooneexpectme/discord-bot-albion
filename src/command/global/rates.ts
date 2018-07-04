// Imports
import { Client, CommandBase } from '@tanuki/discord-bot-base'
import { Storage } from '../../storage'

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
module.exports = class AdminRatesCommand extends CommandBase {
    public client: Client

    constructor(client: Client) {
        super(client, {
            group: 'global',
            name: 'rates',
            description: 'Renvois la liste des ratios des ressources dont on a besoin',
            channelIds: client.shared.get('config').parameters.limitToChannels
        });
    }

    public async run(msg) {
        const storage: Storage = this.client.shared.get('storage')
        const { registerLoot } = this.client.shared.get('config').parameters

        const [ needs, resources ]: any[] = await Promise.all([
            storage.need.findAll(),
            storage.resource.findAll()
        ])

        const result = []
        const noRates = []
        result.push(`:zap: | Les ratios non indiqués sont tous égaux au ratio minimal qui est \`${registerLoot.minRate}\`.`, null)
        
        for (const need of needs) {
            const title = '**' + resources.find(resource => resource.id === need.resourceId).name + '**'
            const needsTotal = Object.values(TIER_TO_STRING).map(tier => need[tier]).reduce((a, b) => a + b)
            const rates = []
            for (const tierIndex in TIER_TO_STRING) {
                const tier = TIER_TO_STRING[tierIndex]
                const rate = Math.max(registerLoot.minRate, (need[tier] / Math.max(1, needsTotal)) * parseInt(tierIndex))
                if (rate > registerLoot.minRate)
                    rates.push(`T${tierIndex} \`${rate.toFixed(2)}\``)
            }
            if (rates.length === 0) noRates.push(title)
            else result.push(title + ' | ' + rates.join(' - '))
        }

        if (noRates.length === needs.length) result[1] = '```Toutes les ressources ont actuellement un ratio au minimum.```'
        else result.push(null, `Les ressources ${noRates.join(', ')} ont actuellement un ratio au minimum.`)
        
        return msg.channel.send(result)
    }
}
