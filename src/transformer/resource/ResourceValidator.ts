// Validator
export default function ResourceValidator(arg: any) {
    return !arg
        ? [ false, 'La ressource n\'éxiste pas.' ]
        : [ true, null ]
}