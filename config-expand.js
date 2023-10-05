(function () {
    const dotenvExpand = require('dotenv-expand').expand
    const dotenvConversion = require('./dist').convert

    const env = require('dotenv').config(
        Object.assign(
            {},
            require('dotenv/lib/env-options'),
            require('dotenv/lib/cli-options')(process.argv),
        ),
    )

    return global.dotenvConversion = dotenvConversion(dotenvExpand(env))
})()
