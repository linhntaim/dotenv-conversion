(function () {
    const dotenvConversion = require('./dist').convert

    // Currently, dotenv-flow does not export its `env_options` and `cli_options` methods.
    // So, we keep it simple here for now.
    const options = {}
    if ('NODE_ENV' in process.env) {
        options.node_env = process.env.NODE_ENV
    }
    const env = require('dotenv-flow').config(options)

    return global.dotenvConversion = dotenvConversion(env)
})()
