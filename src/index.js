/* region env-utils */

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
 */

const NUMBER_REGEX = /^[+-]?((\d+(\.(\d*)?)?)|(\.\d+))(e[+-]?\d+)?$/i
const BIGINT_REGEX = /^[+-]?\d+n$/
const SYMBOL_REGEX = /^Symbol\(.*\)$/
const ARRAY_REGEX = /^\[.*\]$/
const OBJECT_REGEX = /^\{.*\}$/
const NULL_VALUES = [
    'null', 'Null', 'NULL',
]
const UNDEFINED_VALUES = [
    'undefined', 'UNDEFINED',
]
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
const INFINITY_VALUES = ['Infinity', '-Infinity', '+Infinity']

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
 * @param {string} value String with `[` and `]`
 * @returns {array}
 */
function parseArray(value) {
    try {
        return JSON.parse(value)
    }
    catch (e) {
        value = value.slice(1, -1) // remove [ and ]

        const items = []
        if (value.trim()) {
            const groupStarts = ['"', '\'', '`', 'Symbol(', '[', '{']
            const groupEnds = ['"', '\'', '`', ')', ']', '}']
            let groupIndex = -1
            let groupStack = []
            value.split(',').forEach(item => {
                const lTrimmed = item.replace(/^\s+/, '')
                const startIndex = groupStarts.findIndex(s => {
                    return lTrimmed.substring(0, s.length) === s
                })
                if (startIndex !== -1) { // group start found
                    if (groupIndex !== -1) { // group start already found before
                        throw 'Invalid array format'
                    }
                    groupIndex = startIndex
                    groupStack.push(lTrimmed.substring(groupStarts[groupIndex].length))
                }

                const rTrimmed = item.replace(/\s+$/, '')
                const endIndex = groupEnds.findIndex(s => {
                    return rTrimmed.slice(-s.length) === s
                })
                if (endIndex !== -1) { // group end found
                    if (endIndex !== groupIndex) { // not match current group
                        throw 'Invalid array format'
                    }
                    // let's end
                    if (startIndex === -1) {
                        groupStack.push(rTrimmed.slice(0, -groupEnds[groupIndex].length))
                    }
                    else { // end immediately
                        groupStack[0] = groupStack[0].replace(/\s+$/, '').slice(0, -groupEnds[groupIndex].length)
                    }
                    switch (groupIndex) {
                        case 3: // symbol
                            items.push(Symbol(groupStack.join(',')))
                            break
                        case 4: // array group
                            items.push(parseArray(`[${groupStack.join(',')}]`))
                            break
                        case 5: // object group
                            items.push(parseObject(`{${groupStack.join(',')}`))
                            break
                        default:
                            items.push(groupStack.join(','))
                            break
                    }
                    // then reset stack
                    groupIndex = -1
                    groupStack = []
                    return
                }

                if (startIndex !== -1) {
                    return
                }

                if (groupIndex !== -1) {
                    groupStack.push(item)
                    return
                }

                const v = restoreValue(item.trim(), false)
                if (typeof v === 'string') {
                    if (ARRAY_REGEX.test(v)) {
                        items.push(parseArray(v.slice(1, -1)))
                        return
                    }
                    if (OBJECT_REGEX.test(v)) {
                        items.push(parseObject(v.slice(1, -1)))
                        return
                    }
                }
                items.push(v)
            })
            if (groupIndex !== -1) { // group not completely parsed
                throw 'Invalid array format'
            }
        }
        return items
    }
}

/**
 *
 * @param {string} value String with `{` and `}`
 * @returns {object}
 */
function parseObject(value) {
    return JSON.parse(value)
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

        case [...NAN_VALUES, ...INFINITY_VALUES].includes(trimmed):
        case NUMBER_REGEX.test(trimmed):
            return Number(trimmed)

        case BIGINT_REGEX.test(trimmed):
            return BigInt(trimmed.slice(0, -1))

        case SYMBOL_REGEX.test(trimmed):
            return Symbol(trimmed.slice(7, -1))

        case ARRAY_REGEX.test(trimmed):
            try {
                return parseArray(trimmed)
            }
            catch (e) {
                return value
            }

        case OBJECT_REGEX.test(trimmed):
            try {
                return parseObject(trimmed)
            }
            catch (e) {
                return value
            }

        default:
            if (!trimmed) {
                return value
            }
            try {
                return parseArray(`[${trimmed}]`)
            }
            catch (e) {
                try {
                    return parseObject(`{${trimmed}}`)
                }
                catch (e) {
                    return value
                }
            }
    }
}

