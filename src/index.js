/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
 */

const NUMBER_REGEX = /^[+-]?((\d+(\.(\d*)?)?)|(\.\d+))([eE][+-]?\d+)?$/
// const NUM_INT_REGEX = /^[+-]?\d+$/
const NUM_BIN_REGEX = /^[+-]?0[bB][01]+$/
const NUM_OCT_REGEX = /^[+-]?0[oO][0-8]+$/
const NUM_HEX_REGEX = /^[+-]?0[xX][0-9a-fA-F]+$/
const BIG_INT_REGEX = /^[+-]?\d+n$/
const BIG_BIN_REGEX = /^[+-]?0[bB][01]+n$/
const BIG_OCT_REGEX = /^[+-]?0[oO][0-8]+n$/
const BIG_HEX_REGEX = /^[+-]?0[xX][0-9a-fA-F]+n$/
const SYMBOL_REGEX = /^Symbol\(.*\)$/
const SYMBOL_EMPTY_REGEX = /^Symbol\(\)$/
const ARRAY_REGEX = /^\[.*]$/
const ARRAY_EMPTY_REGEX = /^\[\s*]$/
const OBJECT_REGEX = /^\{.*}$/
const OBJECT_EMPTY_REGEX = /^\{\s*}$/

const NULL_VALUES = ['null', 'Null', 'NULL']
const UNDEFINED_VALUES = ['undefined', 'UNDEFINED']
const TRUE_VALUES = [
    'true', 'True', 'TRUE',
    'yes', 'Yes', 'YES',
    'ok', 'Ok', 'OK',
]
const FALSE_VALUES = [
    'false', 'False', 'FALSE',
    'no', 'No', 'NO',
    'not', 'Not', 'NOT',
    'none', 'None', 'NONE',
]
const NAN_VALUES = ['NaN']
const INFINITY_POSITIVE_VALUES = ['Infinity', '+Infinity']
const INFINITY_NEGATIVE_VALUES = ['-Infinity']

/**
 *
 * @param {string} value
 * @returns {string}
 */
function unescapeValue(value) {
    return value.replaceAll('\\"', '"').replaceAll('\\\\', '\\')
}

/**
 *
 * @param {string} value
 * @param {boolean} fromDotEnv
 * @returns {null|undefined|boolean|number|bigint|string|symbol|array|object}
 */
function restoreValue(value, fromDotEnv) {
    if (fromDotEnv) {
        value = unescapeValue(value)
    }
    const trimmed = value.trim()
    switch (true) {
        case NULL_VALUES.includes(trimmed):
            return null

        case UNDEFINED_VALUES.includes(trimmed):
            return undefined

        case TRUE_VALUES.includes(trimmed):
            return true
        case FALSE_VALUES.includes(trimmed):
            return false

        case NAN_VALUES.includes(trimmed):
            return Number.NaN
        case INFINITY_POSITIVE_VALUES.includes(trimmed):
            return Number.POSITIVE_INFINITY
        case INFINITY_NEGATIVE_VALUES.includes(trimmed):
            return Number.NEGATIVE_INFINITY
        case NUMBER_REGEX.test(trimmed):
        case NUM_BIN_REGEX.test(trimmed):
        case NUM_OCT_REGEX.test(trimmed):
        case NUM_HEX_REGEX.test(trimmed):
            return Number(trimmed)

        case BIG_INT_REGEX.test(trimmed):
        case BIG_BIN_REGEX.test(trimmed):
        case BIG_OCT_REGEX.test(trimmed):
        case BIG_HEX_REGEX.test(trimmed):
            return BigInt(trimmed.slice(0, -1))

        case SYMBOL_REGEX.test(trimmed):
            return Symbol(trimmed.slice(7, -1))

        case ARRAY_REGEX.test(trimmed):
        case OBJECT_REGEX.test(trimmed):
            try {
                return JSON.parse(trimmed)
            }
            catch (e) {
                return value
            }

        default:
            if (trimmed === '') {
                return value
            }
            try {
                return JSON.parse(`[${trimmed}]`)
            }
            catch (e) {
                try {
                    return JSON.parse(`{${trimmed}}`)
                }
                catch (e) {
                    return value
                }
            }
    }
}

/**
 *
 * @param {null|undefined|boolean|number|bigint|string|symbol|array|object|function} value
 * @returns {string}
 */
