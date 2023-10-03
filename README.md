# dotenv-conversion

[![NPM version](https://img.shields.io/npm/v/dotenv-conversion.svg?style=flat-square)](https://www.npmjs.com/package/dotenv-conversion)
[![Travis (.org)](https://img.shields.io/travis/com/linhntaim/dotenv-conversion?style=flat-square)](https://app.travis-ci.com/github/linhntaim/dotenv-conversion)
[![Coveralls github](https://img.shields.io/coveralls/github/linhntaim/dotenv-conversion?style=flat-square)](https://coveralls.io/github/linhntaim/dotenv-conversion)
[![NPM](https://img.shields.io/npm/l/dotenv-conversion?style=flat-square)](https://github.com/linhntaim/dotenv-conversion/blob/master/LICENSE)

Dotenv-conversion adds variable conversion on top of dotenv. 
If you find yourself needing to convert/transform environment variables to anything you want, then dotenv-conversion is your tool.

## Installation

```bash
npm install dotenv-conversion --save
```

## Usage

- Standalone:

```javascript
const dotenvConversion = require('dotenv-conversion')

const config = {
    parsed: {
        DEBUG: 'false',
    },
}

const {parsed} = dotenvConversion.convert(config)
console.log(parsed.DEBUG) // false -> boolean
console.log(process.env.DEBUG) // 'false' -> string
```

- Integrate with [`dotenv`](https://github.com/motdotla/dotenv):

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
const {parsed} = dotenvConversion.convert(dotenvConfig)
console.log(parsed.DEBUG)       // (boolean) false
console.log(process.env.DEBUG)  // (string) 'false'
```

- ... and [`dotenv-expand`](https://github.com/motdotla/dotenv-expand):

```dotenv
# .env file
DEBUG_LEVEL=0
DEBUG=bool:$DEBUG_LEVEL
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
console.log(process.env.DEBUG_LEVEL)    // (string) '0'
console.log(process.env.DEBUG)          // (string) 'false'
```

## Features

### Auto-Conversion

Environment variables will be converted automatically based on its value by default.

Currently, auto-conversion supports:

- **null**

Values to be a null: `null`, `Null`, `NULL`.

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

Values to be an undefined: `undefined`, `UNDEFINED`.

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

Values to be a true: `true`, `True`, `TRUE`, `yes`, `Yes`, `YES`.

Values to be a false: `false`, `False`, `FALSE`, `no`, `No`, `NO`.

*Spaces will be trimmed.*

```dotenv
# .env file
VARIABLE_1=true
VARIABLE_2=false
VARIABLE_3=" true "
VARIABLE_4=" false "
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

Values to be a number: `NaN`, `±Infinity` 
and any valid numbers (e.g. `±5`, `±5.`, `±.5`, `±4.5`, `±4.5e±123`, ...).

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
```

- **bigint**

Values to be a bigint must match the format: `${integer}n`.

*Spaces will be trimmed.*

```dotenv
# .env file
VARIABLE_1=5n
VARIABLE_2=-5n
VARIABLE_3=" 5n "
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
console.log(process.env.VARIABLE_1)     // (string) '5n'
console.log(process.env.VARIABLE_2)     // (string) '-5n'
console.log(process.env.VARIABLE_3)     // (string) '5n'
```

- **symbol**

Values to be a symbol must match the format: `Symbol(${string})`.

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

Values to be an array must match the format: a string contains `${value}` separated by `,`; 
the `value` could be `null`,`boolean`, `number`, `"string"`, `[..array..]` or `{..object..}`; 
and all could be wrapped or not wrapped by `[` and `]` (*must*, when the string is empty).

*Spaces will be trimmed.*

```dotenv
# .env file
VARIABLE_1=[null,true,1,"a",[-1,2.1,3e1,4.5e123],{"x":"y"}]
VARIABLE_2=null,true,1,"a",[-1,2.1,3e1,4.5e123],{"x":"y"}
VARIABLE_3=" [null, true, 1, \" x y \"] "
VARIABLE_4=" null, true, 1, \" x y \" "
VARIABLE_5=" [ ] "
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
console.log(process.env.VARIABLE_1)     // (string) '[null,true,1,"a",[-1,2.1,30,4.5e+123],{"x":"y"}]'
console.log(process.env.VARIABLE_2)     // (string) '[null,true,1,"a",[-1,2.1,30,4.5e+123],{"x":"y"}]'
console.log(process.env.VARIABLE_3)     // (string) '[null,true,1," x y "]'
console.log(process.env.VARIABLE_4)     // (string) '[null,true,1," x y "]'
console.log(process.env.VARIABLE_5)     // (string) '[]'
```

- **json**

Values to be a json must match the format:
a string contains pairs of `${key}:${value}` separated by `,`; the `key` must be `"string"` 
and the `value` could be `null`,`boolean`, `number`, `"string"`, `[..array..]` or `{..object..}`; 
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

### Custom Conversion on Specific Attribute

#### Using existed conversion

```dotenv
# .env file
VARIABLE=1
```

```javascript
// .js file
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
dotenvConversion.make(dotenv.config(), {
    specs: {
        VARIABLE: 'bool', // apply 'bool' conversion to VARIABLE
    },
})

console.log(process.env.VARIABLE) // (string) 'true'
console.log(dotenvConversion.env.VARIABLE) // (boolean) true
```

#### Define a customized conversion

```dotenv
# .env file
VARIABLE=text
```

```javascript
// .js file
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
dotenvConversion.make(dotenv.config(), {
    specs: {
        VARIABLE(value) { // customize the conversion applied to VARIABLE
            return value.toUpperCase() 
        },
    },
})

console.log(process.env.VARIABLE) // (string) 'TEXT'
console.log(dotenvConversion.env.VARIABLE) // (string) 'TEXT'
```

### Override an existed Conversion

```dotenv
# .env file
VARIABLE='{"foo":"bar"}'
```

```javascript
// .js file
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
dotenvConversion.make(dotenv.config(), {
    override: {
        json(value) { // override the existed 'json' conversion
            try {
                return {
                    original: value,
                    parsed: JSON.parse(value),
                }
            }
            catch (e) { 
                return value
            } 
        },
    },
})

console.log(process.env.VARIABLE) // (string) '{"original":"{\\"foo\\":\\"bar\\"}","parsed":{"foo":"bar"}}
console.log(dotenvConversion.env.VARIABLE) // (object) {original: '{"foo":"bar"}', parsed: {foo: 'bar'}}
```

### Prevent Attributes from Conversion

```dotenv
# .env file
VARIABLE_1=bool:1
VARIABLE_2='{"foo":"bar"}'
```

```javascript
// .js file
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
dotenvConversion.make(dotenv.config(), {
    prevents: ['VARIABLE_1', 'VARIABLE_2'],
})

console.log(process.env.VARIABLE_1) // (string) 'bool:1'
console.log(process.env.VARIABLE_2) // (string) '{"foo":"bar"}'
console.log(dotenvConversion.env.VARIABLE_1) // (string) 'bool:1'
console.log(dotenvConversion.env.VARIABLE_2) // (string) '{"foo":"bar"}'
```

### Default Value when Getting Environment Variables

```javascript
// .js file
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
dotenvConversion.make(dotenv.config())

console.log(process.env.NOT_SET) // undefined
console.log(dotenvConversion.env.NOT_SET) // undefined
console.log(dotenvConversion.getenv('NOT_SET', 'default_value')) // (string) 'default_value'
```
