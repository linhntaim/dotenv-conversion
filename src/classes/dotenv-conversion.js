const NUMBER_REGEX = /^[+-]?\d+(\.\d+)?(e[+-]?\d+)?$/i

export default class DotEnvConversion
{
    constructor() {
        this.defaultOptions = {
            methods: {
                auto(value) {
                    if (!value) {
                        return value
                    }

                    const vCased = value.toLowerCase().trim()
                    switch (true) {
                        case vCased === 'null':
                            return this.null()
                        case ['true', 'false', 'yes', 'no'].includes(vCased):
                            return this.bool(value)
                        case NUMBER_REGEX.test(vCased):
                            return this.number(value)
                        case vCased.startsWith('raw:'):
                            return this.raw(value.substr(4))
                        case vCased.startsWith('bool:'):
                            return this.bool(value.substr(5))
                        case vCased.startsWith('number:'):
                            return this.number(value.substr(7))
                        case vCased.startsWith('array:'):
                            return this.array(value.substr(6))
                        case vCased.startsWith('json:'):
                            return this.json(value.substr(5))
                        default:
                            return this.json(value)
                    }
                },
                raw(value) {
                    return value
                },
                null() {
                    return ''
                },
                bool(value) {
                    if (!value) {
                        return false
                    }
                    value = value.toLowerCase().trim()
                    return !['', 'false', 'nan', 'no', 'not', 'none', 'null', 'undefined'].includes(value)
                        && (!NUMBER_REGEX.test(value) || parseFloat(value) !== 0)
                },
                number(value) {
                    if (!value) {
                        return 0
                    }
                    value = parseFloat(value)
                    return isNaN(value) ? 0 : value
                },
                array(value) {
                    if (!value) {
                        return []
                    }
                    return (() => {
                        const values = []
                        let c = 0
                        value.split('\\,')
                            .map(v => v.split(','))
                            .forEach(vs => {
                                vs.forEach((v, i) => {
                                    i ? values.push(v) : (c && !i ? values[values.length - 1] += ',' + v : values.push(v))
                                })
                                c = values.length
                            })
                        return values
                    })()
                },
                json(value) {
                    if (!value) {
                        return {}
                    }
                    try {
                        return JSON.parse(value)
                    }
                    catch (e) {
                        return value
                    }
                },
            },
            specs: {},
            prevents: [],
        }
        this.options = {}
        this.env = {}
    }

    setOptions(options = {}) {
        const override = options.override ? options.override : null
        delete options.override

        this.options = Object.assign({}, this.defaultOptions, options)
        if (override) {
            Object.assign(this.options.methods, override)
        }

        return this
    }

    make(dotenvConfigOutput = {}, options = {}) {
        this.setOptions(options)

        this.env = {}

        const parsed = 'parsed' in dotenvConfigOutput ? dotenvConfigOutput.parsed : {}
        for (const name in parsed) {
            parsed[name] = this.convert(name, parsed[name])
        }

        const ignoreProcessEnv = 'ignoreProcessEnv' in dotenvConfigOutput ? dotenvConfigOutput.ignoreProcessEnv : false
        const environment = process.env
        if (ignoreProcessEnv) {
            for (const name in environment) {
                this.env[name] = name in parsed ? parsed[name] : this.convert(name, environment[name])
            }
        }
        else {
            for (const name in environment) {
                const value = name in parsed ? parsed[name] : this.convert(name, environment[name])
                this.env[name] = value
                environment[name] = ['boolean', 'number', 'string'].includes(typeof value) ? value : JSON.stringify(value)
            }
        }

        return dotenvConfigOutput
    }

    convert(name, value) {
        if (this.options.prevents.includes(name)) {
            return value
        }

        const method = name in this.options.specs ? this.options.specs[name] : 'auto'
        switch (typeof method) {
            case 'string':
                if (method in this.options.methods) {
                    return this.options.methods[method](value)
                }
                return value
            case 'function':
                return method(value)
            default:
                return value
        }
    }

    getenv(name = null, def = null) {
        return name ? (name in this.env ? this.env[name] : def) : this.env
    }
}
