// Method
export default async function UserValidator(arg: any) {
    return !arg
        ? [ false,  `The user is not registered in the the database.` ]
        : [ true, null ]
}