// Imports
import { CommandBase, Client } from '@tanuki/discord-bot-base'
import { Storage } from '../../storage'
import { Message, RichEmbed, GuildMember } from 'discord.js'
import * as moment from 'moment'

// Transformers
import UserType from '../../transformer/user/UserType'
import UserValidator from '../../transformer/user/UserValidator'

// UserStatsCommand
module.exports = class UserStatsCommand extends CommandBase {
    public client: Client

    constructor(client: Client) {
        super(client, {
            group: 'user',
            name: 'stats',
            description: 'Affiche vos statistiques',
            args: [
                { name: 'user', type: UserType, validator: UserValidator, isOptional: true }
            ]
        })
    }

    public async run(msg: Message, { user }) {
        if (!this.client.shared.get('config').parameters.limitToChannels.includes(msg.channel.id))
            return

        // Base informations
        const { ranking, stats } = this.client.shared.get('config').parameters
        const startOfWeekTimestamp = ranking.types.week.unix()
        const storage: Storage = this.client.shared.get('storage')

        // Database queries
        if (!user) {
            user = await storage.user.findOne({ where: { discordId: msg.author.id } })
            if (!user)
                return msg.reply('please use the `!job` command at first.')
        }
        const userDiscord: GuildMember = !user ? msg.guild.members.get(msg.author.id) : await msg.guild.fetchMember(user.discordId)

        const [ donations, job ]: any[] = await Promise.all([
            storage.donation.findAll({ where: { userId: user.id } }),
            storage.job.findById(user.jobId)
        ])

        // Advanced informations
        const userName = userDiscord.user.username + '#' + userDiscord.user.discriminator
        const userJoin = moment(userDiscord.joinedAt).format('DD/MM/YYYY HH:mm')
        const userAvatar = userDiscord.user.avatarURL

        const totalDonations = donations.length
        let totalResources = 0
        let totalPoints = 0
        let weekDonations = 0
        let weekResources = 0
        let weekPoints = 0

        for (const donation of donations) {
            totalResources += donation.amount
            totalPoints += donation.points
            if (donation.timestamp >= startOfWeekTimestamp) {
                weekDonations += 1
                weekResources += donation.amount
                weekPoints += donation.points
            }
        }

        // Build rich embed
        const embed = new RichEmbed()
            .setThumbnail(userAvatar)
            .setColor('#42A5F5')
            .setTitle(`Statistiques de ${userName}`)
            .setDescription(`Vous avez effectué \`${totalDonations} donations\` d'un total de \`${totalResources} ressources\` depuis votre arrivée (\`${totalPoints} points\`) contre \`${weekDonations} donations\` d'un total de \`${weekResources} ressources\` cette semaine (\`${weekPoints} points\`).`)
            .setTimestamp()
            // Global informations
            .addField('Arrivée sur le serveur', userJoin, false)
            // User informations
            .addField('Métier', job.name, true)
            .addField('Tier', user.tier, true)
            .addField('Objectif restant de la semaine', Math.max(0, stats.weekPoints - weekPoints) + ` (+${Math.max(0, weekPoints - stats.weekPoints)}) points`)

        return msg.channel.send({ embed })
    }
}
