import envUtils from './env-utils'

const INTEGER_REGEX = /^[+-]?\d+$/

function defaultConfig() {
    return {
        parsed: {},
        ignoreProcessEnv: false,
        specs: {},
        prevents: [],
        methods: {
            auto(value) {
                if (value.startsWith('auto:')) {
                    value = value.substring(5)
                }
                value = envUtils.restoreValue(value)
                if (typeof value === 'string') {
                    const availableMethod = Object.keys(this).find(method => value.startsWith(`${method}:`))
                    if (availableMethod) {
                        value = this[availableMethod](value.substring(availableMethod.length + 1))
                    }
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
            num(value) {
                return this.number(value)
            },
            number(value) {
                value = value.trim()
                if (!value) {
                    return 0
                }
                value = parseFloat(value)
                return Number.isNaN(value) ? 0 : value
            },
            big(value) {
                return this.bigint(value)
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
            raw(value) {
                return value
            },
            symbol(value) {
                value = value.trim()
                if (!value) {
                    return Symbol()
                }
                const symbol = envUtils.SYMBOL_REGEX.test(value) ? value.slice(7, -1) : value
                try {
                    return Symbol(symbol)
                }
                catch (e) {
                    return value
                }
            },
            arr(value) {
                return this.array(value)
            },
            array(value) {
                value = value.trim()
                if (!value) {
                    return []
                }
                const arr = envUtils.ARRAY_REGEX.test(value) ? value : `[${value}]`
                try {
                    return JSON.parse(arr)
                }
                catch (e) {
                    return [value]
                }
            },
            obj(value) {
                return this.json(value)
            },
            json(value) {
                value = value.trim()
                if (!value) {
                    return {}
                }
                const json = envUtils.JSON_REGEX.test(value) ? value : `{${value}}`
                try {
                    return JSON.parse(json)
                }
                catch (e) {
                    return value
                }
            },
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
    return mergingConfig
}

function interpolate(name, value, config) {
    if (config.prevents.includes(name)) {
        return value
    }

    const method = name in config.specs ? config.specs[name] : 'auto'
    switch (typeof method) {
        case 'string':
            if (method in config.methods) {
                return config.methods[method](value)
            }
            return value
        case 'function':
            return method(value)
        default:
            return value
    }
}

function convert(config = {}) {
    config = mergeConfig(config)

    const environment = config.ignoreProcessEnv ? {} : process.env

    for (const configKey in config.parsed) {
        const value = Object.prototype.hasOwnProperty.call(environment, configKey)
            ? environment[configKey]
            : config.parsed[configKey]

        config.parsed[configKey] = interpolate(configKey, value, config)
    }

    for (const processKey in config.parsed) {
        environment[processKey] = envUtils.flattenValue(config.parsed[processKey])
    }

    return config
}

export default {convert}
