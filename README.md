# dotenv-conversion

[![NPM version](https://img.shields.io/npm/v/dotenv-conversion.svg?style=flat-square)](https://www.npmjs.com/package/dotenv-conversion)
[![Travis (.org)](https://img.shields.io/travis/linhntaim/dotenv-conversion?style=flat-square)](https://travis-ci.org/linhntaim/dotenv-conversion)
[![Coveralls github](https://img.shields.io/coveralls/github/linhntaim/dotenv-conversion?style=flat-square)](https://coveralls.io/github/linhntaim/dotenv-conversion)
[![NPM](https://img.shields.io/npm/l/dotenv-conversion?style=flat-square)](https://github.com/linhntaim/dotenv-conversion/blob/master/LICENSE)

An extension for dotenv is to help convert environment variables to anything you want.

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
// .. or: const myAllConvertedEnv = dotenvConversion.env
// Get a converted variable from process.env by its name
const variable = dotenvConversion.getenv('VARIABLE_NAME')
// .. or: const variable = dotenvConversion.env.VARIABLE_NAME
```

- Along with [`dotenv-expand`](https://github.com/motdotla/dotenv-expand):

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
// .. or: const myAllConvertedEnv = dotenvConversion.env
// Get a converted variable from process.env by its name
const variable = dotenvConversion.getenv('VARIABLE_NAME')
// .. or: const variable = dotenvConversion.env.VARIABLE_NAME
```

## Features

### Auto-Conversion

Environment variables will be converted automatically based on some detection.

Currently, auto-conversion supports:

- **raw**

```dotenv
# .env file
VARIABLE_1=text
VARIABLE_2=raw:any
```

```javascript
// .js file
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
dotenvConversion.make(dotenv.config())

console.log(process.env.VARIABLE_1) // (string) 'text'
console.log(process.env.VARIABLE_2) // (string) 'any'
console.log(dotenvConversion.env.VARIABLE_1) // (string) 'text'
console.log(dotenvConversion.env.VARIABLE_2) // (string) 'any'
```

- **null**

```dotenv
# .env file
VARIABLE=null
```

```javascript
// .js file
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
dotenvConversion.make(dotenv.config())

console.log(process.env.VARIABLE) // (string) ''
console.log(dotenvConversion.env.VARIABLE) // (string) ''
```

- **bool**

```dotenv
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

console.log(process.env.VARIABLE_1) // (string) 'true'
console.log(process.env.VARIABLE_2) // (string) 'false'
console.log(process.env.VARIABLE_3) // (string) 'true'
console.log(process.env.VARIABLE_4) // (string) 'false'
console.log(process.env.VARIABLE_5) // (string) 'true'
console.log(process.env.VARIABLE_6) // (string) 'false'
console.log(dotenvConversion.env.VARIABLE_1) // (boolean) true
console.log(dotenvConversion.env.VARIABLE_2) // (boolean) false
console.log(dotenvConversion.env.VARIABLE_3) // (boolean) true
console.log(dotenvConversion.env.VARIABLE_4) // (boolean) false
console.log(dotenvConversion.env.VARIABLE_5) // (boolean) true
console.log(dotenvConversion.env.VARIABLE_6) // (boolean) false
```

- **number**

```dotenv
# .env file
VARIABLE_1=0123456789
VARIABLE_2=01.23456789
VARIABLE_3=-02.2e123
VARIABLE_4=number:123any
VARIABLE_5=number:
...
```

```javascript
// .js file
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
dotenvConversion.make(dotenv.config())

console.log(process.env.VARIABLE_1) // (string) '123456789'
console.log(process.env.VARIABLE_2) // (string) '1.23456789'
console.log(process.env.VARIABLE_3) // (string) '-2.2e+123'
console.log(process.env.VARIABLE_4) // (string) '123'
console.log(process.env.VARIABLE_5) // (string) '0'
console.log(dotenvConversion.env.VARIABLE_1) // (number) 123456789
console.log(dotenvConversion.env.VARIABLE_2) // (number) 1.23456789
console.log(dotenvConversion.env.VARIABLE_3) // (number) -2.2e+123
console.log(dotenvConversion.env.VARIABLE_4) // (number) 123
console.log(dotenvConversion.env.VARIABLE_5) // (number) 0
```

- **array**

```dotenv
# .env file
VARIABLE_1='[1,"2,3","4,5",6]'
VARIABLE_2=array:1,2,3,4,5,6
VARIABLE_3=array:1,2\\,3,4\\,5,6
VARIABLE_4=array:
...
```

```javascript
// .js file
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
dotenvConversion.make(dotenv.config())

console.log(process.env.VARIABLE_1) // (string) '[1,"2,3","4,5",6]'
console.log(process.env.VARIABLE_2) // (string) '[1,2,3,4,5,6]'
console.log(process.env.VARIABLE_3) // (string) '["1","2,3","4,5","6"]'
console.log(process.env.VARIABLE_4) // (string) '[]'
console.log(dotenvConversion.env.VARIABLE_1) // (array) [1, '2,3', '4,5', 6]
console.log(dotenvConversion.env.VARIABLE_2) // (array) ['1', '2', '3', '4', '5', '6']
console.log(dotenvConversion.env.VARIABLE_3) // (array) ['1', '2,3', '4,5', '6']
console.log(dotenvConversion.env.VARIABLE_3) // (array) ['1', '2,3', '4,5', '6']
console.log(dotenvConversion.env.VARIABLE_4) // (array) []
```

- **json**

```dotenv
# .env file
VARIABLE_1='{"foo":"bar"}'
VARIABLE_2='json:{"foo":"bar"}'
VARIABLE_3='json:'
...
```

```javascript
// .js file
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
dotenvConversion.make(dotenv.config())

console.log(process.env.VARIABLE_1) // (string) '{"foo":"bar"}'
console.log(process.env.VARIABLE_2) // (string) '{"foo":"bar"}'
console.log(process.env.VARIABLE_3) // (string) '{}'
console.log(dotenvConversion.env.VARIABLE_1) // (object) {foo: 'bar'}
console.log(dotenvConversion.env.VARIABLE_2) // (object) {foo: 'bar'}
console.log(dotenvConversion.env.VARIABLE_3) // (object) {}
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
