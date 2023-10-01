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
                    let foundMethod
                    // find in methods
                    foundMethod = findMethod(Object.keys(this))
                    if (foundMethod) {
                        return this[foundMethod](value.substring(foundMethod.length + 1))
                    }
                    // find in aliases
                    foundMethod = findMethod(Object.keys(config.methodAliases))
                    if (foundMethod) {
                        return this[config.methodAliases[foundMethod]](value.substring(foundMethod.length + 1))
                    }
                    return this.string(value)
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
            arr: 'array',
            obj: 'json',
        },
    }
}

function mergeConfig(config = {}) {
    const mergingConfig = defaultConfig()
    if ('parsed' in config) {
        mergingConfig.parsed = config.parsed
    }
    if ('ignoreProcessEnv' in config) {
        mergingConfig.ignoreProcessEnv = config.ignoreProcessEnv
    }
    if ('specs' in config) {
        mergingConfig.specs = config.specs
    }
    if ('prevents' in config) {
        mergingConfig.prevents = config.prevents
    }
    if ('methods' in config) {
        Object.assign(mergingConfig.methods, config.methods)
    }
    if ('methodAliases' in config) {
        for (const alias in config.methodAliases) {
            // not override existing alias
            if (alias in mergingConfig.methodAliases) {
                continue
            }
            // only add alias to existing methods
            const method = config.methodAliases[alias]
            if (method in mergingConfig.methods) {
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

    const method = name in config.specs ? config.specs[name] : 'auto'
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
