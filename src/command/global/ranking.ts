// Imports
import { CommandBase, Client } from '@tanuki/discord-bot-base'
import { Storage } from '../../storage'
import { Op, fn, col } from 'sequelize'
import { User } from 'discord.js'

// GlobalRankingCommand
module.exports = class GlobalRankingCommand extends CommandBase {
    public client: Client
    
    constructor(client: Client) {
        super(client, {
            group: 'global',
            name: 'ranking',
            description: 'Retourne le classement des joueurs ayant le plus de points.',
            channelIds: client.shared.get('config').parameters.limitToChannels,
            args: [
                { name: 'type', type: String, isOptional: true }
            ]
        })
    }

    public async run(msg, { type }) {
        // Base informations
        const { ranking } = this.client.shared.get('config').parameters
        const rankingType = ranking.types[type] || ranking.types['week']
        const storage: Storage = this.client.shared.get('storage')

        // Retrieve donations
        const donations: any[] = await storage.donation.findAll({
            attributes: [ 'userId', [ fn('SUM', col('points')), 'totalPoints' ] ],
            where: { timestamp: { [Op.gt]: rankingType.unix() } },
            group: [ 'userId' ],
            limit: ranking.display
        })

        // Retrieve discord user ids
        const users: any[] = await storage.user.findAll({
            attributes: [ 'id', 'discordId' ],
            where: { [Op.or]: donations.map(donation => ({ id: donation.userId })) }
        })

        // Retrieve discord users
        const discordUsers: User[] = await Promise.all(users.map(user => this.client.discord.fetchUser(user.discordId)))
        
        const botIdToDiscordUser: { [userId: string]: User } = {}
        for (const { id, discordId } of users)
            botIdToDiscordUser[id] = discordUsers.find(du => du.id === discordId)

        // Ranking
        const response = []
        response.push(`:trophy: **Classement des ${ranking.display} plus gros contributeurs ${rankingType.text}** :trophy:`, null)
        
        for (const donationIndex in donations) {
            const donation = donations[donationIndex]
            const user = botIdToDiscordUser[donation.userId]

            const userDisplay = user.username + '#' + user.discriminator
            const totalPoints = donation.dataValues.totalPoints
            const medal = this.getRankingMedal(parseInt(donationIndex))

            response.push(`:${medal}: \`${userDisplay}\` ${totalPoints} points`)
            if (parseInt(donationIndex) === 2)
                response.push(null)
        }

        if (response.length === 2)
            response.push('```Le classement est encore vide pour le moment, soyez le premier à y apparaître!```')

        return msg.channel.send(response)
    }

    private getRankingMedal(position: number): string {
        return position === 0 ? 'first_place'
        : position === 1 ? 'second_place'
        : position === 2 ? 'third_place'
        : 'medal'
    }
}
