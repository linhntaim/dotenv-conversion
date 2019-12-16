# dotenv-conversion

[![NPM version](https://img.shields.io/npm/v/dotenv-conversion.svg?style=flat-square)](https://www.npmjs.com/package/dotenv-conversion)
[![Travis (.org)](https://img.shields.io/travis/linhntaim/dotenv-conversion?style=flat-square)](https://travis-ci.org/linhntaim/dotenv-conversion)
[![Coveralls github](https://img.shields.io/coveralls/github/linhntaim/dotenv-conversion?style=flat-square)](https://coveralls.io/github/linhntaim/dotenv-conversion)
[![NPM](https://img.shields.io/npm/l/dotenv-conversion?style=flat-square)](https://github.com/linhntaim/dotenv-conversion/blob/master/LICENSE)

An extension for dotenv is to help converting environment variables to anything you want.

## Installation

```bash
npm install dotenv-conversion
```

## Usage

- Basic:

```javascript
// javascript

const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')

// Parse variables from .env file
const myEnv = dotenv.config()
// Convert parsed variables from .env file with auto-conversion method
const myConvertedEnv = dotenvConversion.make(myEnv)
// Get converted variables from process.env (which has already added - but has been not overwritten by - parsed variables from .env file)
const myAllConvertedEnv = dotenvConversion.getenv()
// Get a converted variable from process.env by its name
const variable = dotenvConversion.getenv('VARIABLE_NAME')
const variable = dotenvConversion.env.VARIABLE_NAME
```

- Along with `dotenv-expand` (https://github.com/motdotla/dotenv-expand):

```javascript
// javascript

const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const dotenvConversion = require('dotenv-conversion')

// Parse variables from .env file
const myEnv = dotenv.config()
// Convert parsed variables from .env file with auto-conversion method
const myConvertedEnv = dotenvConversion.make(dotenvExpand(myEnv))
// Get converted variables from process.env (which has already added - but has been not overwritten by - parsed variables from .env file)
const myAllConvertedEnv = dotenvConversion.getenv()
// Get a converted variable from process.env by its name
const variable = dotenvConversion.getenv('VARIABLE_NAME')
const variable = dotenvConversion.env.VARIABLE_NAME
```

## Features

### Auto-Conversion

Environment variables will be converted automatically based on some detection.

Currently, auto-conversion supports:

- **raw**

```smartyconfig
# .env file
VARIABLE_1=text
VARIABLE_2=raw:any
```

```javascript
// .js file
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
dotenvConversion.make(dotenv.config())

console.log(process.env.VARIABLE_1) // output: 'text'
console.log(process.env.VARIABLE_2) // output: 'any'
console.log(dotenvConversion.env.VARIABLE_1) // output: 'text'
console.log(dotenvConversion.env.VARIABLE_2) // output: 'any'
```

- **null**

```smartyconfig
# .env file
VARIABLE=null
```

```javascript
// .js file
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
dotenvConversion.make(dotenv.config())

console.log(process.env.VARIABLE) // output: ''
console.log(dotenvConversion.env.VARIABLE) // output: ''
```

- **bool**

```smartyconfig
# .env file
VARIABLE_1=true
VARIABLE_2=false
VARIABLE_3=yes
VARIABLE_4=no
VARIABLE_5=bool:any
VARIABLE_6=bool:0 # Accepted: <empty>, false, NaN, no, not, none, null, undefined, 0000
...
```

```javascript
// .js file
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
dotenvConversion.make(dotenv.config())

console.log(process.env.VARIABLE_1) // output: 'true'
console.log(process.env.VARIABLE_2) // output: 'false'
console.log(process.env.VARIABLE_3) // output: 'true'
console.log(process.env.VARIABLE_4) // output: 'false'
console.log(process.env.VARIABLE_5) // output: 'true'
console.log(process.env.VARIABLE_6) // output: 'false'
console.log(dotenvConversion.env.VARIABLE_1) // output: true
console.log(dotenvConversion.env.VARIABLE_2) // output: false
console.log(dotenvConversion.env.VARIABLE_3) // output: true
console.log(dotenvConversion.env.VARIABLE_4) // output: false
console.log(dotenvConversion.env.VARIABLE_5) // output: true
console.log(dotenvConversion.env.VARIABLE_6) // output: false
```

- **number**

```smartyconfig
# .env file
VARIABLE_1=0123456789
VARIABLE_2=01.23456789
VARIABLE_3=-02.2e123
VARIABLE_4=number:123any
...
```

```javascript
// .js file
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
dotenvConversion.make(dotenv.config())

console.log(process.env.VARIABLE_1) // output: '123456789'
console.log(process.env.VARIABLE_2) // output: '1.23456789'
console.log(process.env.VARIABLE_3) // output: '-2.2e+123'
console.log(process.env.VARIABLE_4) // output: '123'
console.log(dotenvConversion.env.VARIABLE_1) // output: 123456789
console.log(dotenvConversion.env.VARIABLE_2) // output: 1.23456789
console.log(dotenvConversion.env.VARIABLE_3) // output: -2.2e+123
console.log(dotenvConversion.env.VARIABLE_4) // output: 123
```

- **array**

```smartyconfig
# .env file
VARIABLE_1='[1,"2,3","4,5",6]'
VARIABLE_2=array:1,2,3,4,5,6
VARIABLE_2=array:1,2\\,3,4\\,5,6
...
```

```javascript
// .js file
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
dotenvConversion.make(dotenv.config())

console.log(process.env.VARIABLE_1) // output: '[1,"2,3","4,5",6]'
console.log(process.env.VARIABLE_2) // output: '[1,2,3,4,5,6]'
console.log(process.env.VARIABLE_3) // output: '["1","2,3","4,5","6"]'
console.log(dotenvConversion.env.VARIABLE_1) // output: [1, '2,3', '4,5', 6]
console.log(dotenvConversion.env.VARIABLE_2) // output: ['1', '2', '3', '4', '5', '6']
console.log(dotenvConversion.env.VARIABLE_3) // output: ['1', '2,3', '4,5', '6']
```

- **json**

```smartyconfig
# .env file
VARIABLE_1='{"foo":"bar"}'
VARIABLE_2='json:{"foo":"bar"}'
...
```

```javascript
// .js file
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
dotenvConversion.make(dotenv.config())

console.log(process.env.VARIABLE_1) // output: '{"foo":"bar"}'
console.log(process.env.VARIABLE_2) // output: '{"foo":"bar"}'
console.log(dotenvConversion.env.VARIABLE_1) // output: {foo: 'bar'}
console.log(dotenvConversion.env.VARIABLE_2) // output: {foo: 'bar'}
```

### Custom Conversion on Specific Attribute

#### Using existed conversion

```smartyconfig
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

console.log(process.env.VARIABLE) // output: 'true'
console.log(dotenvConversion.env.VARIABLE) // output: true
```

#### Define a customized conversion

```smartyconfig
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

console.log(process.env.VARIABLE) // output: 'TEXT'
console.log(dotenvConversion.env.VARIABLE) // output: 'TEXT'
```

### Override an existed Conversion

```smartyconfig
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

console.log(process.env.VARIABLE) // output: '{"original":"{\\"foo\\":\\"bar\\"}","parsed":{"foo":"bar"}}
console.log(dotenvConversion.env.VARIABLE) // output: '{original: '{"foo":"bar"}', parsed: {foo: 'bar'}}
```

### Prevent Attributes from Conversion

```smartyconfig
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

console.log(process.env.VARIABLE_1) // output: 'bool:1'
console.log(process.env.VARIABLE_2) // output: '{"foo":"bar"}'
console.log(dotenvConversion.env.VARIABLE_1) // output: 'bool:1'
console.log(dotenvConversion.env.VARIABLE_2) // output: '{"foo":"bar"}'
```
