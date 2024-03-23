const validatePaylod = (body: any, fields: string[]): boolean => {
    if (!body) {
        return false
    }
    for (let i = 0; i < fields.length; i++) {
        if (!body[fields[i]]) return false
    }
    return false
}

const helper = { validatePaylod }
export default helper
