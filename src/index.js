import envUtils from './env-utils'

const INTEGER_REGEX = /^[+-]?\d+$/

function defaultConfig() {
    return {
        parsed: {},
        ignoreProcessEnv: false,
        specs: {},
        prevents: [],
        methods: {
            auto(value, name, config) {
                if (value.startsWith('auto:')) {
                    value = value.substring(5)
                }
                value = envUtils.restoreValue(value)
                if (typeof value === 'string') {
                    const findMethod = methods => methods.find(method => value.startsWith(`${method}:`))
                    // find in available
                    let foundMethod = findMethod(Object.keys(this))
                    let refMethod = foundMethod
                    if (!foundMethod) {
                        // find in aliases
                        foundMethod = findMethod(Object.keys(config.methodAliases))
                        if (foundMethod) {
                            refMethod = (method => method in this ? method : undefined)(config.methodAliases[foundMethod])
                        }
                    }
                    return refMethod
                        ? this[refMethod](value.substring(foundMethod.length + 1))
                        : this.string(value)
                }
                return value
            },
            bool(value) {
                value = value.trim()
                if (!value) {
                    return false
                }
                return !['false', 'False', 'FALSE',
                        'no', 'No', 'NO',
                        'null', 'Null', 'NULL',
                        'undefined', 'UNDEFINED',
                        'NaN',
                        'not', 'Not', 'NOT',
                        'none', 'None', 'NONE']
                        .includes(value)
                    && ((isNumber, isBigInt) => {
                        return (!isNumber && !isBigInt)
                            || (isNumber && Number(value) !== 0)
                            || (isBigInt && BigInt(value.slice(0, -1)) !== 0n)
                    })(envUtils.NUMBER_REGEX.test(value), envUtils.BIGINT_REGEX.test(value))
            },
            number(value) {
                value = value.trim()
                if (!value) {
                    return 0
                }
                value = parseFloat(value)
                return Number.isNaN(value) ? 0 : value
            },
            bigint(value) {
                value = value.trim()
                if (!value) {
                    return 0n
                }
                if (INTEGER_REGEX.test(value)) {
                    return BigInt(value)
                }
                if (envUtils.BIGINT_REGEX.test(value)) {
                    return BigInt(value.slice(0, -1))
                }
                value = parseFloat(value)
                switch (true) {
                    case Number.isNaN(value):
                        return 0n
                    case Number.isInteger(value):
                        return BigInt(value)
                    default:
                        return BigInt(parseInt(value))
                }
            },
            string(value) {
                return value
            },
            symbol(value) {
                const trimmed = value.trim()
                if (!trimmed) {
                    return Symbol()
                }
                try {
                    return Symbol(
                        envUtils.SYMBOL_REGEX.test(trimmed)
                            ? trimmed.slice(7, -1)
                            : trimmed,
                    )
                }
                catch (e) {
                    return this.string(value)
                }
            },
            array(value) {
                const trimmed = value.trim()
                if (!trimmed) {
                    return []
                }
                try {
                    return JSON.parse(
                        envUtils.ARRAY_REGEX.test(trimmed)
                            ? trimmed
                            : `[${trimmed}]`,
                    )
                }
                catch (e) {
                    return this.string(value)
                }
            },
            json(value) {
                const trimmed = value.trim()
                if (!trimmed) {
                    return {}
                }
                try {
                    return JSON.parse(
                        envUtils.JSON_REGEX.test(trimmed)
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
            num: 'number',
            big: 'bigint',
            str: 'string',
            obj: 'json',
        },
    }
}

function mergeConfig(config = {}) {
    const mergingConfig = defaultConfig()
    const update = (name, type = null) => {
        if (name in config) {
            switch (type) {
                case 'merge':
                    Object.assign(mergingConfig[name], config[name])
                    break
                case 'insert':
                    mergingConfig[name] = Object.assign({}, config[name], mergingConfig[name])
                    break
                default:
                    mergingConfig[name] = config[name]
                    break
            }
        }
    }
    update('parsed')
    update('ignoreProcessEnv')
    update('specs')
    update('prevents')
    update('methods', 'merge')
    update('methodAliases', 'insert')
    return mergingConfig
}

function convertValue(value, name, config) {
    if (config.prevents.includes(name)) {
        return value
    }

    const method = name in config.specs ? config.specs[name] : 'auto'
    switch (typeof method) {
        case 'string':
            if (method in config.methods) {
                return config.methods[method](value, name, config)
            }
            if (method in config.methodAliases) {
                const refMethod = config.methodAliases[method]
                if (refMethod in config.methods) {
                    return config.methods[refMethod](value, name, config)
                }
            }
            return config.methods.string(value, name, config)
        case 'function':
            return method(value, name, config)
        default:
            return config.methods.string(value, name, config)
    }
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
        environment[processKey] = envUtils.flattenValue(config.parsed[processKey])
    }

    return config
}

export default {convert}
