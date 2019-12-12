# dotenv-conversion
An extension for dotenv is to help converting environment variables to anything you want.

## Installation

```bash
npm install dotenv-conversion
```

## Usage

- Basic:

```javascript
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')

const myEnv = dotenv.config()
dotenvConversion.make(myEnv)
```

- Along with `dotenv-expand`:

```javascript
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const dotenvConversion = require('dotenv-conversion')

const myEnv = dotenv.config()
dotenvConversion.make(dotenvExpand(myEnv))
```

## Features

### Auto-Conversion

Environment variables will be converted automatically based on some detection.

Currently, auto-conversion supports:

- **raw**

```
# env
VARIABLE_1=text
VARIABLE_2=raw:any
```

```javascript
// js
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
dotenvConversion.make(dotenv.config())

console.log(process.env.VARIABLE_1) // output: 'text'
console.log(process.env.VARIABLE_2) // output: 'any'
console.log(dotenvConversion.env.VARIABLE_1) // output: 'text'
console.log(dotenvConversion.env.VARIABLE_2) // output: 'any'
```

- **null**

```
# env
VARIABLE=null
```

```javascript
// js
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
dotenvConversion.make(dotenv.config())

console.log(process.env.VARIABLE) // output: ''
console.log(dotenvConversion.env.VARIABLE) // output: ''
```

- **bool**

```
# env
VARIABLE_1=true
VARIABLE_2=false
VARIABLE_3=bool:any
VARIABLE_4=bool:0
...
```

```javascript
// js
const dotenv = require('dotenv')
const dotenvConversion = require('dotenv-conversion')
dotenvConversion.make(dotenv.config())

console.log(process.env.VARIABLE_1) // output: 'true'
console.log(process.env.VARIABLE_2) // output: 'false'
console.log(process.env.VARIABLE_3) // output: 'true'
console.log(process.env.VARIABLE_4) // output: 'false'
console.log(dotenvConversion.env.VARIABLE_1) // output: true
console.log(dotenvConversion.env.VARIABLE_2) // output: false
console.log(dotenvConversion.env.VARIABLE_3) // output: true
console.log(dotenvConversion.env.VARIABLE_4) // output: false
```

- **number**

```
# env
VARIABLE_1=0123456789
VARIABLE_2=01.23456789
VARIABLE_3=-02.2e123
VARIABLE_4=number:123any
...
```

```javascript
// js
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

```
# env
VARIABLE_1='[1,"2,3","4,5",6]'
VARIABLE_2=array:1,2,3,4,5,6
VARIABLE_2=array:1,2\\,3,4\\,5,6
...
```

```javascript
// js
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

```
# env
VARIABLE_1='{"foo":"bar"}'
VARIABLE_2='json:{"foo":"bar"}'
...
```

```javascript
// js
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
```
# env
VARIABLE=1
```

```javascript
// js
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

```
# env
VARIABLE=text
```

```javascript
// js
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

### Override an existed Conversion on Specific Attribute

```
# env
VARIABLE='{"foo":"bar"}'
```

```javascript
// js
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

```
# env
VARIABLE_1=bool:1
VARIABLE_2='{"foo":"bar"}'
```

```javascript
// js
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