function flattenValue(value) {
    const typeOf = typeof value

    switch (true) {
        case value === null:
            return 'null'

        case typeOf === 'undefined':
        case typeOf === 'function':
        case value instanceof Function:
            return 'undefined'

        case typeOf === 'number':
        case value instanceof Number:
        case typeOf === 'boolean':
        case value instanceof Boolean:
        case value instanceof String:
        case typeOf === 'symbol':
        case value instanceof Symbol:
            return value.toString()

        case typeOf === 'bigint':
        case value instanceof BigInt:
            return `${value.toString()}n`

        case typeOf === 'string':
            return value

        default:
            try {
                return (str => {
                    if (str === undefined) {
                        return 'undefined'
                    }
                    return /^".*"$/.test(str) ? str.slice(1, -1) : str
                })(JSON.stringify(value))
            }
            catch (e) {
                return 'undefined'
            }
    }
}

function defaultConfig() {
    return {
        parsed: {},
        fromDotEnv: true,
        ignoreProcessEnv: false,
        prevents: [],
        specs: {},
        methods: {
            auto(value, name, config) {
                value = restoreValue(value, config.fromDotEnv)
                if (typeof value === 'string') {
                    const lTrimmed = value.replace(/^\s+/, '')
                    const findPossibleMethod = methods => methods.find(method => lTrimmed.startsWith(`${method}:`))
                    let possibleMethod
                    // find in methods
                    possibleMethod = findPossibleMethod(Object.keys(this))
                    if (possibleMethod) {
                        return this[possibleMethod](
                            lTrimmed.substring(possibleMethod.length + 1),
                            name,
                            config,
                        )
                    }
                    // find in aliases
                    possibleMethod = findPossibleMethod(Object.keys(config.methodAliases))
                    if (possibleMethod) {
                        return this[config.methodAliases[possibleMethod]](
                            lTrimmed.substring(possibleMethod.length + 1),
                            name,
                            config,
                        )
                    }
                    return this.string(value)
                }
                return value
            },
            boolean(value) {
                value = value.trim()
                if ([
                        '',
                        ...NULL_VALUES,
                        ...UNDEFINED_VALUES,
                        ...FALSE_VALUES,
                        ...NAN_VALUES,
                    ].includes(value)
                    || SYMBOL_EMPTY_REGEX.test(value)
                    || ARRAY_EMPTY_REGEX.test(value)
                    || OBJECT_EMPTY_REGEX.test(value)) {
                    return false
                }
                if ([
                        ...TRUE_VALUES,
                        ...INFINITY_POSITIVE_VALUES,
                        ...INFINITY_NEGATIVE_VALUES,
                    ].includes(value)
                    || SYMBOL_REGEX.test(value)) {
                    return true
                }
                if (NUMBER_REGEX.test(value)
                    || NUM_BIN_REGEX.test(value)
                    || NUM_OCT_REGEX.test(value)
                    || NUM_HEX_REGEX.test(value)) {
                    return Number(value) !== 0
                }
                if (BIG_INT_REGEX.test(value)
                    || BIG_BIN_REGEX.test(value)
                    || BIG_OCT_REGEX.test(value)
                    || BIG_HEX_REGEX.test(value)) {
                    return BigInt(value.slice(0, -1)) !== 0n
                }
                return true
            },
            number(value) {
                value = value.trim()
                if ([
                        '',
                        ...NULL_VALUES,
                        ...FALSE_VALUES,
                    ].includes(value)
                    || SYMBOL_EMPTY_REGEX.test(value)
                    || ARRAY_EMPTY_REGEX.test(value)
                    || OBJECT_EMPTY_REGEX.test(value)) {
                    return 0
                }
                if ([...UNDEFINED_VALUES, ...NAN_VALUES].includes(value)) {
                    return Number.NaN
                }
                if (TRUE_VALUES.includes(value)
                    || SYMBOL_REGEX.test(value)) {
                    return 1
                }
                if (INFINITY_POSITIVE_VALUES.includes(value)) {
                    return Number.POSITIVE_INFINITY
                }
                if (INFINITY_NEGATIVE_VALUES.includes(value)) {
                    return Number.NEGATIVE_INFINITY
                }
                if (NUMBER_REGEX.test(value)
                    || NUM_BIN_REGEX.test(value)
                    || NUM_OCT_REGEX.test(value)
                    || NUM_HEX_REGEX.test(value)) {
                    return Number(value)
                }
                if (BIG_INT_REGEX.test(value)
                    || BIG_BIN_REGEX.test(value)
                    || BIG_OCT_REGEX.test(value)
                    || BIG_HEX_REGEX.test(value)) {
                    return Number(value.slice(0, -1))
                }
                return (number => Number.isNaN(number) ? 0 : number)(Number.parseFloat(value))
            },
            bigint(value) {
                value = value.trim()
                if ([
                        '',
                        ...NULL_VALUES,
                        ...UNDEFINED_VALUES,
                        ...FALSE_VALUES,
                        ...NAN_VALUES,
                    ].includes(value)
                    || SYMBOL_EMPTY_REGEX.test(value)
                    || ARRAY_EMPTY_REGEX.test(value)
                    || OBJECT_EMPTY_REGEX.test(value)) {
                    return 0n
                }
                if ([...TRUE_VALUES, ...INFINITY_POSITIVE_VALUES].includes(value)
                    || SYMBOL_REGEX.test(value)) {
                    return 1n
                }
                if (INFINITY_NEGATIVE_VALUES.includes(value)) {
                    return -1n
                }
                if (NUMBER_REGEX.test(value)
                    || NUM_BIN_REGEX.test(value)
                    || NUM_OCT_REGEX.test(value)
                    || NUM_HEX_REGEX.test(value)) {
                    return BigInt(Math.trunc(Number(value)))
                }
                if (BIG_INT_REGEX.test(value)
                    || BIG_BIN_REGEX.test(value)
                    || BIG_OCT_REGEX.test(value)
                    || BIG_HEX_REGEX.test(value)) {
                    return BigInt(value.slice(0, -1))
                }
                return (number => Number.isNaN(number) ? 0n : BigInt(Math.trunc(number)))(Number.parseFloat(value))
            },
            string(value) {
                return value
            },
            symbol(value) {
                const trimmed = value.trim()
                if (SYMBOL_REGEX.test(trimmed)) {
                    return Symbol(trimmed.slice(7, -1))
                }
                return Symbol(value)
            },
            array(value) {
                const trimmed = value.trim()
                if (trimmed === '') {
                    return []
                }
                try {
                    return JSON.parse(
                        ARRAY_REGEX.test(trimmed)
                            ? trimmed
                            : `[${trimmed}]`,
                    )
                }
                catch (e) {
                    return this.string(value)
                }
            },
            object(value) {
                const trimmed = value.trim()
                if (trimmed === '') {
                    return {}
                }
                try {
                    return JSON.parse(
                        OBJECT_REGEX.test(trimmed)
                            ? trimmed
                            : `{${trimmed}}`,
                    )
                }
                catch (e) {
                    return this.string(value)
                }
            },
        },
        methodAliases: {
            bool: 'boolean',
            num: 'number',
            big: 'bigint',
            str: 'string',
            arr: 'array',
            obj: 'object',
        },
    }
}

