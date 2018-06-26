import { STRING, INTEGER } from 'sequelize'

export const table = 'guildsFocus'

export const structure = {
    allianceName: {
        type: STRING
    },
    guildName: {
        type: STRING,
        allowNull: false
    },
    kills: {
        type: INTEGER,
        allowNull: false
    }
}
