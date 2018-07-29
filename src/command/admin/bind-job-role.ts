// Imports
import { Client, CommandBase } from '@tanuki/discord-bot-base'
import { Storage } from '../../storage'

// Transformers
import JobType from '../../transformer/job/JobType'
import JobValidator from '../../transformer/job/JobValidator'

import RoleType from '../../transformer/role/RoleType'
import RoleValidator from '../../transformer/role/RoleValidator'
import { Message } from 'discord.js';

// Command
module.exports = class AdminGiveCommand extends CommandBase {
    public client: Client

    constructor(client: Client) {
        super(client, {
            group: 'admin',
            name: 'bind-job-role',
            description: 'Lie un rôle à un métier',
            userIds: client.settings.ownerIds,
            args: [
                { name: 'job', type: JobType, validator: JobValidator },
                { name: 'roleId', type: RoleType, validator: RoleValidator },
            ]
        });
    }

    public async run(msg: Message, { job, roleId }) {
        // Move users
        if (job.roleId !== null) {
            const users = msg.guild.members.filter(member => member.roles.has(job.roleId))
            const updates = []
            for (const user of users.values()) {
                const removeRole = user.removeRole(job.roleId)
                const addRole = user.addRole(roleId)
                updates.push(removeRole, addRole)
            }
        }

        // Update job group
        const update = await job.update({ roleId })
        return msg.react(update ? '✅' : ':x:')
    }
}
