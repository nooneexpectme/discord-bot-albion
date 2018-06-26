// Imports
import { RichEmbed } from 'discord.js'

// Method
export function eventEmbed(
    thumbnailUrl: string,
    eventName: string,
    eventDescription: string,
    eventDate: Date,
    ref: string
): RichEmbed {
    return new RichEmbed()
        .setColor('#2980b9')
        .setThumbnail(thumbnailUrl)
        .setTimestamp()
        .setTitle(eventName)
        .setDescription(eventDescription)
        .addField('Date', eventDate)
        .setFooter(ref)
}
