export const NUMBER_REGEX = /^[+-]?((\d+(\.(\d*)?)?)|(\.\d+))(e[+-]?\d+)?$/i
export const BIGINT_REGEX = /^[+-]?\d+n$/
export const SYMBOL_REGEX = /^Symbol\(.*\)$/
export const ARRAY_REGEX = /^\[.*\]$/
export const JSON_REGEX = /^\{.*\}$/
export const NULL_VALUES = ['null', 'Null', 'NULL']
export const UNDEFINED_VALUES = ['undefined', 'UNDEFINED']
export const TRUE_VALUES = ['true', 'True', 'TRUE', 'yes', 'Yes', 'YES']
export const FALSE_VALUES = ['false', 'False', 'FALSE', 'no', 'No', 'NO']
export const NAN_VALUES = ['NaN']
export const INFINITY_VALUES = ['Infinity', '-Infinity', '+Infinity']

function unescapeValue(value) {
    return value.replaceAll('\\"', '"').replaceAll('\\\\', '\\')
}

export function restoreValue(value, fromDotEnv = true) {
    switch (true) {
        case NULL_VALUES.includes(value):
            return null

        case UNDEFINED_VALUES.includes(value):
            return undefined

        case TRUE_VALUES.includes(value):
            return true
        case FALSE_VALUES.includes(value):
            return false

        case [...NAN_VALUES, ...INFINITY_VALUES].includes(value):
        case NUMBER_REGEX.test(value):
            return Number(value)

        case BIGINT_REGEX.test(value):
            return BigInt(value.slice(0, -1))

        default:
            if (fromDotEnv) {
                value = unescapeValue(value)
            }

            switch (true) {
                case SYMBOL_REGEX.test(value):
                    return Symbol(value.slice(7, -1))

                case ARRAY_REGEX.test(value):
                case JSON_REGEX.test(value):
                    try {
                        return JSON.parse(value)
                    }
                    catch (e) {
                        return value
                    }

                default:
                    return value
            }
    }
}

export function restoreValues(values, fromDotEnv = true) {
    const restoringValues = {}
    for (const key in values) {
        restoringValues[key] = restoreValue(values[key], fromDotEnv)
    }
    return restoringValues
}
