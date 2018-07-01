import * as Sequelize from 'sequelize'

import * as DonationEntity from './entity/donation'
import * as JobEntity from './entity/job'
import * as ResourceEntity from './entity/resource'
import * as UserEntity from './entity/user'
import * as NeedEntity from './entity/need'
import * as EventEntity from './entity/event'
import * as GuildsFocusEntity from './entity/guildsFocus'

export class Storage {
    public db: Sequelize.Sequelize

    public donation: Sequelize.Model<{}, {}>
    public job: Sequelize.Model<{}, {}>
    public resource: Sequelize.Model<{}, {}>
    public user: Sequelize.Model<{}, {}>
    public need: Sequelize.Model<{}, {}>
    public event: Sequelize.Model<{}, {}>
    public guildsFocus: Sequelize.Model<{}, {}>

    constructor(sequelizeSettings) {
        this.db = new Sequelize(sequelizeSettings)

        // Base tables
        this.donation = this.db.define(DonationEntity.table, DonationEntity.structure)
        this.job = this.db.define(JobEntity.table, JobEntity.structure)
        this.resource = this.db.define(ResourceEntity.table, ResourceEntity.structure)
        this.user = this.db.define(UserEntity.table, UserEntity.structure)
        this.need = this.db.define(NeedEntity.table, NeedEntity.structure)
        this.event = this.db.define(EventEntity.table, EventEntity.structure)
        this.guildsFocus = this.db.define(GuildsFocusEntity.table, GuildsFocusEntity.structure)

        // Associations
        this.need.belongsTo(this.resource)
        this.resource.belongsTo(this.job)
        this.donation.belongsTo(this.resource, { foreignKey: { allowNull: true } })
        this.donation.belongsTo(this.user)
        this.user.belongsTo(this.job)
    }

    public async logIn(): Promise<void> {
        await this.db.authenticate()
    }

    public async regenDefaultTables(): Promise<void> {
        // Reset database
        await this.db.sync({ force: true })

        // Set jobs
        const jobs: any[] = await Promise.all([
            this.job.create({ name: 'Bûcheron', tierMin: 1, tierMax: 8 }),
            this.job.create({ name: 'Mineur', tierMin: 2, tierMax: 8 }),
            this.job.create({ name: 'Chasseur', tierMin: 1, tierMax: 8 }),
            this.job.create({ name: 'Piocheur', tierMin: 2, tierMax: 8 }),
            this.job.create({ name: 'Herboriste', tierMin: 2, tierMax: 8 }),
            this.job.create({ name: 'Pêcheur', tierMin: 2, tierMax: 8 })
        ])

        // Set resources
        const resources: any[] = await Promise.all([
            this.resource.create({ name: 'Bois', jobId: jobs[0].id }),
            this.resource.create({ name: 'Pierre', jobId: jobs[1].id }),
            this.resource.create({ name: 'Peau', jobId: jobs[2].id }),
            this.resource.create({ name: 'Minerai', jobId: jobs[3].id }),
            this.resource.create({ name: 'Fibre', jobId: jobs[4].id }),
            this.resource.create({ name: 'Poisson', jobId: jobs[5].id })
        ])

        // Init weekly needs
        const weeklyNeeds = await Promise.all(resources.map(resource => {
            return this.need.create({
                resourceId: resource.id,
                tierFirst: 0,
                tierSecond: 0,
                tierThird: 0,
                tierFourth: 0,
                tierFifth: 0,
                tierSixth: 0,
                tierSeventh: 0,
                tierEighth: 0
            })
        }))
    }
}
