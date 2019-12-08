/**
 * Convert environment variables.
 *
 * @param {Object} dotenvConfig
 * @param {Object} config
 * @returns {{Object}}
 */
export const dotenvConversion = (dotenvConfig, config = {}) => {
    config = Object.assign({
        methods: {
            auto(value) {
                if (value.startsWith('bool:')) {
                    return this.bool(value.substr(5))
                }
                if (value.startsWith('number:')) {
                    return this.number(value.substr(7))
                }
                if (value.startsWith('array:')) {
                    return this.number(value.substr(7))
                }
                if (value === 'true' || value === 'false') {
                    return this.bool(value)
                }
                if (/^(\+|\-)?\d+(\.\d+)?(e\+\d)?$/i.test(value)) {
                    return this.number(value)
                }
                return value
            },
            bool(value) {
                value = value.toLowerCase()
                return value !== 'false'
                    && value !== ''
                    && value !== 'null'
                    && (!isNaN(value) || parseFloat(value) !== 0)
            },
            number(value) {
                return parseFloat(value) | 0
            },
        },
        specs: {},
    }, config)
    const environment = dotenvConfig.hasOwnProperty('ignoreProcessEnv') ? {} : process.env

    const convert = function (key, value) {
        const method = config.specs.hasOwnProperty(key) ? config.specs[key] : 'auto'
        switch (typeof method) {
            case 'string':
                if (config.methods.hasOwnProperty(method)) {
                    return config.methods[method](value)
                }
                return ''
            case 'function':
                return method(value)
            default:
                return ''
        }
    }

    for (let configKey in dotenvConfig.parsed) {
        dotenvConfig.parsed[configKey] = convert(configKey, dotenvConfig.parsed[configKey])
    }

    for (let processKey in environment) {
        environment[processKey] = convert(processKey, dotenvConfig.parsed[environment[processKey]])
    }

    return dotenvConfig
}