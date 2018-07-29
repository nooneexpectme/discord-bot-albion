// Imports
import { Storage } from '../../storage'

// Type
export default async function JobType(name: any) {
    const storage: Storage = this.shared.get('storage')
    return storage.job.findOne({ where: { name } })
}