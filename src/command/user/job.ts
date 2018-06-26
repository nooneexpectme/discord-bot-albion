import { Client, CommandBase } from '@tanuki/discord-bot-base'
import { Message } from 'discord.js'
import { Storage } from '../../storage'

module.exports = class UserJobCommand extends CommandBase {
    public client: Client

    constructor(client: Client) {
        super(client, {
            group: 'user',
            name: 'job',
            description: 'Change votre métier et tier',
            channelIds: client.shared.get('config').parameters.limitToChannels,
            args: [
                { name: 'jobName', type: String },
                { name: 'tier', type: Number }
            ]
        })
    }

    public async run(msg: Message, { jobName, tier }) {
        const storage: Storage = this.client.shared.get('storage')

        // 1. Check if the job exists
        const job: any = await storage.job.findOne({ where: { name: jobName } })
        if (job === null) {
            const jobList = await storage.job.findAll().map((element: any) => '`' + element.name + '`')
            return await msg.reply(`le métier n'éxiste pas, veuillez en entrer un présent dans la liste suivante: ${jobList.join(', ')}.`)
        }

        // 2. Check if the tier is in the job's range
        if (tier < job.tierMin || tier > job.tierMax) {
            return await msg.reply(`le tier que vous avez indiqué est invalide, il doit être entre \`${job.tierMin}\` et \`${job.tierMax}\` pour votre métier.`)
        }

        // 3. Get, create or update the user in the database
        const [ user, isCreated ] = await storage.user.findOrCreate({
            where: { discordId: msg.author.id },
            defaults: { jobId: job.id, tier, points: 0 }
        })
        if (!isCreated) (<any> user).update({ jobId: job.id, tier })

        // 4. Update username of the user and reply
        await Promise.all([
            msg.member.setNickname(`${msg.author.username} [${tier}]`)
            .catch(() => msg.reply('impossible de modifier votre pseudonyme.')),
            msg.reply('votre status a été mis à jour.')
        ])
    }
}
