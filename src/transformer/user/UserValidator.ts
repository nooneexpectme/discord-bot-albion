// Method
export default function UserValidator(arg: any) {
    return !arg
        ? [ false,  `L'utilisateur n'est pas enregistré dans la base de données.` ]
        : [ true, null ]
}