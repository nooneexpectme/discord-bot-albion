/**
 * You can hot-reload this file with the command
 * !update-config
 * Only parameters are refreshed
 */
const moment = require('moment')

// Client settings
module.exports.client = {
    ownerId: null,
    prefix: '!',
    token: null,
    throwErrorChannel: true,
    throwErrorPM: true
}

// Command list
module.exports.commands = [
    'admin/reload-config',
    'admin/register-loot',
    'event/create',
    'event/delete',
    'global/ranking',
    'global/rates',
    'global/deads',
    'user/job',
    'user/stats'
]

// Commands parameters
module.exports.parameters = {
    limitToChannels: [ null ],
    registerLoot: {
        minRate: 0.5
    },
    eventCreate: {
        deadlines: [
            60 * 60 * 24, // 24h
            60 * 60 * 2, // 2h
            60 * 30, // 30min
            60 * 10 // 10min
        ],
        notifChannelId: null
    },
    ranking: {
        display: 10,
        types: {
            week: {
                unix: () => moment().startOf('isoWeek').unix(),
                text: 'cette semaine'
            },
            global: {
                unix: () => 0,
                text: 'depuis le début'
            }
        }
    },
    stats: {
        weekPoints: 1500,
    },
    deads: {
        requestInterval: 1000 * 60 * 1,
        guildName: null
    }
}
