// Validator
export default async function RoleValidator(role: any) {
    return role ? [ true, null ] : [ false, 'Le rôle n\'éxiste pas.' ]
}