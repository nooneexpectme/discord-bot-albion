import { STRING, SMALLINT } from 'sequelize'

export const table = 'job'

export const structure = {
    name: {
        type: STRING,
        allowNull: false
    },
    tierMin: {
        type: SMALLINT,
        allowNull: false
    },
    tierMax: {
        type: SMALLINT,
        allowNull: false
    }
}
