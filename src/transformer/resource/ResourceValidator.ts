// Validator
export default function ResourceValidator(arg: any) {
    return !arg
        ? [ false, 'Resource not found' ]
        : [ true, null ]
}