import { STRING, TINYINT } from 'sequelize'

export const table = 'user'

export const structure = {
    discordId: {
        type: STRING,
        allowNull: false
    },
    tier: {
        type: TINYINT,
        allowNull: false
    }
}
