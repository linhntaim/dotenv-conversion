# dotenv-conversion

[![NPM version](https://img.shields.io/npm/v/dotenv-conversion.svg?style=flat-square)](https://www.npmjs.com/package/dotenv-conversion)
[![Github Actions](https://img.shields.io/github/actions/workflow/status/linhntaim/dotenv-conversion/build.yml?style=flat-square)](https://github.com/linhntaim/dotenv-conversion/actions/workflows/build.yml)
[![Coveralls](https://img.shields.io/coveralls/github/linhntaim/dotenv-conversion?style=flat-square)](https://coveralls.io/github/linhntaim/dotenv-conversion)
[![License](https://img.shields.io/npm/l/dotenv-conversion?style=flat-square)](https://github.com/linhntaim/dotenv-conversion/blob/master/LICENSE)

`dotenv-conversion` adds variable conversion on top of `dotenv`. If you find yourself
needing to convert/transform environment variables to anything more useful than strings,
then `dotenv-conversion` is your tool.

---

- [Installation](#installation)
- [Usage](#usage)
- [Preload](#preload)
    - [With `dotenv`](#with-dotenv)
    - [With `dotenv-flow`](#with-dotenv-flow)
- [Features](#features)
    - [Auto-Conversion](#auto-conversion)
    - [Conversion Methods](#conversion-methods)
        - [Built-in Methods](#built-in-methods)
        - [Custom Methods](#custom-methods)
        - [Method Aliases](#method-aliases)
        - [The special built-in method `auto`](#the-special-built-in-method-auto)
    - [Custom Conversion for a Specific Variable](#custom-conversion-for-a-specific-variable)
    - [Prevent Variables from Conversion](#prevent-variables-from-conversion)
    - [Ignore `process.env`](#ignore-processenv)
- [Documentation](#documentation)
    - [`convert`](#convert)
        - [Options](#options)

---

## Installation

```bash
npm install dotenv-conversion --save
```

## Usage

- Standalone:

```javascript
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenvConversion from 'dotenv-conversion'

const options = {
    parsed: {
        DEBUG: 'false',
    },
    // rememeber to set this option to false if usage is `standalone`
    fromDotEnv: false,
}
const {parsed} = dotenvConversion.convert(options)
console.log(parsed.DEBUG) // (boolean) false
console.log(process.env.DEBUG) // (string) 'false' 
```

- Integrate with [`dotenv`](https://www.npmjs.com/package/dotenv):

```dotenv
# .env file
DEBUG=false
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()
const {parsed} = dotenvConversion.convert(config)
console.log(parsed.DEBUG)       // (boolean) false
console.log(process.env.DEBUG)  // (string) 'false'
```

- ... and [`dotenv-expand`](https://www.npmjs.com/package/dotenv-expand):

```dotenv
# .env file
DEBUG_LEVEL=0
DEBUG=boolean:$DEBUG_LEVEL

EXPONENTIAL=2
NUMBER=1e$EXPONENTIAL
```

```javascript
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvExpand from 'dotenv-expand'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()
const {parsed} = dotenvConversion.convert(dotenvExpand.expand(config))
console.log(parsed.DEBUG_LEVEL)         // (number) 0 
console.log(parsed.DEBUG)               // (boolean) false
console.log(parsed.EXPONENTIAL)         // (number) 2
console.log(parsed.NUMBER)              // (number) 100
console.log(process.env.DEBUG_LEVEL)    // (string) '0'
console.log(process.env.DEBUG)          // (string) 'false'
console.log(process.env.EXPONENTIAL)    // (string) '2'
console.log(process.env.NUMBER)         // (string) '100'
```

- Or integrate with [`dotenv-flow`](https://www.npmjs.com/package/dotenv-flow):

```dotenv
# .env.test file
DEBUG_LEVEL=0
DEBUG=boolean:$DEBUG_LEVEL

EXPONENTIAL=2
NUMBER=1e$EXPONENTIAL
```

```javascript
const dotenvFlow = require('dotenv-flow')
const dotenvExpand = require('dotenv-expand')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenvFlow from 'dotenv-flow'
// import dotenvExpand from 'dotenv-expand'
// import dotenvConversion from 'dotenv-conversion'

// load variables from .env.test file
process.env.NODE_ENV = 'test'

const config = dotenvFlow.config()
const {parsed} = dotenvConversion.convert(dotenvExpand.expand(config))
console.log(parsed.DEBUG_LEVEL)         // (number) 0 
console.log(parsed.DEBUG)               // (boolean) false
console.log(parsed.EXPONENTIAL)         // (number) 2
console.log(parsed.NUMBER)              // (number) 100
console.log(process.env.DEBUG_LEVEL)    // (string) '0'
console.log(process.env.DEBUG)          // (string) 'false'
console.log(process.env.EXPONENTIAL)    // (string) '2'
console.log(process.env.NUMBER)         // (string) '100'
```

## Preload

### With `dotenv`

You can use the `--require` (`-r`) [command line option](https://nodejs.org/api/cli.html#cli_r_require_module)
to preload `dotenv` and `dotenv-conversion` (and even `dotenv-expand`).
By doing this, you do not need to require and load `dotenv` or `dotenv-conversion`
(or `dotenv-expand`) in your application code.
This is the preferred approach when using `import` instead of `require`.

```bash
# dotenv + dotenv-conversion
$ node -r dotenv-conversion/config your_script.js

# dotenv + dotenv-expand + dotenv-conversion
$ node -r dotenv-conversion/config-expand your_script.js
```

The configuration options below are supported as command line arguments
in the format `dotenv_config_<option>=<value>`.

```bash
# dotenv + dotenv-conversion
$ node -r dotenv-conversion/config your_script.js dotenv_config_path=/custom/path/to/your/env/vars

# dotenv + dotenv-expand + dotenv-conversion
$ node -r dotenv-conversion/config-expand your_script.js dotenv_config_path=/custom/path/to/your/env/vars
```

Additionally, you can use environment variables to set configuration options.
Command line arguments will precede these.

```bash
# dotenv + dotenv-conversion
$ DOTENV_CONFIG_<OPTION>=<value> node -r dotenv-conversion/config your_script.js

# dotenv + dotenv-expand + dotenv-conversion
$ DOTENV_CONFIG_<OPTION>=<value> node -r dotenv-conversion/config-expand your_script.js
```

```bash
# dotenv + dotenv-conversion
$ DOTENV_CONFIG_ENCODING=latin1 node -r dotenv-conversion/config your_script.js dotenv_config_path=/custom/path/to/.env

# dotenv + dotenv-expand + dotenv-conversion
$ DOTENV_CONFIG_ENCODING=latin1 node -r dotenv-conversion/config-expand your_script.js dotenv_config_path=/custom/path/to/.env
```

After preload, you can retrieve converted variables via `global.dotenvConversion.parsed`:

```dotenv
# .env file
DEBUG_LEVEL=0
DEBUG=boolean:$DEBUG_LEVEL

EXPONENTIAL=2
NUMBER=1e$EXPONENTIAL
```

```javascript
// index.js file
const {parsed} = global.dotenvConversion
console.log(parsed.DEBUG_LEVEL)         // (number) 0 
console.log(parsed.DEBUG)               // (boolean) false
console.log(parsed.EXPONENTIAL)         // (number) 2
console.log(parsed.NUMBER)              // (number) 100
console.log(process.env.DEBUG_LEVEL)    // (string) '0'
console.log(process.env.DEBUG)          // (string) 'false'
console.log(process.env.EXPONENTIAL)    // (string) '2'
console.log(process.env.NUMBER)         // (string) '100'
```

```bash
# dotenv + dotenv-expand + dotenv-conversion
$ node -r dotenv-conversion/config-expand index.js
```

Console output:

```
0
false
2
100
0
false
2
100
```

### With `dotenv-flow`

Alternatively, you can preload `dotenv-flow` and `dotenv-conversion` (and `dotenv-expand`).

```bash
# dotenv-flow + dotenv-conversion
$ node -r dotenv-conversion/config-flow your_script.js

# dotenv-flow + dotenv-expand + dotenv-conversion
$ node -r dotenv-conversion/config-flow-expand your_script.js
```

Remember to set the environment variable `NODE_ENV` before preloading when you need to
load `NODE_ENV`-specific `.env` file.

```bash
# dotenv-flow + dotenv-conversion
$ NODE_ENV=<value> node -r dotenv-conversion/config-flow your_script.js

# dotenv-flow + dotenv-expand + dotenv-conversion
$ NODE_ENV=<value> node -r dotenv-conversion/config-flow-expand your_script.js
```

```bash
# dotenv-flow + dotenv-conversion
$ NODE_ENV=production node -r dotenv-conversion/config-flow your_script.js

# dotenv-flow + dotenv-expand + dotenv-conversion
$ NODE_ENV=production node -r dotenv-conversion/config-flow-expand your_script.js
```

After preload, you can also retrieve converted variables via `global.dotenvConversion.parsed`.

## Features

### Auto-Conversion

By default, environment variables will be converted automatically based on its string value.

Currently, auto-conversion supports
`null`, `undefined`, `boolean`, `number`, `bigint`, `symbol`, `array`, `object` as follows:

- **null**

Values to be converted to null: `null`, `Null`, `NULL`.

*Spaces will be trimmed.*

```dotenv
# .env file
VARIABLE_1=null
VARIABLE_2=" null "
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()
const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (object) null 
console.log(parsed.VARIABLE_2)          // (object) null
console.log(process.env.VARIABLE_1)     // (string) 'null'
console.log(process.env.VARIABLE_2)     // (string) 'null'
```

- **undefined**

Values to be converted to undefined: `undefined`, `UNDEFINED`.

*Spaces will be trimmed.*

```dotenv
# .env file
VARIABLE_1=undefined
VARIABLE_2=" undefined "
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()
const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (undefined) undefined 
console.log(parsed.VARIABLE_2)          // (undefined) undefined
console.log(process.env.VARIABLE_1)     // (string) 'undefined'
console.log(process.env.VARIABLE_2)     // (string) 'undefined'
```

- **boolean**

Values to be converted to true: `true`, `True`, `TRUE`, `yes`, `Yes`, `YES`,
`ok`, `Ok`, `OK`.

Values to be converted to false: `false`, `False`, `FALSE`, `no`, `No`, `NO`,
`not`, `Not`, `NOT`, `none`, `None`, `NONE`.

*Spaces will be trimmed.*

```dotenv
# .env file
VARIABLE_1=true
VARIABLE_2=false
VARIABLE_3=" yes "
VARIABLE_4=" no "
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()
const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (boolean) true 
console.log(parsed.VARIABLE_2)          // (boolean) false
console.log(parsed.VARIABLE_3)          // (boolean) true
console.log(parsed.VARIABLE_4)          // (boolean) false
console.log(process.env.VARIABLE_1)     // (string) 'true'
console.log(process.env.VARIABLE_2)     // (string) 'false'
console.log(process.env.VARIABLE_3)     // (string) 'true'
console.log(process.env.VARIABLE_4)     // (string) 'false'
```

- **number**

Values to be converted to number: `NaN`, `±Infinity`
and any string in valid number format (e.g. `±5`, `±5.`, `±.5`, `±4.5`, `±4.5e±123`, ...).
Binary (e.g. `±0b1010`), octal (e.g. `±0o12`) and hexadecimal (e.g. `±0xa`) number format
are also supported.

*Spaces will be trimmed.*

```dotenv
# .env file
VARIABLE_1=NaN
VARIABLE_2=Infinity
VARIABLE_3=-Infinity
VARIABLE_4=5
VARIABLE_5=5.
VARIABLE_6=.5
VARIABLE_7=4.5
VARIABLE_8=4.5e+1
VARIABLE_9=4.5e+123
VARIABLE_10=-5
VARIABLE_11=-5.
VARIABLE_12=-.5
VARIABLE_13=-4.5
VARIABLE_14=-4.5e-1
VARIABLE_15=-4.5e-123
VARIABLE_16=4.5E123
VARIABLE_17=" NaN "
VARIABLE_18=" Infinity "
VARIABLE_19=" 4.5e+123 "
VARIABLE_20=0b1010
VARIABLE_21=-0B1010
VARIABLE_22=0o12
VARIABLE_23=-0O12
VARIABLE_24=0xa
VARIABLE_25=-0XA
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()
const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (number) NaN 
console.log(parsed.VARIABLE_2)          // (number) Infinity
console.log(parsed.VARIABLE_3)          // (number) -Infinity
console.log(parsed.VARIABLE_4)          // (number) 5
console.log(parsed.VARIABLE_5)          // (number) 5
console.log(parsed.VARIABLE_6)          // (number) 0.5
console.log(parsed.VARIABLE_7)          // (number) 4.5
console.log(parsed.VARIABLE_8)          // (number) 45
console.log(parsed.VARIABLE_9)          // (number) 4.5e+123
console.log(parsed.VARIABLE_10)         // (number) -5
console.log(parsed.VARIABLE_11)         // (number) -5 
console.log(parsed.VARIABLE_12)         // (number) -0.5
console.log(parsed.VARIABLE_13)         // (number) -4.5
console.log(parsed.VARIABLE_14)         // (number) -0.45
console.log(parsed.VARIABLE_15)         // (number) -4.5e-123
console.log(parsed.VARIABLE_16)         // (number) 4.5e+123
console.log(parsed.VARIABLE_17)         // (number) NaN
console.log(parsed.VARIABLE_18)         // (number) Infinity
console.log(parsed.VARIABLE_19)         // (number) 4.5e+123
console.log(parsed.VARIABLE_20)         // (number) 10
console.log(parsed.VARIABLE_21)         // (number) -10
console.log(parsed.VARIABLE_22)         // (number) 10
console.log(parsed.VARIABLE_23)         // (number) -10
console.log(parsed.VARIABLE_24)         // (number) 10
console.log(parsed.VARIABLE_25)         // (number) -10
console.log(process.env.VARIABLE_1)     // (string) 'NaN'
console.log(process.env.VARIABLE_2)     // (string) 'Infinity'
console.log(process.env.VARIABLE_3)     // (string) '-Infinity'
console.log(process.env.VARIABLE_4)     // (string) '5'
console.log(process.env.VARIABLE_5)     // (string) '5'
console.log(process.env.VARIABLE_6)     // (string) '0.5'
console.log(process.env.VARIABLE_7)     // (string) '4.5'
console.log(process.env.VARIABLE_8)     // (string) '45'
console.log(process.env.VARIABLE_9)     // (string) '4.5e+123'
console.log(process.env.VARIABLE_10)    // (string) '-5'
console.log(process.env.VARIABLE_11)    // (string) '-5'
console.log(process.env.VARIABLE_12)    // (string) '-0.5'
console.log(process.env.VARIABLE_13)    // (string) '-4.5'
console.log(process.env.VARIABLE_14)    // (string) '-0.45'
console.log(process.env.VARIABLE_15)    // (string) '-4.5e-123'
console.log(process.env.VARIABLE_16)    // (string) '4.5e+123'
console.log(process.env.VARIABLE_17)    // (string) 'NaN'
console.log(process.env.VARIABLE_18)    // (string) 'Infinity'
console.log(process.env.VARIABLE_19)    // (string) '4.5e+123'
console.log(process.env.VARIABLE_20)    // (string) '10'
console.log(process.env.VARIABLE_21)    // (string) '-10'
console.log(process.env.VARIABLE_22)    // (string) '10'
console.log(process.env.VARIABLE_23)    // (string) '-10'
console.log(process.env.VARIABLE_24)    // (string) '10'
console.log(process.env.VARIABLE_25)    // (string) '-10'
```

***Note:* You can disable the support for binary, octal or hexadecimal number format 
by setting the option [`binaryNumber`](#binarynumber), 
[`octalNumber`](#octalnumber) or [`hexadecimalNumber`](#hexadecimalnumber) to false. 

- **bigint**

Values to be converted to bigint must match the format: `${value}n`;
`value` must be an `integer` in decimal (e.g. `±10`), binary (e.g. `±0b1010`),
octal (e.g. `±0o12`) or hexadecimal (e.g. `±0xa`) number syntax.

*Spaces will be trimmed.*

```dotenv
# .env file
VARIABLE_1=5n
VARIABLE_2=-5n
VARIABLE_3=" 5n "
VARIABLE_4=0b1010n
VARIABLE_5=-0B1010n
VARIABLE_6=0o12n
VARIABLE_7=-0O12n
VARIABLE_8=0xan
VARIABLE_9=-0XAn
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()
const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (bigint) 5n 
console.log(parsed.VARIABLE_2)          // (bigint) -5n
console.log(parsed.VARIABLE_3)          // (bigint) 5n
console.log(parsed.VARIABLE_4)          // (bigint) 10n
console.log(parsed.VARIABLE_5)          // (bigint) 10n
console.log(parsed.VARIABLE_6)          // (bigint) 10n
console.log(parsed.VARIABLE_7)          // (bigint) 10n
console.log(parsed.VARIABLE_8)          // (bigint) 10n
console.log(parsed.VARIABLE_9)          // (bigint) 10n
console.log(process.env.VARIABLE_1)     // (string) '5n'
console.log(process.env.VARIABLE_2)     // (string) '-5n'
console.log(process.env.VARIABLE_3)     // (string) '5n'
console.log(process.env.VARIABLE_4)     // (string) '10n'
console.log(process.env.VARIABLE_5)     // (string) '10n'
console.log(process.env.VARIABLE_6)     // (string) '10n'
console.log(process.env.VARIABLE_7)     // (string) '10n'
console.log(process.env.VARIABLE_8)     // (string) '10n'
console.log(process.env.VARIABLE_9)     // (string) '10n'
```

***Note:* You can disable the support for binary, octal or hexadecimal bigint format
by setting the option [`binaryBigInt`](#binarybigint),
[`octalBigInt`](#octalbigint) or [`hexadecimalBigInt`](#hexadecimalbigint) to false.

- **symbol**

Values to be converted to symbol must match the format: `Symbol(${string})`.

*Spaces will be trimmed.*

```dotenv
# .env file
VARIABLE_1=Symbol()
VARIABLE_2=Symbol(a)
VARIABLE_3=" Symbol(a) "
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()
const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (symbol) Symbol()
console.log(parsed.VARIABLE_2)          // (symbol) Symbol(a)
console.log(parsed.VARIABLE_3)          // (symbol) Symbol(a)
console.log(process.env.VARIABLE_1)     // (string) 'Symbol(a)'
console.log(process.env.VARIABLE_2)     // (string) 'Symbol(a)'
```

- **array**

Values to be converted to array must match the format:
a string contains `${value}` separated by commas;
the `value` could be `null`,`boolean`, `number`, `"string"`, `[..array..]` or `{..object..}`;
and all could be wrapped or not wrapped by `[` and `]` (*must*, when the string is empty).

*Special case:* Values that have only a string enclosed by double quotes
also match the above format.

*Spaces will be trimmed.*

```dotenv
# .env file
VARIABLE_1=[null,true,1,"a",[-1,2.1,3e1,4.5e123],{"x":"y"}]
VARIABLE_2=null,true,1,"a",[-1,2.1,3e1,4.5e123],{"x":"y"}
VARIABLE_3=" [null, true, 1, \" x y \"] "
VARIABLE_4=" null, true, 1, \" x y \" "
VARIABLE_5=" [ ] "
VARIABLE_6="\"a\"" # Special case
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()
const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (array) [null, true, 1, "a", [-1, 2.1, 30, 4.5e+123], {"x": "y"}] 
console.log(parsed.VARIABLE_2)          // (array) [null, true, 1, "a", [-1, 2.1, 30, 4.5e+123], {"x": "y"}]
console.log(parsed.VARIABLE_3)          // (array) [null, true, 1, " x y "]
console.log(parsed.VARIABLE_4)          // (array) [null, true, 1, " x y "]
console.log(parsed.VARIABLE_5)          // (array) []
console.log(parsed.VARIABLE_6)          // (array) ["a"] // Special case
console.log(process.env.VARIABLE_1)     // (string) '[null,true,1,"a",[-1,2.1,30,4.5e+123],{"x":"y"}]'
console.log(process.env.VARIABLE_2)     // (string) '[null,true,1,"a",[-1,2.1,30,4.5e+123],{"x":"y"}]'
console.log(process.env.VARIABLE_3)     // (string) '[null,true,1," x y "]'
console.log(process.env.VARIABLE_4)     // (string) '[null,true,1," x y "]'
console.log(process.env.VARIABLE_5)     // (string) '[]'
console.log(process.env.VARIABLE_6)     // (string) '["a"]' // Special case
```

- **object**

Values to be converted to object must match the format:
a string contains `${key}:${value}` separated by commas;
the `key` must be `"string"` and
the `value` could be `null`,`boolean`, `number`, `"string"`, `[..array..]` or `{..object..}`;
and all could be wrapped or not wrapped by `{` and `}` (*must*, when the string is empty).

*Spaces will be trimmed.*

```dotenv
# .env file
VARIABLE_1={"a":null,"b":true,"c":1,"d":"x","e":[-1,2.1,3e1,4.5e123],"f":{"y":"z"}}
VARIABLE_2="\"a\":null,\"b\":true,\"c\":1,\"d\":\"x\",\"e\":[-1,2.1,3e1,4.5e123],\"f\":{\"y\":\"z\"}"
VARIABLE_3=" [\"a\": null, \"b\": true, \"c\": 1, \"d\": \" x y \"] "
VARIABLE_4=" \"a\": null, \"b\": true, \"c\": 1, \"d\": \" x y \" "
VARIABLE_5=" { } "
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()
const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (object) {"a": null, "b": true, "c": 1, "d": "x", "e": [-1, 2.1, 30, 4.5e+123], "f": {"x": "y"}} 
console.log(parsed.VARIABLE_2)          // (object) {"a": null, "b": true, "c": 1, "d": "x", "e": [-1, 2.1, 30, 4.5e+123], "f": {"x": "y"}} 
console.log(parsed.VARIABLE_3)          // (object) {"a": null, "b": true, "c": 1, "d": " x y "}
console.log(parsed.VARIABLE_4)          // (object) {"a": null, "b": true, "c": 1, "d": " x y "}
console.log(parsed.VARIABLE_5)          // (object) {}
console.log(process.env.VARIABLE_1)     // (string) '{"a":null,"b":true,"c":1,"d":"x","e":[-1,2.1,30,4.5e+123],"f":{"y":"z"}}'
console.log(process.env.VARIABLE_2)     // (string) '{"a":null,"b":true,"c":1,"d":"x","e":[-1,2.1,30,4.5e+123],"f":{"y":"z"}}'
console.log(process.env.VARIABLE_3)     // (string) '{"a":null,"b":true,"c":1,"d":" x y "}'
console.log(process.env.VARIABLE_4)     // (string) '{"a":null,"b":true,"c":1,"d":" x y "}'
console.log(process.env.VARIABLE_5)     // (string) '{}'
```

### Conversion Methods

[Auto-Conversion](#auto-conversion) also looks for the conversion method indicated by a variable
when it cannot convert that variable to anything but a string,
and uses the method to make the conversion.

How a variable indicates its conversion method:

- Standalone:

```javascript
const options = {
    parsed: {
        '${VARIABLE_1}': '${method}:${value}',
        '${VARIABLE_2}': ' ${method}: ${value} ',
    },
    fromDotEnv: false,
}

// Example:
const options = {
    parsed: {
        BOOLEAN: 'boolean:1',
        NUMBER: ' number: true ',
    },
    fromDotEnv: false,
}

// Unaccepted (no conversion):
const options = {
    parsed: {
        NOT_BOOLEAN: 'boolean :1',
        NOT_NUMBER: ' number : true ',
    },
    fromDotEnv: false,
}
```

- Within `.env` files:

```dotenv
${VARIABLE_1}=${method}:${value}
${VARIABLE_2}=" ${method}: ${value} "

# Example:
BOOLEAN=boolean:1
NUMBER=" number: true "

# Unaccepted (no conversion):
NOT_BOOLEAN="boolean :1"
NOT_NUMBER=" number : true "
```

***Note:* `method` is case-sensitive.

#### Built-in Methods

Here are built-in conversion methods (`boolean`, `number`, `bigint`, `string`, `symbol`, `array`, `object`)
that can be used now:

- **boolean**

This method is to convert any value to `true` or `false`.

```dotenv
# .env file
VARIABLE_1="boolean:"                   # <empty>
VARIABLE_2="boolean:false"              # or: false, False, FALSE
VARIABLE_3="boolean:no"                 # or: no, No, NO
VARIABLE_4="boolean:not"                # or: not, Not, NOT
VARIABLE_5="boolean:none"               # or: none, None, NONE
VARIABLE_6="boolean:null"               # or: null, Null, NULL
VARIABLE_7="boolean:undefined"          # or: undefined, UNDEFINED
VARIABLE_8=boolean:NaN
VARIABLE_9=boolean:0
VARIABLE_10=boolean:0.0e+0
VARIABLE_11=boolean:0n
VARIABLE_12=boolean:[]
VARIABLE_13=boolean:{}
VARIABLE_14="boolean:anything else"
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()
const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (boolean) false 
console.log(parsed.VARIABLE_2)          // (boolean) false
console.log(parsed.VARIABLE_3)          // (boolean) false
console.log(parsed.VARIABLE_4)          // (boolean) false
console.log(parsed.VARIABLE_5)          // (boolean) false
console.log(parsed.VARIABLE_6)          // (boolean) false
console.log(parsed.VARIABLE_7)          // (boolean) false
console.log(parsed.VARIABLE_8)          // (boolean) false
console.log(parsed.VARIABLE_9)          // (boolean) false
console.log(parsed.VARIABLE_10)         // (boolean) false
console.log(parsed.VARIABLE_11)         // (boolean) false
console.log(parsed.VARIABLE_12)         // (boolean) false
console.log(parsed.VARIABLE_13)         // (boolean) false
console.log(parsed.VARIABLE_14)         // (boolean) true
console.log(process.env.VARIABLE_1)     // (string) 'false'
console.log(process.env.VARIABLE_2)     // (string) 'false'
console.log(process.env.VARIABLE_3)     // (string) 'false'
console.log(process.env.VARIABLE_4)     // (string) 'false'
console.log(process.env.VARIABLE_5)     // (string) 'false'
console.log(process.env.VARIABLE_6)     // (string) 'false'
console.log(process.env.VARIABLE_7)     // (string) 'false'
console.log(process.env.VARIABLE_8)     // (string) 'false'
console.log(process.env.VARIABLE_9)     // (string) 'false'
console.log(process.env.VARIABLE_10)    // (string) 'false'
console.log(process.env.VARIABLE_11)    // (string) 'false'
console.log(process.env.VARIABLE_12)    // (string) 'false'
console.log(process.env.VARIABLE_13)    // (string) 'false'
console.log(process.env.VARIABLE_14)    // (string) 'true'
```

- **number**

This method is to convert any value to number.

```dotenv
# .env file
VARIABLE_1="number:"            # <empty>
VARIABLE_2="number:true"        # or: True, TRUE
VARIABLE_3="number:yes"         # or: Yes, YES
VARIABLE_4="number:ok"          # or: Ok, OK
VARIABLE_5="number:false"       # or: False, FALSE
VARIABLE_6="number:no"          # or: No, NO
VARIABLE_7="number:not"         # or: Not, NOT
VARIABLE_8="number:none"        # or: None, NONE
VARIABLE_9="number:null"        # or: Null, NULL
VARIABLE_10="number:undefined"  # or: UNDEFINED
VARIABLE_11=number:NaN
VARIABLE_12="number:Infinity"   # or: +Infinity
VARIABLE_13=number:-Infinity
VARIABLE_14=number:4.5e1
VARIABLE_15=number:-4.5e-1
VARIABLE_16=number:4.5e123
VARIABLE_17=number:123string
VARIABLE_18=number:string
VARIABLE_19=number:[]
VARIABLE_20=number:{}
VARIABLE_21=number:0b1010
VARIABLE_22=number:0b1010string
VARIABLE_23=number:0o12
VARIABLE_24=number:0o12string
VARIABLE_25=number:0xa
VARIABLE_26=number:0xastring
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()
const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (number) 0 
console.log(parsed.VARIABLE_2)          // (number) 1
console.log(parsed.VARIABLE_3)          // (number) 1
console.log(parsed.VARIABLE_4)          // (number) 1
console.log(parsed.VARIABLE_5)          // (number) 0
console.log(parsed.VARIABLE_6)          // (number) 0
console.log(parsed.VARIABLE_7)          // (number) 0
console.log(parsed.VARIABLE_8)          // (number) 0
console.log(parsed.VARIABLE_9)          // (number) 0
console.log(parsed.VARIABLE_10)         // (number) NaN
console.log(parsed.VARIABLE_11)         // (number) NaN
console.log(parsed.VARIABLE_12)         // (number) Infinity
console.log(parsed.VARIABLE_13)         // (number) -Infinity
console.log(parsed.VARIABLE_14)         // (number) 45
console.log(parsed.VARIABLE_15)         // (number) -0.45
console.log(parsed.VARIABLE_16)         // (number) 4.5e+123
console.log(parsed.VARIABLE_17)         // (number) 123
console.log(parsed.VARIABLE_18)         // (number) 0
console.log(parsed.VARIABLE_19)         // (number) 0
console.log(parsed.VARIABLE_20)         // (number) 0
console.log(parsed.VARIABLE_21)         // (number) 10
console.log(parsed.VARIABLE_22)         // (number) 0
console.log(parsed.VARIABLE_23)         // (number) 10
console.log(parsed.VARIABLE_24)         // (number) 0
console.log(parsed.VARIABLE_25)         // (number) 10
console.log(parsed.VARIABLE_26)         // (number) 0
console.log(process.env.VARIABLE_1)     // (string) '0'
console.log(process.env.VARIABLE_2)     // (string) '1'
console.log(process.env.VARIABLE_3)     // (string) '1'
console.log(process.env.VARIABLE_4)     // (string) '1'
console.log(process.env.VARIABLE_5)     // (string) '0'
console.log(process.env.VARIABLE_6)     // (string) '0'
console.log(process.env.VARIABLE_7)     // (string) '0'
console.log(process.env.VARIABLE_8)     // (string) '0'
console.log(process.env.VARIABLE_9)     // (string) '0'
console.log(process.env.VARIABLE_10)    // (string) 'NaN'
console.log(process.env.VARIABLE_11)    // (string) 'NaN'
console.log(process.env.VARIABLE_12)    // (string) 'Infinity'
console.log(process.env.VARIABLE_13)    // (string) '-Infinity'
console.log(process.env.VARIABLE_14)    // (string) '45'
console.log(process.env.VARIABLE_15)    // (string) '-0.45'
console.log(process.env.VARIABLE_16)    // (string) '4.5e+123'
console.log(process.env.VARIABLE_17)    // (string) '123'
console.log(process.env.VARIABLE_18)    // (string) '0'
console.log(process.env.VARIABLE_19)    // (string) '0'
console.log(process.env.VARIABLE_20)    // (string) '0'
console.log(process.env.VARIABLE_21)    // (string) '10'
console.log(process.env.VARIABLE_22)    // (string) '0'
console.log(process.env.VARIABLE_23)    // (string) '10'
console.log(process.env.VARIABLE_24)    // (string) '0'
console.log(process.env.VARIABLE_25)    // (string) '10'
console.log(process.env.VARIABLE_26)    // (string) '0'
```

***Note:* You can disable the conversion for binary, octal or hexadecimal number format
by setting the option [`binaryNumber`](#binarynumber),
[`octalNumber`](#octalnumber) or [`hexadecimalNumber`](#hexadecimalnumber) to false.

- **bigint**

This method is to convert any value to bigint.

```dotenv
# .env file
VARIABLE_1="bigint:"            # <empty>
VARIABLE_2="bigint:true"        # or: True, TRUE
VARIABLE_3="bigint:yes"         # or: Yes, YES
VARIABLE_4="bigint:ok"          # or: Ok, OK
VARIABLE_5="bigint:false"       # or: False, FALSE
VARIABLE_6="bigint:no"          # or: No, NO
VARIABLE_7="bigint:not"         # or: Not, NOT
VARIABLE_8="bigint:none"        # or: None, NONE
VARIABLE_9="bigint:null"        # or: Null, NULL
VARIABLE_10="bigint:undefined"  # or: UNDEFINED
VARIABLE_11=bigint:NaN
VARIABLE_12="bigint:Infinity"   # or: +Infinity
VARIABLE_13=bigint:-Infinity
VARIABLE_14=bigint:4
VARIABLE_15=bigint:-4.5
VARIABLE_16=bigint:4.5e1
VARIABLE_17=bigint:4.5e10
VARIABLE_18=bigint:4.5e-123
VARIABLE_19=bigint:123string
VARIABLE_20=bigint:string
VARIABLE_21=bigint:[]
VARIABLE_22=bigint:{}
VARIABLE_23=bigint:0b1010
VARIABLE_24=bigint:0b1010string
VARIABLE_25=bigint:0o12
VARIABLE_26=bigint:0o12string
VARIABLE_27=bigint:0xa
VARIABLE_28=bigint:0xastring
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()
const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (bigint) 0n
console.log(parsed.VARIABLE_2)          // (bigint) 1n
console.log(parsed.VARIABLE_3)          // (bigint) 1n
console.log(parsed.VARIABLE_4)          // (bigint) 1n
console.log(parsed.VARIABLE_5)          // (bigint) 0n
console.log(parsed.VARIABLE_6)          // (bigint) 0n
console.log(parsed.VARIABLE_7)          // (bigint) 0n
console.log(parsed.VARIABLE_8)          // (bigint) 0n
console.log(parsed.VARIABLE_9)          // (bigint) 0n
console.log(parsed.VARIABLE_10)         // (bigint) 0n
console.log(parsed.VARIABLE_11)         // (bigint) 0n
console.log(parsed.VARIABLE_12)         // (bigint) 1n
console.log(parsed.VARIABLE_13)         // (bigint) -1n
console.log(parsed.VARIABLE_14)         // (bigint) 4n
console.log(parsed.VARIABLE_15)         // (bigint) -4n
console.log(parsed.VARIABLE_16)         // (bigint) 45n
console.log(parsed.VARIABLE_17)         // (bigint) 45000000000n
console.log(parsed.VARIABLE_18)         // (bigint) 0n
console.log(parsed.VARIABLE_19)         // (bigint) 123n
console.log(parsed.VARIABLE_20)         // (bigint) 0n
console.log(parsed.VARIABLE_21)         // (bigint) 0n
console.log(parsed.VARIABLE_22)         // (bigint) 0n
console.log(parsed.VARIABLE_23)         // (bigint) 10n
console.log(parsed.VARIABLE_24)         // (bigint) 0n
console.log(parsed.VARIABLE_25)         // (bigint) 10n
console.log(parsed.VARIABLE_26)         // (bigint) 0n
console.log(parsed.VARIABLE_27)         // (bigint) 10n
console.log(parsed.VARIABLE_28)         // (bigint) 0n
console.log(process.env.VARIABLE_1)     // (string) '0n'
console.log(process.env.VARIABLE_2)     // (string) '1n'
console.log(process.env.VARIABLE_3)     // (string) '1n'
console.log(process.env.VARIABLE_4)     // (string) '1n'
console.log(process.env.VARIABLE_5)     // (string) '0n'
console.log(process.env.VARIABLE_6)     // (string) '0n'
console.log(process.env.VARIABLE_7)     // (string) '0n'
console.log(process.env.VARIABLE_8)     // (string) '0n'
console.log(process.env.VARIABLE_9)     // (string) '0n'
console.log(process.env.VARIABLE_10)    // (string) '0n'
console.log(process.env.VARIABLE_11)    // (string) '0n'
console.log(process.env.VARIABLE_12)    // (string) '1n'
console.log(process.env.VARIABLE_13)    // (string) '-1n'
console.log(process.env.VARIABLE_14)    // (string) '4n'
console.log(process.env.VARIABLE_15)    // (string) '-4n'
console.log(process.env.VARIABLE_16)    // (string) '45n'
console.log(process.env.VARIABLE_17)    // (string) '45000000000n'
console.log(process.env.VARIABLE_18)    // (string) '0n'
console.log(process.env.VARIABLE_19)    // (string) '123n'
console.log(process.env.VARIABLE_20)    // (string) '0n'
console.log(process.env.VARIABLE_21)    // (string) '0n'
console.log(process.env.VARIABLE_22)    // (string) '0n'
console.log(process.env.VARIABLE_23)    // (string) '10n'
console.log(process.env.VARIABLE_24)    // (string) '0n'
console.log(process.env.VARIABLE_25)    // (string) '10n'
console.log(process.env.VARIABLE_26)    // (string) '0n'
console.log(process.env.VARIABLE_27)    // (string) '10n'
console.log(process.env.VARIABLE_28)    // (string) '0n'
```

***Note:* You can disable the conversion for binary, octal or hexadecimal bigint format
by setting the option [`binaryBigInt`](#binarybigint),
[`octalBigInt`](#octalbigint) or [`hexadecimalBigInt`](#hexadecimalbigint) to false.

- **string**

This method is to keep any value as it is.

```dotenv
# .env file
VARIABLE_1=string:true
VARIABLE_2=string:4.5e1
VARIABLE_3=" string: anything "
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()
const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (string) 'true'
console.log(parsed.VARIABLE_2)          // (string) '4.5e1'
console.log(parsed.VARIABLE_3)          // (string) ' anything '
console.log(process.env.VARIABLE_1)     // (string) 'true'
console.log(process.env.VARIABLE_2)     // (string) '4.5e1'
console.log(process.env.VARIABLE_3)     // (string) ' anything '
```

***Note:* [Auto-Conversion](#auto-conversion) will use the conversion method `string` for all variables
that it cannot convert to anything but a string.
So, `VARIABLE=text` is also the same as `VARIABLE=string:text`.

- **symbol**

This method is to convert any value to symbol.

```dotenv
# .env file
VARIABLE_1="symbol:"
VARIABLE_2="symbol: "
VARIABLE_3="symbol:a"
VARIABLE_4="symbol: a "
VARIABLE_5="symbol:Symbol()"
VARIABLE_6="symbol:Symbol( )"
VARIABLE_7="symbol:Symbol(a)"
VARIABLE_8="symbol:Symbol( a )"
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()
const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (symbol) Symbol()
console.log(parsed.VARIABLE_2)          // (symbol) Symbol(" ")
console.log(parsed.VARIABLE_3)          // (symbol) Symbol("a")
console.log(parsed.VARIABLE_4)          // (symbol) Symbol(" a ")
console.log(parsed.VARIABLE_5)          // (symbol) Symbol()
console.log(parsed.VARIABLE_6)          // (symbol) Symbol(" ")
console.log(parsed.VARIABLE_7)          // (symbol) Symbol("a")
console.log(parsed.VARIABLE_8)          // (symbol) Symbol(" a ")
console.log(process.env.VARIABLE_1)     // (string) 'Symbol()'
console.log(process.env.VARIABLE_2)     // (string) 'Symbol( )'
console.log(process.env.VARIABLE_3)     // (string) 'Symbol(a)'
console.log(process.env.VARIABLE_4)     // (string) 'Symbol( a )'
console.log(process.env.VARIABLE_5)     // (string) 'Symbol()'
console.log(process.env.VARIABLE_6)     // (string) 'Symbol( )'
console.log(process.env.VARIABLE_7)     // (string) 'Symbol(a)'
console.log(process.env.VARIABLE_8)     // (string) 'Symbol( a )'
```

- **array**

This method is to convert the value to array.

If the value cannot be converted, it will be returned itself.

```dotenv
# .env file
VARIABLE_1="array:" # <empty>
VARIABLE_2="array: [ ] "
VARIABLE_3=array:[null,true,1,"x",[-1,2.1,3e1,4.5e123],{"y":"z"}]
VARIABLE_4=array:null,true,1,"x",[-1,2.1,3e1,4.5e123],{"y":"z"}
VARIABLE_5="array: 1, 2, 3"
VARIABLE_6="array: \"a\", \"b\", \"c\""
VARIABLE_7="array: a, b, c"
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()
const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (array) []
console.log(parsed.VARIABLE_2)          // (array) []
console.log(parsed.VARIABLE_3)          // (array) [null, true, 1, "x", [-1, 2.1, 30, 4.5e+123], {"y": "z"}]
console.log(parsed.VARIABLE_4)          // (array) [null, true, 1, "x", [-1, 2.1, 30, 4.5e+123], {"y": "z"}]
console.log(parsed.VARIABLE_5)          // (array) [1, 2, 3]
console.log(parsed.VARIABLE_6)          // (array) ["a", "b", "c"]
console.log(parsed.VARIABLE_7)          // (string) ' a, b, c'
console.log(process.env.VARIABLE_1)     // (string) '[]'
console.log(process.env.VARIABLE_2)     // (string) '[]'
console.log(process.env.VARIABLE_3)     // (string) '[null,true,1,"x",[-1,2.1,30,4.5e+123],{"y":"z"}]'
console.log(process.env.VARIABLE_4)     // (string) '[null,true,1,"x",[-1,2.1,30,4.5e+123],{"y":"z"}]'
console.log(process.env.VARIABLE_5)     // (string) '[1,2,3]'
console.log(process.env.VARIABLE_6)     // (string) '["a","b","c"]'
console.log(process.env.VARIABLE_7)     // (string) ' a, b, c'
```

- **object**

This method is to convert any value to object.

If the value cannot be converted, it will be returned itself.

```dotenv
# .env file
VARIABLE_1="object:" # <empty>
VARIABLE_2="object: { } "
VARIABLE_3=object:{"a":null,"b":true,"c":1,"d":"x","e":[-1,2.1,3e1,4.5e123],"f":{"y":"z"}}
VARIABLE_4=object:"a":null,"b":true,"c":1,"d":"x","e":[-1,2.1,3e1,4.5e123],"f":{"y":"z"}
VARIABLE_5="object: \"a\": 1, \"b\": 2, \"c\": 3"
VARIABLE_6="object: \"a\": \"x\", \"b\": \"y\", \"c\": \"z\""
VARIABLE_7="object: a: 1, b: 2, c: 3"
VARIABLE_8="object: \"a\": x, \"b\": y, \"c\": z"
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()
const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (object) {}
console.log(parsed.VARIABLE_2)          // (object) {}
console.log(parsed.VARIABLE_3)          // (object) {"a": null, "b": true, "c": 1, "d": "x", "e": [-1, 2.1, 30, 4.5e+123], "f": {"y": "z"}}
console.log(parsed.VARIABLE_4)          // (object) {"a": null, "b": true, "c": 1, "d": "x", "e": [-1, 2.1, 30, 4.5e+123], "f": {"y": "z"}}
console.log(parsed.VARIABLE_5)          // (object) {"a": 1, "b": 2, "c": 3}
console.log(parsed.VARIABLE_6)          // (object) {"a": "x", "b": "y", "c": "z"}
console.log(parsed.VARIABLE_7)          // (string) ' a: 1, b: 2, c: 3'
console.log(parsed.VARIABLE_7)          // (string) ' "a": x, "b": y, "c": z'
console.log(process.env.VARIABLE_1)     // (string) '{}'
console.log(process.env.VARIABLE_2)     // (string) '{}'
console.log(process.env.VARIABLE_3)     // (string) '{"a": null,"b":true,"c":1,"d":"x","e":[-1,2.1,30,4.5e+123],"f":{"y":"z"}}'
console.log(process.env.VARIABLE_4)     // (string) '{"a": null,"b":true,"c":1,"d":"x","e":[-1,2.1,30,4.5e+123],"f":{"y":"z"}}'
console.log(process.env.VARIABLE_5)     // (string) '{"a":1,"b":2,"c":3}'
console.log(process.env.VARIABLE_6)     // (string) '{"a":"x","b":"y","c":"z"}'
console.log(process.env.VARIABLE_7)     // (string) ' a: 1, b: 2, c: 3'
console.log(process.env.VARIABLE_8)     // (string) ' "a": x, "b": y, "c": z'
```

#### Custom Methods

Here you can extend the `dotenv-conversion` by defining your own custom conversion methods.

- Add new conversion method:

```dotenv
# .env file
VARIABLE_1=custom:agree
VARIABLE_2=custom:disagree
VARIABLE_3=custom2:yes
VARIABLE_4=custom2:agree
VARIABLE_5=custom2:disagree
VARIABLE_6=no_custom:yes
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()

// Define new conversion methods named `custom` and `custom2`
config.methods = {
    // brand new method
    custom(value) {
        return value === 'agree' ? true : false
    },
    // or want to reuse methods via `this`
    custom2(value, ...params) {
        // reuse built-in method
        // When reusing any conversion method, 
        // make sure you pass all available params of the method to it
        if (this.boolean(value, ...params)) {
            return true
        }
        // reuse custom method
        return this.custom(value)
    },
}

const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (boolean) true
console.log(parsed.VARIABLE_2)          // (boolean) false
console.log(parsed.VARIABLE_3)          // (boolean) true
console.log(parsed.VARIABLE_4)          // (boolean) true
console.log(parsed.VARIABLE_5)          // (boolean) false
console.log(parsed.VARIABLE_6)          // (string) 'no_custom:yes'
console.log(process.env.VARIABLE_1)     // (string) 'true'
console.log(process.env.VARIABLE_2)     // (string) 'false'
console.log(process.env.VARIABLE_3)     // (string) 'true'
console.log(process.env.VARIABLE_4)     // (string) 'true'
console.log(process.env.VARIABLE_5)     // (string) 'false'
console.log(process.env.VARIABLE_6)     // (string) 'no_custom:yes'
```

- Override built-in conversion methods:

```dotenv
# .env file
VARIABLE_1=text
VARIABLE_2=string:text
VARIABLE_3=boolean:yes
VARIABLE_4=boolean:true
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()

// Override built-int methods `string` and `boolean`
config.methods = {
    string(value) {
        return value.toUpperCase()
    },
    boolean(value) {
        return value === 'yes' ? true : false
    },
}

const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (string) 'TEXT'
console.log(parsed.VARIABLE_2)          // (string) 'TEXT'
console.log(parsed.VARIABLE_3)          // (boolean) true
console.log(parsed.VARIABLE_4)          // (boolean) false
console.log(process.env.VARIABLE_1)     // (string) 'TEXT'
console.log(process.env.VARIABLE_2)     // (string) 'TEXT'
console.log(process.env.VARIABLE_3)     // (string) 'true'
console.log(process.env.VARIABLE_4)     // (string) 'false'
```

***Note:* A conversion method always has 3 params in order: `value`, `name` and `config`.

```dotenv
# .env file
VARIABLE=text
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const dotenvConfig = dotenv.config()

// Override built-int methods `string`
dotenvConfig.methods = {
    string(value, name, config) {
        console.log('value:', value)
        console.log('name:', name)
        console.log('config:', config)
        return value
    },
}

const {parsed} = dotenvConversion.convert(dotenvConfig)

/* CONSOLE OUTPUT:
value: text
name: VARIABLE
config: {
    parsed: { ... },
    methods: { ... },
    ...
}
*/
```

#### Method Aliases

When you don't like the (long) method name, but you don't want to change it directly
as well as you don't want to define a new method with a better name (and reuse the old method),
here is the feature for you.

```dotenv
# .env file
VARIABLE_1=b:yes
VARIABLE_2=uppercase:text
VARIABLE_3=U:text
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()

// (optional) Define new custom conversion method name `uppercase`
config.methods = {
    uppercase(value) {
        return value.toUpperCase()
    },
}

// Define the method aliases
config.methodAliases = {
    // Alias to the built-in method `boolean`
    b: 'boolean',
    // (optional) Alias to the brand new method `uppercase`
    U: 'uppercase',
}

const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (boolean) true
console.log(parsed.VARIABLE_2)          // (string) 'TEXT'
console.log(parsed.VARIABLE_3)          // (string) 'TEXT'
console.log(process.env.VARIABLE_1)     // (string) 'true'
console.log(process.env.VARIABLE_2)     // (string) 'TEXT'
console.log(process.env.VARIABLE_3)     // (string) 'TEXT'
```

There are also built-in aliases which are ready to use:

- `bool` => `boolean`
- `num` => `number`
- `big` => `bigint`
- `str` => `string`
- `arr` => `array`
- `obj` => `object`

```dotenv
# .env file
VARIABLE_1=bool:yes
VARIABLE_2=num:4.5e123
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()
const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (boolean) true
console.log(parsed.VARIABLE_2)          // (number) 4.5e+123
console.log(process.env.VARIABLE_1)     // (string) 'true'
console.log(process.env.VARIABLE_2)     // (string) '4.5e+123'
```

***Note:*

- You cannot override existing aliases.
- Alias named by existing methods is not allowed
- Alias to other alias is not allowed.

```dotenv
# .env file
VARIABLE_1=customBool:yes
VARIABLE_2=customString:text
VARIABLE_3=bool:yes
VARIABLE_4=string:text
VARIABLE_5=b:yes
VARIABLE_6=cb:yes
VARIABLE_7=cs:text
VARIABLE_8=bl:yes
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()

// New custom methods
config.methods = {
    customBool(value) {
        return `CUSTOM_BOOL:${value}`
    },
    customString(value) {
        return `CUSTOM_STRING:${value}`
    },
}

config.methodAliases = {
    // Not allowed aliases:
    // - Override the existing alias `bool`,
    //   expect the custom method `customBool` instead of the method `boolean` to work
    bool: 'customBool',
    // - Alias named by the existing method `string`, 
    //   expects the custom method `customString` to work
    string: 'customString',
    // - Alias to the existing alias `bool`, 
    //   expects the method `boolean` to work
    b: 'bool',

    // Fixing not allowed aliases
    cb: 'customBool',
    cs: 'customString',
    bl: 'boolean',
}

const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (string) 'CUSTOM_BOOL:yes'
console.log(parsed.VARIABLE_2)          // (string) 'CUSTOM_STRING:text'
console.log(parsed.VARIABLE_3)          // (boolean) true       // wrong expect: 'CUSTOM_BOOL:yes'
console.log(parsed.VARIABLE_4)          // (string) 'text'      // wrong expect: 'CUSTOM_STRING:text'
console.log(parsed.VARIABLE_5)          // (string) 'b:yes'     // wrong expect: true
console.log(parsed.VARIABLE_6)          // (string) 'CUSTOM_BOOL:yes'
console.log(parsed.VARIABLE_7)          // (string) 'CUSTOM_STRING:text'
console.log(parsed.VARIABLE_8)          // (boolean) true
console.log(process.env.VARIABLE_1)     // (string) 'CUSTOM_BOOL:yes'
console.log(process.env.VARIABLE_2)     // (string) 'CUSTOM_STRING:text'
console.log(process.env.VARIABLE_3)     // (string) 'true'
console.log(process.env.VARIABLE_4)     // (string) 'text'
console.log(process.env.VARIABLE_5)     // (string) 'b:yes'
console.log(process.env.VARIABLE_6)     // (string) 'CUSTOM_BOOL:yes'
console.log(process.env.VARIABLE_7)     // (string) 'CUSTOM_STRING:text'
console.log(process.env.VARIABLE_8)     // (string) 'true'
```

*** *Only alphanumeric (a-z, A-Z, 0-9), underscore (_) and dot (.) characters are allowed in naming the conversion
methods and aliases.*

#### The special built-in method `auto`

The [Auto-Conversion](#auto-conversion) uses the built-in conversion method `auto`
for its automated execution.

Logically, you can override it. But certainly, it is **HIGHLY NOT RECOMMENDED**,
unless you want to change the whole auto-conversion process.

```dotenv
# .env file
VARIABLE_1=text
VARIABLE_2=true
VARIABLE_3=123.5
VARIABLE_4=boolean:yes
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()

// Override the conversion method `auto`
config.methods = {
    auto(value) {
        return 'overridden'
    },
}

const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (string) 'overridden'
console.log(parsed.VARIABLE_2)          // (string) 'overridden'
console.log(parsed.VARIABLE_3)          // (string) 'overridden'
console.log(parsed.VARIABLE_4)          // (string) 'overridden'
console.log(process.env.VARIABLE_1)     // (string) 'overridden'
console.log(process.env.VARIABLE_2)     // (string) 'overridden'
console.log(process.env.VARIABLE_3)     // (string) 'overridden'
console.log(process.env.VARIABLE_4)     // (string) 'overridden'
```

***Note:* The override will affect only the [Auto-Conversion](#auto-conversion) feature.

Besides, you need to avoid these worthless actions:

- Defining [aliases](#method-aliases) to the `auto`.
- Defining [custom conversions](#custom-conversion-for-a-specific-variable) that point to the `auto`.
- Using `auto` like other methods to indicate conversion:
    - Standalone: `{AUTO_BOOLEAN: "auto:true"}`, or
    - Within `.env` files: `AUTO_BOOLEAN=auto:true`.

The reuse of the method `auto` could be an option if you know what to do:

```dotenv
# .env file
STATE=state:stop

RUNNING_VALUE=true
STOPPED_VALUE_1={"reason":"reason1"}
STOPPED_VALUE_2={"reason":"reason2","code":123}
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()

const originEnv = {...config.parsed}
// Define custom method `state` to replace current value with the value coming from 
// other environment variables which need to convert automatically.
config.methods = {
    state(value, ...params) {
        switch (value) {
            case 'running':
                value = originEnv.RUNNING_VALUE
                break
            case 'stop2':
                value = originEnv.STOPPED_VALUE_2
                break
            case 'stop1':
            default:
                value = originEnv.STOPPED_VALUE_1
                break
        }
        // When reusing any conversion method, 
        // make sure you pass all available params of the method to it
        return this.auto(value, ...params)
    },
}

const {parsed} = dotenvConversion.convert(config)
console.log(parsed.STATE)          // (object) {"reason": "reason1"}
console.log(process.env.STATE)     // (string) '{"reason":"reason1"}'
```

### Custom Conversion for a Specific Variable

Custom conversion for a specific variable could be a function or
a string refers to a conversion method or alias as follows:

```dotenv
# .env file
VARIABLE_1=agree
VARIABLE_2=agree
VARIABLE_3=agree
VARIABLE_4=0
VARIABLE_5=0
VARIABLE_6=0
VARIABLE_7=0
VARIABLE_8=boolean:true
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()

// Define custom conversion for specific variables
config.specs = {
    // Custom conversion for `VARIABLE_2`
    VARIABLE_2(value) {
        return value === 'agree' ? true : false
    },

    // Custom conversion for `VARIABLE_3`
    VARIABLE_3(value) {
        // reuse custom conversion
        return this.VARIABLE_2(value)
    },

    // Custom conversion for `VARIABLE_5
    VARIABLE_5(value, ...params) {
        // reuse conversion method
        // When reusing any conversion method, 
        // make sure you pass all available params of the method to it
        return config.methods.boolean(value, ...params)
    },

    // Custom conversion for `VARIABLE_6`
    VARIABLE_6: 'boolean', // use the conversion method `boolean`

    // Custom conversion for `VARIABLE_7`
    VARIABLE_7: 'bool', // use the conversion method alias `bool` -> `boolean`

    // Custom conversion for `VARIABLE_8`
    VARIABLE_8: 'anything-else', // the conversion method `string` will be used by default
}

const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (string) 'agree'
console.log(parsed.VARIABLE_2)          // (boolean) true
console.log(parsed.VARIABLE_3)          // (boolean) true
console.log(parsed.VARIABLE_4)          // (number) 0
console.log(parsed.VARIABLE_5)          // (boolean) false
console.log(parsed.VARIABLE_6)          // (boolean) false
console.log(parsed.VARIABLE_7)          // (boolean) false
console.log(parsed.VARIABLE_8)          // (string) 'boolean:true'
console.log(process.env.VARIABLE_1)     // (string) 'agree'
console.log(process.env.VARIABLE_2)     // (string) 'true'
console.log(process.env.VARIABLE_3)     // (string) 'true'
console.log(process.env.VARIABLE_4)     // (string) '0'
console.log(process.env.VARIABLE_5)     // (string) 'false'
console.log(process.env.VARIABLE_6)     // (string) 'false'
console.log(process.env.VARIABLE_7)     // (string) 'false'
console.log(process.env.VARIABLE_8)     // (string) 'boolean:true'
```

***Note:* The function used in custom conversion also has 3 params in order
like the conversion methods: `value`, `name` and `config`.
See the note at the end of [Custom Methods](#custom-methods).

### Prevent Variables from Conversion

```dotenv
# .env file
VARIABLE_1=boolean:true
VARIABLE_2=object:{"foo":"bar"}
VARIABLE_3=boolean:true
VARIABLE_4=object:{"foo":"bar"}
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()

// Declare variables that should be excluded in any conversion
config.prevents = ['VARIABLE_3', 'VARIABLE_4']

const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE_1)          // (boolean) true
console.log(parsed.VARIABLE_2)          // (object) {"foo": "bar"}
console.log(parsed.VARIABLE_3)          // (string) 'bool:true'
console.log(parsed.VARIABLE_4)          // (string) 'object:{"foo":"bar"}'
console.log(process.env.VARIABLE_1)     // (string) 'true'
console.log(process.env.VARIABLE_2)     // (string) '{"foo":"bar"}'
console.log(process.env.VARIABLE_3)     // (string) 'bool:true'
console.log(process.env.VARIABLE_4)     // (string) 'object:{"foo":"bar"}'
```

### Ignore `process.env`

By default, after conversion, the variables will also be saved into `process.env` with their values kept in string
format.
If you want to ignore this execution, please do as follows:

- Standalone:

```javascript
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const options = {
    parsed: {
        VARIABLE: 'yes',
    },
    fromDotEnv: false,
}

// Ignore process.env
options.ignoreProcessEnv = true

const {parsed} = dotenvConversion.convert(options)
console.log(parsed.VARIABLE)        // (boolean) true
console.log(process.env.VARIABLE)   // (undefined) undefined // if not ignore, value will be 'true'
```

- With `dotenv`:

```dotenv
# .env file
VARIABLE=yes
```

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenv from 'dotenv'
// import dotenvConversion from 'dotenv-conversion'

const config = dotenv.config()

// Ignore process.env
config.ignoreProcessEnv = true

const {parsed} = dotenvConversion.convert(config)
console.log(parsed.VARIABLE)        // (boolean) true
console.log(process.env.VARIABLE)   // (string) 'yes' // if not ignore, value will be 'true'
```

## Documentation

`dotenv-conversion` exposes only 1 function:

- `convert`

### `convert`

`convert` function will convert environment variables inside the `parsed` option.
Its return value is the options used in conversion with the `parsed` option
now containing the converted environment variables.

```javascript
const dotenvConversion = require('dotenv-conversion')
/* or ES6 */
// import dotenvConversion from 'dotenv-conversion'

const options = {
    parsed: {
        // ... environment variables
    },
    fromDotEnv: false, // if usage is `standalone`
}
const result = dotenvConversion.convert(options)
console.log(result)

/* CONSOLE OUTPUT:
{
    parsed: {
        // ... converted environment variables
    },
    fromDotEnv: false,
    // ... other options
}
*/
```

#### Options

##### `parsed`

*Type:* `object`.

This option contains environment variables before and after converting.

##### `fromDotEnv`

*Type:* `boolean`. *Default:* `true`.

If using with `dotenv` or `dotenv-flow`, please do not set this option,
or set it to `true`. Otherwise, remember to set it to `false`.

See [usage](#usage).

This option is due to an [issue of `dotenv`](https://github.com/motdotla/dotenv/issues/521)
that has not been resolved yet. When it is `true`, `dotenv-conversion` will apply its own fix.

##### `ignoreProcessEnv`

*Type:* `boolean`. *Default:* `false`.

If this option is set to `false`, the environment variables' values
after converting will be written back to `process.env`.
If this option is set to `true`, they won't.

See [this feature](#ignore-processenv).

##### `binaryNumber`

*Type:* `boolean`. *Default:* `true`.

If this option is set to `false`, the string in binary number format
will not be converted to number.

##### `octalNumber`

*Type:* `boolean`. *Default:* `true`.

If this option is set to `false`, the string in octal number format
will not be converted to number.

##### `hexadecimalNumber`

*Type:* `boolean`. *Default:* `true`.

If this option is set to `false`, the string in hexadecimal number format
will not be converted to number.

##### `binaryBigInt`

*Type:* `boolean`. *Default:* `true`.

If this option is set to `false`, the string in binary bigint format
will not be converted to bigint.

##### `octalBigInt`

*Type:* `boolean`. *Default:* `true`.

If this option is set to `false`, the string in octal bigint format
will not be converted to bigint.

##### `hexadecimalBigInt`

*Type:* `boolean`. *Default:* `true`.

If this option is set to `false`, the string in hexadecimal bigint format
will not be converted to bigint.

##### `prevents`

*Type:* `array`. *Default:* `[]`.

List of environment variables which won't be converted.

See [this feature](#prevent-variables-from-conversion).

##### `specs`

*Type:* `object`. *Default:* `{}`.

Contains custom conversions for specific environment variables.

See [this feature](#custom-conversion-for-a-specific-variable).

##### `methods`

*Type:* `object`. *Default:* `{}`.

Contains custom conversion methods.

See [this feature](#custom-methods).

##### `methodAliases`

*Type:* `object`. *Default:* `{}`.

Contains conversion method aliases.

See [this feature](#method-aliases).