/**
 * Handle values which are not friendly with `JSON.stringify`
 *
 * @param {null|undefined|boolean|number|bigint|string|symbol|array|object} value
 * @returns {null|boolean|number|string|array|object}
 */
function beforeJsonStringify(value) {
    switch (true) {
        case typeof value === 'undefined':
            return 'undefined'

        case Number.isNaN(value):
        case value === Infinity:
        case value === -Infinity:
            return value.toString()

        case typeof value === 'bigint':
        case value instanceof BigInt:
            return `${value.toString()}n`

        case typeof value === 'symbol':
            return value.toString()

        case value instanceof Array:
            return value.map(i => beforeJsonStringify(i))

        case value instanceof Object:
            Object.keys(value).forEach(k => value[k] = beforeJsonStringify(value[k]))
            return value

        default:
            return value
    }
}

/**
 * Remove double quotes wrapping for values which are not friendly with `JSON.stringify` in the json string result
 *
 * @param {string} json
 * @returns {string}
 */
function afterJsonStringify(json) {
    return json
        .replaceAll('"undefined"', 'undefined')
        .replaceAll('"NaN"', 'NaN')
        .replaceAll('"Infinity"', 'Infinity')
        .replaceAll('"-Infinity"', '-Infinity')
        .replaceAll(/"([+-]?\d+n)"/g, '$1')
        .replaceAll(/"Symbol\(((?!\)").)*\)"/g, matched => {
            return `Symbol(${matched.slice(8, -2).replaceAll('\\"', '"')})`
        })
}

/**
 *
 * @param {null|undefined|boolean|number|bigint|string|symbol|array|object} value
 * @returns {string}
 */
function flattenValue(value) {
    const typeOf = typeof value

    switch (true) {
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
            // `JSON.stringify` can wrap value with double quotes.
            // E.g. `JSON.stringify(new Date)` will result a string looks like `'"2023-..."'`.
            // We surely want the string to be without the double quotes. (Don't we?)
            // But currently, the code won't reach that case.
            // So we do not need to handle it now.
            return afterJsonStringify(JSON.stringify(beforeJsonStringify(value)))
    }
}

/* endregion */

const INTEGER_REGEX = /^[+-]?\d+$/
const FORCING_FALSE_VALUES = [
    ...FALSE_VALUES,
    ...NULL_VALUES,
    ...UNDEFINED_VALUES,
    ...NAN_VALUES,
]

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
                if (!value) {
                    return false
                }
                return !FORCING_FALSE_VALUES.includes(value)
                    && ((isNumber, isBigInt) => {
                        return (!isNumber && !isBigInt)
                            || (isNumber && Number(value) !== 0)
                            || (isBigInt && BigInt(value.slice(0, -1)) !== 0n)
                    })(NUMBER_REGEX.test(value), BIGINT_REGEX.test(value))
            },
            number(value) {
                value = value.trim()
                if (!value) {
                    return 0
                }
                if (TRUE_VALUES.includes(value)) {
                    return 1
                }
                if (FORCING_FALSE_VALUES.includes(value)) {
                    return 0
                }
                value = Number.parseFloat(value)
                return Number.isNaN(value) ? 0 : value
            },
            bigint(value) {
                value = value.trim()
                if (!value) {
                    return 0n
                }
                if (TRUE_VALUES.includes(value)) {
                    return 1n
                }
                if (FORCING_FALSE_VALUES.includes(value)) {
                    return 0n
                }
                if (INFINITY_VALUES.includes(value)) {
                    return 0n
                }
                if (INTEGER_REGEX.test(value)) {
                    return BigInt(value)
                }
                if (BIGINT_REGEX.test(value)) {
                    return BigInt(value.slice(0, -1))
                }
                value = Number.parseFloat(value)
                switch (true) {
                    case Number.isNaN(value):
                        return 0n
                    case Number.isInteger(value):
                        return BigInt(value)
                    default:
                        return BigInt(Number.parseInt(value))
                }
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
                let trimmed = value.trim()
                if (!trimmed) {
                    return []
                }
                if (!ARRAY_REGEX.test(trimmed)) {
                    trimmed = `[${trimmed}]`
                }
                try {
                    return JSON.parse(trimmed)
                }
                catch (e) {
                    try {
                        return parseArray(trimmed.slice(1, -1))
                    }
                    catch (e) {
                        return this.string(value)
                    }
                }
            },
            object(value) {
                const trimmed = value.trim()
                if (!trimmed) {
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
