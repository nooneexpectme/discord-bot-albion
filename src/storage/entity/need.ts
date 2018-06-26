import { INTEGER } from 'sequelize'

export const table = 'need'

export const structure = {
    tierFirst: {
        type: INTEGER,
        allowNull: false
    },
    tierSecond: {
        type: INTEGER,
        allowNull: false
    },
    tierThird: {
        type: INTEGER,
        allowNull: false
    },
    tierFourth: {
        type: INTEGER,
        allowNull: false
    },
    tierFifth: {
        type: INTEGER,
        allowNull: false
    },
    tierSixth: {
        type: INTEGER,
        allowNull: false
    },
    tierSeventh: {
        type: INTEGER,
        allowNull: false
    },
    tierEighth: {
        type: INTEGER,
        allowNull: false
    }
}
