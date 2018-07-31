import { Client, CommandBase } from '@tanuki/discord-bot-base'
import { Message } from 'discord.js'
import { Storage } from '../../storage'
import { Op } from 'sequelize'

import JobType from '../../transformer/job/JobType'
import JobValidator from '../../transformer/job/JobValidator'

module.exports = class UserJobCommand extends CommandBase {
    public client: Client

    constructor(client: Client) {
        super(client, {
            group: 'user',
            name: 'job',
            description: 'Change votre métier et tier',
            channelIds: client.shared.get('config').parameters.limitToChannels,
            args: [
                { name: 'job', type: JobType, validator: JobValidator },
                { name: 'tier', type: Number }
            ]
        })
    }

    public async run(msg: Message, { job, tier }) {
        const storage: Storage = this.client.shared.get('storage')

        // 1. Check if the tier is in the job's range
        if (tier < job.tierMin || tier > job.tierMax) {
            return await msg.reply(`le tier que vous avez indiqué est invalide, il doit être entre \`${job.tierMin}\` et \`${job.tierMax}\` pour votre métier.`)
        }

        // 2. Get, create or update the user in the database
        const [ user, isCreated ] = await storage.user.findOrCreate({
            where: { discordId: msg.author.id },
            defaults: { jobId: job.id, tier, points: 0 }
        })
        if (!isCreated) (<any> user).update({ jobId: job.id, tier })

        // 3. Check if the user haven't an other job's role (and remove him)
        const userRoleIds = msg.member.roles.keyArray().filter(roleId => roleId != job.roleId)
        const oldJobs: any[] = await storage.job.findAll({
            attributes: [ 'roleId' ],
            where: { roleId: { [Op.or]: userRoleIds } }
        })
        const oldRoleIds = oldJobs.map(oldJob => oldJob.roleId)
        const updateRoles = msg.member.removeRoles(oldRoleIds)

        // 4. Update username and role of the user and reply
        const updateUsername = msg.member
            .setNickname(`${msg.author.username} [${tier}]`)
            .catch(() => msg.reply('impossible de modifier votre pseudonyme.'))

        const updateRole = msg.guild.roles.has(job.roleId)
            ? msg.member.addRole(msg.guild.roles.get(job.roleId)).catch(() => msg.reply('impossible de changer votre rôle.'))
            : msg.reply('le rôle lié au métier n\'est pas disponible.')

        await Promise.all([
            updateUsername,
            updateRole,
            updateRoles,
            msg.react('✅')
        ])
    }
}
