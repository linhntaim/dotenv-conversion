const NUMBER_REGEX = /^(\+|\-)?\d+(\.\d+)?(e(\+|\-)?\d+)?$/i

class DotEnvConversion {
    constructor() {
        this.defaultConfig = {
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
                    if (!value) return false
                    value = value.toLowerCase()
                    return value !== 'false'
                        && value !== ''
                        && value !== 'null'
                        && (!NUMBER_REGEX.test(value) || parseFloat(value) !== 0)
                },
                number(value) {
                    if (!value) return 0
                    value = parseFloat(value)
                    return isNaN(value) ? 0 : value
                },
                array(value) {
                    if (!value) return []
                    return value.split(/(?<!\\),/).map(v => v.replace(/\\,/, ','))
                },
                json(value) {
                    if (!value) return {}
                    try {
                        return JSON.parse(value)
                    } catch (e) {
                        return value
                    }
                },
            },
            specs: {},
            prevents: [],
        }
        this.config = {}
        this.env = {}
    }

    setConfig(config = {}) {
        const override = config.override ? config.override : null
        delete config.override

        this.config = Object.assign({}, this.defaultConfig, config)
        if (override) {
            Object.assign(this.config.methods, override)
        }

        return this
    }

    make(dotenvConfig, config = {}) {
        this.setConfig(config)

        this.env = {}

        for (let name in dotenvConfig.parsed) {
            dotenvConfig.parsed[name] = this.convert(name, dotenvConfig.parsed[name])
        }

        const ignoreProcessEnv = dotenvConfig.hasOwnProperty('ignoreProcessEnv')
        const environment = process.env
        if (ignoreProcessEnv) {
            for (let name in environment) {
                const value = dotenvConfig.parsed.hasOwnProperty(name) ?
                    dotenvConfig.parsed[name] : this.convert(name, environment[name])
                this.env[name] = value
            }
        } else {
            for (let name in environment) {
                const value = dotenvConfig.parsed.hasOwnProperty(name) ?
                    dotenvConfig.parsed[name] : this.convert(name, environment[name])
                this.env[name] = value
                environment[name] = ['boolean', 'number', 'string'].includes(typeof value) ? value : JSON.stringify(value)
            }
        }

        return dotenvConfig
    }

    convert(name, value) {
        if (this.config.prevents.includes(name)) {
            return value
        }

        const method = this.config.specs.hasOwnProperty(name) ? this.config.specs[name] : 'auto'
        switch (typeof method) {
            case 'string':
                if (this.config.methods.hasOwnProperty(method)) {
                    return this.config.methods[method](value)
                }
                return value
            case 'function':
                return method(value)
            default:
                return value
        }
    }

    getenv(name) {
        return this.env.hasOwnProperty(name) ? this.env[name] : ''
    }
}

module.exports = DotEnvConversion