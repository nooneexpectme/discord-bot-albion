import { STRING, INTEGER } from 'sequelize'

export const table = 'event'

export const structure = {
    ref: {
        type: STRING,
        allowNull: false
    },
    name: {
        type: STRING,
        allowNull: false
    },
    description: {
        type: STRING,
        allowNull: false
    },
    timestamp: {
        type: INTEGER,
        allowNull: false
    },
    channelId: {
        type: STRING,
        allowNull: true
    },
    messageId: {
        type: STRING,
        allowNull: true
    }
}
