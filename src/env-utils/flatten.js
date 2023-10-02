import * as fs from 'fs'

export function flattenValue(value) {
    const typeOf = typeof value
    switch (true) {
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
         */

        case value === null:
        case typeOf === 'function':
            return 'null'

        case typeOf === 'undefined':
            return 'undefined'

        case typeOf === 'string':
            return value

        case typeOf === 'number':
        case value instanceof Number:
        case typeOf === 'boolean':
        case value instanceof Boolean:
        case typeOf === 'symbol':
        case value instanceof String:
            return value.toString()

        case typeOf === 'bigint':
        case value instanceof BigInt:
            return `${value.toString()}n`

        default:
            return (json => {
                return json.match(/^".*"$/)
                    ? json.slice(1, -1).replaceAll('\\"', '"')
                    : json
            })(JSON.stringify(value))
    }
}

export function flattenValues(values) {
    const flatteningValues = {}
    for (const key in values) {
        flatteningValues[key] = flattenValue(values[key])
    }
    return flatteningValues
}

function escapeValue(value) {
    if (/[\s#]+/.test(value)) {
        return `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
    }
    return value
}

function flatten(values) {
    let content = ''
    for (const key in values) {
        content += `${key}=${escapeValue(flattenValue(values[key]))}\n`
    }
    return content
}

export function flattenTo(values, file = '.env') {
    fs.writeFileSync(file, flatten(values))
}