function mergeConfig(config) {
    const mergingConfig = defaultConfig()
    if ('parsed' in config) {
        mergingConfig.parsed = config.parsed
    }
    if ('fromDotEnv' in config) {
        mergingConfig.fromDotEnv = config.fromDotEnv
    }
    if ('ignoreProcessEnv' in config) {
        mergingConfig.ignoreProcessEnv = config.ignoreProcessEnv
    }
    if ('prevents' in config) {
        mergingConfig.prevents = config.prevents
    }
    if ('specs' in config) {
        mergingConfig.specs = config.specs
    }
    if ('methods' in config) {
        Object.keys(config.methods).forEach(method => {
            if (!/^[\w.]+$/.test(method)) {
                throw 'Method: Invalid format'
            }
        })
        Object.assign(mergingConfig.methods, config.methods)
    }
    if ('methodAliases' in config) {
        for (const alias in config.methodAliases) {
            // not override existing alias
            if (alias in mergingConfig.methodAliases) {
                continue
            }
            // not use name of existing methods or aliases
            if (alias in mergingConfig.methods) {
                continue
            }
            // only add alias to existing methods
            const method = config.methodAliases[alias]
            if (method in mergingConfig.methods) {
                if (!/^[\w.]+$/.test(alias)) {
                    throw 'Alias: Invalid format'
                }
                mergingConfig.methodAliases[alias] = method
            }
        }
    }
    return mergingConfig
}

function convertValue(value, name, config) {
    if (config.prevents.includes(name)) {
        return value
    }

    if (name in config.specs) {
        const method = config.specs[name]
        switch (typeof method) {
            case 'string':
                if (method in config.methods) {
                    return config.methods[method](value, name, config)
                }
                if (method in config.methodAliases) {
                    return config.methods[config.methodAliases[method]](value, name, config)
                }
                return config.methods.string(value, name, config)
            case 'function':
                return method(value, name, config)
            default:
                return config.methods.string(value, name, config)
        }
    }

    return config.methods.auto(value, name, config)
}

function convert(config = {}) {
    config = mergeConfig(config)

    const environment = config.ignoreProcessEnv ? {} : process.env

    for (const configKey in config.parsed) {
        const value = Object.prototype.hasOwnProperty.call(environment, configKey)
            ? environment[configKey]
            : config.parsed[configKey]

        config.parsed[configKey] = convertValue(value, configKey, config)
    }

    for (const processKey in config.parsed) {
        environment[processKey] = flattenValue(config.parsed[processKey])
    }

    return config
}

export default {convert}
