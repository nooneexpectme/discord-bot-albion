// Variables
const RegExValidator = /(\d+)/

// Type
export default async function RoleType(roleTag: string) {
    return RegExValidator.test(roleTag)
        ? roleTag.match(RegExValidator)[0]
        : null
}