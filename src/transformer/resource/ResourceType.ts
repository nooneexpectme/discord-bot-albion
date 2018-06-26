// Imports
import { Storage } from '../../storage'

// Type
export default async function ResourceType(arg: any) {
    const storage: Storage = this.shared.get('storage')
    return storage.resource.findOne({ where: { name: arg } })
}