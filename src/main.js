const NUMBER_REGEX = /^(\+|\-)?\d+(\.\d+)?(e(\+|\-)?\d+)?$/i

/**
 * Convert environment variables.
 *
 * @param {Object} dotenvConfig
 * @param {Object} config
 * @returns {{Object}}
 */
const dotenvConversion = (dotenvConfig, config = {}) => {
    const override = config.override ? config.override : null
    delete config.override

    config = Object.assign({
        methods: {
            auto(value) {
                if (!value) return value

                const vCased = value.toLowerCase()

                if (vCased === 'null') {
                    return this.null()
                }
                if (vCased === 'true' || vCased === 'false') {
                    return this.bool(value)
                }
                if (NUMBER_REGEX.test(vCased)) {
                    return this.number(value)
                }
                if (vCased.startsWith('raw:')) {
                    return this.raw(value.substr(4))
                }
                if (vCased.startsWith('bool:')) {
                    return this.bool(value.substr(5))
                }
                if (vCased.startsWith('number:')) {
                    return this.number(value.substr(7))
                }
                if (vCased.startsWith('array:')) {
                    return this.array(value.substr(6))
                }
                if (vCased.startsWith('json:')) {
                    return this.json(value.substr(5))
                }
                return this.json(value)
            },
            raw(value) {
                return value
            },
            null() {
                return ''
            },
            bool(value) {
                value = value.toLowerCase()
                return value !== 'false'
                    && value !== ''
                    && value !== 'null'
                    && (!NUMBER_REGEX.test(value) || parseFloat(value) !== 0)
            },
            number(value) {
                value = parseFloat(value)
                return isNaN(value) ? 0 : value
            },
            array(value) {
                return value.split(/(?<!\\),/).map(v => v.replace(/\\,/, ','))
            },
            json(value) {
                try {
                    return JSON.parse(value)
                } catch (e) {
                    return value
                }
            },
        },
        specs: {},
        prevents: [],
    }, config)

    if (override) {
        Object.assign(config.methods, override)
    }

    const environment = dotenvConfig.hasOwnProperty('ignoreProcessEnv') ? {} : process.env

    const convert = function (key, value) {
        if (config.prevents.includes(key)) {
            return value
        }
        const method = config.specs.hasOwnProperty(key) ? config.specs[key] : 'auto'
        switch (typeof method) {
            case 'string':
                if (config.methods.hasOwnProperty(method)) {
                    return config.methods[method](value)
                }
                return value
            case 'function':
                return method(value)
            default:
                return value
        }
    }

    for (let configKey in dotenvConfig.parsed) {
        dotenvConfig.parsed[configKey] = convert(configKey, dotenvConfig.parsed[configKey])
    }

    for (let processKey in environment) {
        environment[processKey] = convert(processKey, environment[processKey])
    }

    return dotenvConfig
}

module.exports = dotenvConversion