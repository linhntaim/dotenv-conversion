import envUtils from './env-utils'

const INTEGER_REGEX = /^[+-]?\d+$/
const TRUE_VALUES = envUtils.TRUE_VALUES
const FALSE_VALUES = [
    ...envUtils.FALSE_VALUES,
    ...envUtils.NULL_VALUES,
    ...envUtils.UNDEFINED_VALUES,
    ...envUtils.NAN_VALUES,
    'not', 'Not', 'NOT',
    'none', 'None', 'NONE',
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
                value = envUtils.restoreValue(value, config.fromDotEnv)
                if (typeof value === 'string') {
                    const findPossibleMethod = methods => methods.find(method => value.startsWith(`${method}:`))
                    let possibleMethod
                    // find in methods
                    possibleMethod = findPossibleMethod(Object.keys(this))
                    if (possibleMethod) {
                        return this[possibleMethod](
                            value.substring(possibleMethod.length + 1),
                            name,
                            config,
                        )
                    }
                    // find in aliases
                    possibleMethod = findPossibleMethod(Object.keys(config.methodAliases))
                    if (possibleMethod) {
                        return this[config.methodAliases[possibleMethod]](
                            value.substring(possibleMethod.length + 1),
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
                return !FALSE_VALUES.includes(value)
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
                if (TRUE_VALUES.includes(value)) {
                    return 1
                }
                if (FALSE_VALUES.includes(value)) {
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
                if (TRUE_VALUES.includes(value)) {
                    return 1n
                }
                if (FALSE_VALUES.includes(value)) {
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
                return Symbol(
                    envUtils.SYMBOL_REGEX.test(trimmed)
                        ? trimmed.slice(7, -1)
                        : trimmed,
                )
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
            bool: 'boolean',
            num: 'number',
            big: 'bigint',
            str: 'string',
            arr: 'array',
            obj: 'json',
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
        environment[processKey] = envUtils.flattenValue(config.parsed[processKey])
    }

    return config
}

export default {convert}
