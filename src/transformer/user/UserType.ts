// Imports
import { Storage } from '../../storage'

// Constants
const USER_ID_REGEX = /(\d+)/

// Method
export default async function UserType(arg: string) {
    if (!USER_ID_REGEX.test(arg)) return null
    const [, discordId] = USER_ID_REGEX.exec(arg)
    const storage: Storage = this.shared.get('storage')
    return storage.user.findOne({ where: { discordId } })
}