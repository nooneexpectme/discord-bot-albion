import { INTEGER, TINYINT } from 'sequelize'

export const table = 'donation'

export const structure = {
    amount: {
        type: INTEGER,
        allowNull: false
    },
    tier: {
        type: TINYINT,
        allowNull: false
    },
    points: {
        type: INTEGER,
        allowNull: false
    },
    timestamp: {
        type: INTEGER,
        allowNull: false
    }
}
