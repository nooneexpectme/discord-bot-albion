// Imports
import { CommandBase, Client } from '@tanuki/discord-bot-base'
import { Storage } from '../../storage'
import fetch from 'node-fetch'
import { RichEmbed } from 'discord.js'
import * as moment from 'moment'

// Constants
const GAMEINFO_URL = 'https://gameinfo.albiononline.com/api/gameinfo/events?limit=51'

// GlobalRankingCommand
module.exports = class GlobalDeadsCommand extends CommandBase {
    public client: Client
    public interval: number = null
    public lastRefresh: moment.Moment = moment()
    public alreadyAdded: number[] = []
    
    constructor(client: Client) {
        super(client, {
            group: 'global',
            name: 'deads',
            description: null,
            channelIds: client.shared.get('config').parameters.limitToChannels
        })
    }

    public async load(): Promise<void> {
        this.alreadyAdded = this.client.shared.get('deadsAlreadyAdded') || []
        const { deads } = this.client.shared.get('config').parameters
        await this.refreshGameDeaths()
        this.interval = setInterval(() => this.refreshGameDeaths(), deads.requestInterval)
    }

    public async unload(): Promise<void> {
        this.client.shared.set('deadsAlreadyAdded', this.alreadyAdded)
        clearInterval(this.interval)
        this.interval = null
    }

    public async run(msg, { type }) {
        const storage: Storage = this.client.shared.get('storage')
        const guilds: any[] = await storage.guildsFocus.findAll({
            order: [
                [ 'kills', 'DESC' ]
            ],
            limit: 25
        })
        this.lastRefresh.isUtc()
        const embed = new RichEmbed()
            .setColor('#D48F3C')
            .setTimestamp()
            .setTitle('Liste des guildes qui nous focus')
            .setDescription([
                'Dernier raffraîchissement: ' + this.lastRefresh.format('DD/MM/YYYY HH:mm:ss'),
                null,
                ...guilds.map(guild => `\`[${guild.allianceName || '-'}] ${guild.guildName}\` ${guild.kills} morts`)
            ])
        
        return msg.channel.send({ embed })
    }

    private async refreshGameDeaths(): Promise<any[]> {
        const req = await fetch(GAMEINFO_URL)
        const kills: Kill[] = await req.json()
        const { deads } = this.client.shared.get('config').parameters
        const ourGuild = deads.guildName.toLowerCase().trim()

        const guilds: any = {}

        for (const kill of kills) {
            const victimGuild = String(kill.Victim.GuildName).toLowerCase().trim()
            if (victimGuild === ourGuild && kill.Type === 'KILL' && !this.alreadyAdded.includes(kill.EventId)) {
                this.alreadyAdded.push(kill.EventId)
                const killerGuild = String(kill.Killer.GuildName)
                if (!guilds[killerGuild]) {
                    const allianceName = String(kill.Killer.AllianceName)
                    guilds[killerGuild] = { allianceName, kills: 0 }
                }
                guilds[killerGuild].kills++
            }
        }

        const storage: Storage = this.client.shared.get('storage')
        this.lastRefresh = moment().utcOffset(120)
        return Promise.all(Object.keys(guilds).map(async (guildName) => {
            const guild: any = guilds[guildName]
            const [ guildFocus, isCreated ]: [ any, boolean ] = await storage.guildsFocus.findOrCreate({
                where: { guildName },
                defaults: guild
            })
            if (!isCreated) {
                await guildFocus.update({
                    kills: guildFocus.kills + guild.kills,
                    allianceName: guild.allianceName 
                })
            }
        }))
    }
}

// Interface
interface Kill {
    groupMemberCount: number
    numberOfParticipants: number
    EventId: number
    TimeStamp: string
    Version: number
    Killer: Player
    Victim: Player
    TotalVictimKillFame: number
    Location: any
    Participants: any
    GroupMembers: any
    GvGMatch: any
    BattleId: number
    Type: string
}

interface Player {
    AverageItemPower: number
    Equipment: PlayerEquipment
    Inventory: any[]
    Name: string
    Id: string
    GuildName: string
    GuildId: string
    AllianceName: string
    AllianceId: string
    AllianceTag: string
    Avatar: string
    AvatarRing: string
    DeathFame: number
    KillFame: number
    FameRatio: number
    LifetimeStatistics: any
}

interface PlayerEquipment {
    MainHand: PlayerEquipmentItem
    OffHand: PlayerEquipmentItem
    Head: PlayerEquipmentItem
    Armor: PlayerEquipmentItem
    Shoes: PlayerEquipmentItem
    Bag: PlayerEquipmentItem
    Cape: PlayerEquipmentItem
    Mount: PlayerEquipmentItem
    Potion: PlayerEquipmentItem
    Food: PlayerEquipmentItem
}

interface PlayerEquipmentItem {
    Type: string
    Count: number
    Quality: number
    ActiveSpells: any[]
    PassiveSpells: any[]
}