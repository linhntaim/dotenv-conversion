import chai from 'chai'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import dotenvFlow from 'dotenv-flow'
import dotenvConversion from '../src'
import fs from 'fs'
import mocha from 'mocha'

const after = mocha.after
const afterEach = mocha.afterEach
const describe = mocha.describe
const it = mocha.it
const expect = chai.expect
chai.should()

const originEnv = {...process.env}

describe('dotenv-conversion', function () {
    afterEach(() => {
        process.env = {...originEnv}
    })

    describe('convert:config', function () {
        it('default', function (done) {
            // input

            // output
            const expectedParsed = {}
            const expectedFromDotEnv = true
            const expectedIgnoreProcessEnv = false
            const expectedPrevents = []
            const expectedSpecs = {}
            const expectedMethods = [
                'auto',
                'boolean',
                'number',
                'bigint',
                'string',
                'symbol',
                'array',
                'object',
            ]
            const expectedMethodAliases = {
                bool: 'boolean',
                num: 'number',
                big: 'bigint',
                str: 'string',
                arr: 'array',
                obj: 'object',
            }

            const dotenvConversionConfig = dotenvConversion.convert()

            dotenvConversionConfig.should.be.an('object')
            dotenvConversionConfig.should.have.property('parsed')
            dotenvConversionConfig.should.have.property('fromDotEnv')
            dotenvConversionConfig.should.have.property('ignoreProcessEnv')
            dotenvConversionConfig.should.have.property('prevents')
            dotenvConversionConfig.should.have.property('specs')
            dotenvConversionConfig.should.have.property('methods')
            dotenvConversionConfig.should.have.property('methodAliases')

            dotenvConversionConfig.parsed.should.deep.equal(expectedParsed)
            dotenvConversionConfig.fromDotEnv.should.equal(expectedFromDotEnv)
            dotenvConversionConfig.ignoreProcessEnv.should.equal(expectedIgnoreProcessEnv)
            dotenvConversionConfig.prevents.should.deep.equal(expectedPrevents)
            dotenvConversionConfig.specs.should.deep.equal(expectedSpecs)
            Object.keys(dotenvConversionConfig.methods).should.deep.equal(expectedMethods)
            dotenvConversionConfig.methodAliases.should.deep.equal(expectedMethodAliases)

            done()
        })

        it('set', function (done) {
            // input
            const inputConfig = {
                parsed: {
                    TRUE: true,
                    FALSE: 'false',
                    NUMBER: new String('4.5e10'),
                },
                fromDotEnv: false,
                ignoreProcessEnv: true,
                prevents: ['BASIC'],
                specs: {
                    BASIC(value) {
                        return 'BASIC'
                    },
                },
                methods: {
                    // override existing built-in conversion method
                    number(value) {
                        return 'number'
                    },
                    // add new conversion method
                    basic(value) {
                        return 'basic'
                    },
                },
                methodAliases: {
                    raw: 'basic',
                    str: 'basic', // not add - existing alias
                    string: 'basic', // not add - existing method name
                    notAdded: 'basic2', // not add - not existing method
                },
            }

            // output
            const expectedParsed = {
                TRUE: true,
                FALSE: false,
                NUMBER: 45000000000,
            }
            const expectedFromDotEnv = inputConfig.fromDotEnv
            const expectedIgnoreProcessEnv = inputConfig.ignoreProcessEnv
            const expectedPrevents = inputConfig.prevents
            const expectedSpecs = inputConfig.specs
            const expectedMethods = [
                'auto',
                'boolean',
                'number',
                'bigint',
                'string',
                'symbol',
                'array',
                'object',

                'basic',
            ]
            const expectedMethodNumberReturn = 'number'
            const expectedMethodBasicReturn = 'basic'
            const expectedMethodAliases = {
                bool: 'boolean',
                num: 'number',
                big: 'bigint',
                str: 'string',
                arr: 'array',
                obj: 'object',

                raw: 'basic', // only raw added
            }

            const dotenvConversionConfig = dotenvConversion.convert(inputConfig)

            dotenvConversionConfig.should.be.an('object')
            dotenvConversionConfig.should.have.property('parsed')
            dotenvConversionConfig.should.have.property('fromDotEnv')
            dotenvConversionConfig.should.have.property('ignoreProcessEnv')
            dotenvConversionConfig.should.have.property('prevents')
            dotenvConversionConfig.should.have.property('specs')
            dotenvConversionConfig.should.have.property('methods')
            dotenvConversionConfig.should.have.property('methodAliases')

            dotenvConversionConfig.parsed.should.deep.equal(expectedParsed)
            dotenvConversionConfig.fromDotEnv.should.equal(expectedFromDotEnv)
            dotenvConversionConfig.ignoreProcessEnv.should.equal(expectedIgnoreProcessEnv)
            dotenvConversionConfig.prevents.should.deep.equal(expectedPrevents)
            dotenvConversionConfig.specs.should.deep.equal(expectedSpecs)
            Object.keys(dotenvConversionConfig.methods).should.deep.equal(expectedMethods)
            dotenvConversionConfig.methodAliases.should.deep.equal(expectedMethodAliases)
            dotenvConversionConfig.methods.number('value').should.equal(expectedMethodNumberReturn)
            dotenvConversionConfig.methods.basic('value').should.equal(expectedMethodBasicReturn)

            done()
        })

        it('set:invalid-method', function (done) {
            // input
            const inputConfig = {
                methods: {
                    'test:array'(value) {
                        return value
                    },
                },
            }

            // output
            const expectedError = 'Method: Invalid format'

            try {
                dotenvConversion.convert(inputConfig)
            }
            catch (e) {
                e.should.equal(expectedError)
            }

            done()
        })

        it('set:invalid-alias', function (done) {
            // input
            const inputConfig = {
                methodAliases: {
                    'test:array': 'array',
                },
            }

            // output
            const expectedError = 'Alias: Invalid format'

            try {
                dotenvConversion.convert(inputConfig)
            }
            catch (e) {
                e.should.equal(expectedError)
            }

            done()
        })
    })

    describe('convert:standalone', function () {
        function useEnv(env) {
            return {
                fromDotEnv: false,
                parsed: env,
            }
        }

        it('ignoreProcessEnv:no', function (done) {
            // input
            const input = {
                OK: 'yes',
            }
            const inputConfig = {
                ignoreProcessEnv: false,
            }

            // output
            const expected = {
                OK: true,
            }
            const expectedForEnv = {
                OK: 'true',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('ignoreProcessEnv:yes', function (done) {
            // input
            const input = {
                OK: 'yes',
            }
            const inputConfig = {
                ignoreProcessEnv: true,
            }

            // output
            const expected = {
                OK: true,
            }
            const notExpectedForEnv = 'OK'

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.not.have.property(notExpectedForEnv)

            done()
        })

        it('prevents:not-set', function (done) {
            // input
            const input = {
                OK: 'yes',
            }
            const inputConfig = {
                prevents: [],
            }

            // output
            const expected = {
                OK: true,
            }
            const expectedForEnv = {
                OK: 'true',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('prevents:set', function (done) {
            // input
            const input = {
                OK: 'yes',
            }
            const inputConfig = {
                prevents: ['OK'],
            }

            // output
            const expected = {
                OK: 'yes',
            }
            const expectedForEnv = {
                OK: 'yes',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('specs:not-set(default)', function (done) {
            // input
            const input = {
                OK: 'yes',
            }

            // output
            const expected = {
                OK: true,
            }
            const expectedForEnv = {
                OK: 'true',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('specs:set:use-exist-method', function (done) {
            // input
            const input = {
                OK: 'yes',
            }
            const inputConfig = {
                specs: {
                    OK: 'number',
                },
            }

            // output
            const expected = {
                OK: 1,
            }
            const expectedForEnv = {
                OK: '1',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('specs:set:use-exist-method-alias', function (done) {
            // input
            const input = {
                OK: 'yes',
            }
            const inputConfig = {
                specs: {
                    OK: 'num',
                },
            }

            // output
            const expected = {
                OK: 1,
            }
            const expectedForEnv = {
                OK: '1',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('specs:set:use-none-exist-method(fallback->string)', function (done) {
            // input
            const input = {
                OK: 'yes',
            }
            const inputConfig = {
                specs: {
                    OK: 'none-existing-method-will-fallback-to-string-method',
                },
            }

            // output
            const expected = {
                OK: 'yes',
            }
            const expectedForEnv = {
                OK: 'yes',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('specs:set:use-custom-method', function (done) {
            // input
            const input = {
                OK: 'yes',
            }
            const inputConfig = {
                specs: {
                    OK: function (value) {
                        return `custom:${value}`
                    },
                },
            }

            // output
            const expected = {
                OK: 'custom:yes',
            }
            const expectedForEnv = {
                OK: 'custom:yes',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('specs:set:use-anything-else(fallback->string)', function (done) {
            // input
            const input = {
                OK: 'yes',
            }
            const inputConfig = {
                specs: {
                    OK: {'anything else': 'will fallback to string method'},
                },
            }

            // output
            const expected = {
                OK: 'yes',
            }
            const expectedForEnv = {
                OK: 'yes',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('flatten-value:special', function (done) {
            // input
            const inputFunction = function a() {
            }
            const inputClass = class A
            {
            }
            const inputDate = new Date()
            const inputJsonUndefined = {
                toJSON() {
                    return undefined
                },
            }
            const inputJsonFunction = {
                toJSON() {
                    return inputFunction
                },
            }
            const inputJsonClass = {
                toJSON() {
                    return inputClass
                },
            }
            const inputJsonSymbol = {
                toJSON() {
                    return Symbol('a')
                },
            }
            const inputJsonBigInt = {
                toJSON() {
                    return 1n
                },
            }
            const input = {
                FUNCTION: 'FUNCTION',
                CLASS: 'CLASS',
                DATE: 'DATE',
                JSON_UNDEFINED: 'JSON_UNDEFINED',
                JSON_FUNCTION: 'JSON_FUNCTION',
                JSON_CLASS: 'JSON_CLASS',
                JSON_SYMBOL: 'JSON_SYMBOL',
                JSON_BIGINT: 'JSON_BIGINT',
            }
            const inputConfig = {
                specs: {
                    FUNCTION: function (value) {
                        return inputFunction
                    },
                    CLASS: function (value) {
                        return inputClass
                    },
                    DATE: function (value) {
                        return inputDate
                    },
                    JSON_UNDEFINED: function (value) {
                        return inputJsonUndefined
                    },
                    JSON_FUNCTION: function (value) {
                        return inputJsonFunction
                    },
                    JSON_CLASS: function (value) {
                        return inputJsonClass
                    },
                    JSON_SYMBOL: function (value) {
                        return inputJsonSymbol
                    },
                    JSON_BIGINT: function (value) {
                        return inputJsonBigInt
                    },
                },
            }

            // output
            const expected = {
                FUNCTION: inputFunction,
                CLASS: inputClass,
                DATE: inputDate,
                JSON_UNDEFINED: inputJsonUndefined,
                JSON_FUNCTION: inputJsonFunction,
                JSON_CLASS: inputJsonClass,
                JSON_SYMBOL: inputJsonSymbol,
                JSON_BIGINT: inputJsonBigInt,
            }
            const expectedForEnv = {
                FUNCTION: 'undefined',
                CLASS: 'undefined',
                DATE: inputDate.toISOString(),
                JSON_UNDEFINED: 'undefined',
                JSON_FUNCTION: 'undefined',
                JSON_CLASS: 'undefined',
                JSON_SYMBOL: 'undefined',
                JSON_BIGINT: 'undefined',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:auto:null', function (done) {
            // input
            const input = {
                NULL_1: 'null',
                NULL_2: 'Null',
                NULL_3: 'NULL',

                NULL_101: ' null ',

                // No conversion
                NULL_1001: 'NuLL',
            }

            // output
            const expected = {
                NULL_1: null,
                NULL_2: null,
                NULL_3: null,

                NULL_101: null,

                // No conversion
                NULL_1001: 'NuLL',
            }
            const expectedForEnv = {
                NULL_1: 'null',
                NULL_2: 'null',
                NULL_3: 'null',

                NULL_101: 'null',

                // No conversion
                NULL_1001: 'NuLL',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:auto:undefined', function (done) {
            // input
            const input = {
                UNDEFINED_1: 'undefined',
                UNDEFINED_2: 'UNDEFINED',

                UNDEFINED_101: ' undefined ',

                // No conversion
                UNDEFINED_1001: 'Undefined',
            }

            // output
            const expected = {
                UNDEFINED_1: undefined,
                UNDEFINED_2: undefined,

                UNDEFINED_101: undefined,

                // No conversion
                UNDEFINED_1001: 'Undefined',
            }
            const expectedForEnv = {
                UNDEFINED_1: 'undefined',
                UNDEFINED_2: 'undefined',

                UNDEFINED_101: 'undefined',

                // No conversion
                UNDEFINED_1001: 'Undefined',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:auto:boolean', function (done) {
            // input
            const input = {
                BOOLEAN_1: 'true',
                BOOLEAN_2: 'True',
                BOOLEAN_3: 'TRUE',
                BOOLEAN_4: 'yes',
                BOOLEAN_5: 'Yes',
                BOOLEAN_6: 'YES',
                BOOLEAN_7: 'ok',
                BOOLEAN_8: 'Ok',
                BOOLEAN_9: 'OK',

                BOOLEAN_11: 'false',
                BOOLEAN_12: 'False',
                BOOLEAN_13: 'FALSE',
                BOOLEAN_14: 'no',
                BOOLEAN_15: 'No',
                BOOLEAN_16: 'NO',
                BOOLEAN_17: 'not',
                BOOLEAN_18: 'Not',
                BOOLEAN_19: 'NOT',
                BOOLEAN_20: 'none',
                BOOLEAN_21: 'None',
                BOOLEAN_22: 'NONE',

                BOOLEAN_101: ' true ',
                BOOLEAN_102: ' false ',

                // No conversion
                BOOLEAN_1001: 'TruE',
                BOOLEAN_1002: 'YeS',
                BOOLEAN_1003: 'oK',
                BOOLEAN_1004: 'FalsE',
                BOOLEAN_1005: 'nO',
                BOOLEAN_1006: 'NoT',
                BOOLEAN_1007: 'NonE',
            }

            // output
            const expected = {
                BOOLEAN_1: true,
                BOOLEAN_2: true,
                BOOLEAN_3: true,
                BOOLEAN_4: true,
                BOOLEAN_5: true,
                BOOLEAN_6: true,
                BOOLEAN_7: true,
                BOOLEAN_8: true,
                BOOLEAN_9: true,

                BOOLEAN_11: false,
                BOOLEAN_12: false,
                BOOLEAN_13: false,
                BOOLEAN_14: false,
                BOOLEAN_15: false,
                BOOLEAN_16: false,
                BOOLEAN_17: false,
                BOOLEAN_18: false,
                BOOLEAN_19: false,
                BOOLEAN_20: false,
                BOOLEAN_21: false,
                BOOLEAN_22: false,

                BOOLEAN_101: true,
                BOOLEAN_102: false,

                // No conversion
                BOOLEAN_1001: 'TruE',
                BOOLEAN_1002: 'YeS',
                BOOLEAN_1003: 'oK',
                BOOLEAN_1004: 'FalsE',
                BOOLEAN_1005: 'nO',
                BOOLEAN_1006: 'NoT',
                BOOLEAN_1007: 'NonE',
            }
            const expectedForEnv = {
                BOOLEAN_1: 'true',
                BOOLEAN_2: 'true',
                BOOLEAN_3: 'true',
                BOOLEAN_4: 'true',
                BOOLEAN_5: 'true',
                BOOLEAN_6: 'true',
                BOOLEAN_7: 'true',
                BOOLEAN_8: 'true',
                BOOLEAN_9: 'true',

                BOOLEAN_11: 'false',
                BOOLEAN_12: 'false',
                BOOLEAN_13: 'false',
                BOOLEAN_14: 'false',
                BOOLEAN_15: 'false',
                BOOLEAN_16: 'false',
                BOOLEAN_17: 'false',
                BOOLEAN_18: 'false',
                BOOLEAN_19: 'false',
                BOOLEAN_20: 'false',
                BOOLEAN_21: 'false',
                BOOLEAN_22: 'false',

                BOOLEAN_101: 'true',
                BOOLEAN_102: 'false',

                // No conversion
                BOOLEAN_1001: 'TruE',
                BOOLEAN_1002: 'YeS',
                BOOLEAN_1003: 'oK',
                BOOLEAN_1004: 'FalsE',
                BOOLEAN_1005: 'nO',
                BOOLEAN_1006: 'NoT',
                BOOLEAN_1007: 'NonE',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:auto:number', function (done) {
            // input
            const input = {
                NUMBER_1: 'NaN',
                NUMBER_2: 'Infinity',
                NUMBER_3: '+Infinity',
                NUMBER_4: '-Infinity',
                NUMBER_5: '0',
                NUMBER_6: '+0',
                NUMBER_7: '-0',

                NUMBER_11: '5',
                NUMBER_12: '5',
                NUMBER_13: '-5',
                NUMBER_14: '5.',
                NUMBER_15: '5.',
                NUMBER_16: '-5.',
                NUMBER_17: '.5',
                NUMBER_18: '.5',
                NUMBER_19: '-.5',
                NUMBER_20: '4.5',
                NUMBER_21: '4.5',
                NUMBER_22: '-4.5',

                NUMBER_31: '5e1',
                NUMBER_32: '5e1',
                NUMBER_33: '-5e1',
                NUMBER_34: '5.e1',
                NUMBER_35: '5.e1',
                NUMBER_36: '-5.e1',
                NUMBER_37: '.5e1',
                NUMBER_38: '.5e1',
                NUMBER_39: '-.5e1',
                NUMBER_40: '4.5e1',
                NUMBER_41: '4.5e1',
                NUMBER_42: '-4.5e1',

                NUMBER_51: '5e+1',
                NUMBER_52: '5e+1',
                NUMBER_53: '-5e+1',
                NUMBER_54: '5.e+1',
                NUMBER_55: '5.e+1',
                NUMBER_56: '-5.e+1',
                NUMBER_57: '.5e+1',
                NUMBER_58: '.5e+1',
                NUMBER_59: '-.5e+1',
                NUMBER_60: '4.5e+1',
                NUMBER_61: '4.5e+1',
                NUMBER_72: '-4.5e+1',

                NUMBER_81: '5e-1',
                NUMBER_82: '5e-1',
                NUMBER_83: '-5e-1',
                NUMBER_84: '5.e-1',
                NUMBER_85: '5.e-1',
                NUMBER_86: '-5.e-1',
                NUMBER_87: '.5e-1',
                NUMBER_88: '.5e-1',
                NUMBER_89: '-.5e-1',
                NUMBER_90: '4.5e-1',
                NUMBER_91: '4.5e-1',
                NUMBER_92: '-4.5e-1',

                NUMBER_101: '4.5E1',
                NUMBER_102: '4.5E+1',
                NUMBER_103: '4.5E-1',

                NUMBER_111: '4.5e123',
                NUMBER_112: '4.5e+123',
                NUMBER_113: '4.5e-123',

                NUMBER_211: '05',
                NUMBER_212: '04.5',
                NUMBER_213: '04.5e+1',
                NUMBER_214: '04.5e+123',

                NUMBER_301: '0b1010',
                NUMBER_302: '+0b1010',
                NUMBER_303: '-0b1010',
                NUMBER_304: '0B1010',
                NUMBER_305: '+0B1010',
                NUMBER_306: '-0B1010',
                NUMBER_311: '0o12',
                NUMBER_312: '+0o12',
                NUMBER_313: '-0o12',
                NUMBER_314: '0O12',
                NUMBER_315: '+0O12',
                NUMBER_316: '-0O12',
                NUMBER_321: '0xa',
                NUMBER_322: '+0xa',
                NUMBER_323: '-0xa',
                NUMBER_324: '0XA',
                NUMBER_325: '+0XA',
                NUMBER_326: '-0XA',

                NUMBER_901: ' NaN ',
                NUMBER_902: ' Infinity ',
                NUMBER_903: ' 04.5e+123 ',

                // No conversion
                NUMBER_1001: 'NAN',
                NUMBER_1002: 'INFINITY',
                NUMBER_1003: '+INFINITY',
                NUMBER_1004: '-INFINITY',
                // These values are supported only in number method
                NUMBER_1011: '4.5e',
                NUMBER_1012: '4.5e+123any',
            }

            // output
            const expected = {
                NUMBER_1: NaN,
                NUMBER_2: Infinity,
                NUMBER_3: +Infinity,
                NUMBER_4: -Infinity,
                NUMBER_5: 0,
                NUMBER_6: 0,
                NUMBER_7: 0,

                NUMBER_11: 5,
                NUMBER_12: 5,
                NUMBER_13: -5,
                NUMBER_14: 5,
                NUMBER_15: 5,
                NUMBER_16: -5,
                NUMBER_17: 0.5,
                NUMBER_18: 0.5,
                NUMBER_19: -0.5,
                NUMBER_20: 4.5,
                NUMBER_21: 4.5,
                NUMBER_22: -4.5,

                NUMBER_31: 50,
                NUMBER_32: 50,
                NUMBER_33: -50,
                NUMBER_34: 50,
                NUMBER_35: 50,
                NUMBER_36: -50,
                NUMBER_37: 5,
                NUMBER_38: 5,
                NUMBER_39: -5,
                NUMBER_40: 45,
                NUMBER_41: 45,
                NUMBER_42: -45,

                NUMBER_51: 50,
                NUMBER_52: 50,
                NUMBER_53: -50,
                NUMBER_54: 50,
                NUMBER_55: 50,
                NUMBER_56: -50,
                NUMBER_57: 5,
                NUMBER_58: 5,
                NUMBER_59: -5,
                NUMBER_60: 45,
                NUMBER_61: 45,
                NUMBER_72: -45,

                NUMBER_81: 0.5,
                NUMBER_82: 0.5,
                NUMBER_83: -0.5,
                NUMBER_84: 0.5,
                NUMBER_85: 0.5,
                NUMBER_86: -0.5,
                NUMBER_87: 0.05,
                NUMBER_88: 0.05,
                NUMBER_89: -0.05,
                NUMBER_90: 0.45,
                NUMBER_91: 0.45,
                NUMBER_92: -0.45,

                NUMBER_101: 45,
                NUMBER_102: 45,
                NUMBER_103: 0.45,

                NUMBER_111: 4.5e+123,
                NUMBER_112: 4.5e+123,
                NUMBER_113: 4.5e-123,

                NUMBER_211: 5,
                NUMBER_212: 4.5,
                NUMBER_213: 45,
                NUMBER_214: 4.5e+123,

                NUMBER_301: 10,
                NUMBER_302: 10,
                NUMBER_303: -10,
                NUMBER_304: 10,
                NUMBER_305: 10,
                NUMBER_306: -10,
                NUMBER_311: 10,
                NUMBER_312: 10,
                NUMBER_313: -10,
                NUMBER_314: 10,
                NUMBER_315: 10,
                NUMBER_316: -10,
                NUMBER_321: 10,
                NUMBER_322: 10,
                NUMBER_323: -10,
                NUMBER_324: 10,
                NUMBER_325: 10,
                NUMBER_326: -10,

                NUMBER_901: NaN,
                NUMBER_902: Infinity,
                NUMBER_903: 4.5e+123,

                // No conversion
                NUMBER_1001: 'NAN',
                NUMBER_1002: 'INFINITY',
                NUMBER_1003: '+INFINITY',
                NUMBER_1004: '-INFINITY',
                // These values are supported only in number method
                NUMBER_1011: '4.5e',
                NUMBER_1012: '4.5e+123any',
            }
            const expectedForEnv = {
                NUMBER_1: 'NaN',
                NUMBER_2: 'Infinity',
                NUMBER_3: 'Infinity',
                NUMBER_4: '-Infinity',
                NUMBER_5: '0',
                NUMBER_6: '0',
                NUMBER_7: '0',

                NUMBER_11: '5',
                NUMBER_12: '5',
                NUMBER_13: '-5',
                NUMBER_14: '5',
                NUMBER_15: '5',
                NUMBER_16: '-5',
                NUMBER_17: '0.5',
                NUMBER_18: '0.5',
                NUMBER_19: '-0.5',
                NUMBER_20: '4.5',
                NUMBER_21: '4.5',
                NUMBER_22: '-4.5',

                NUMBER_31: '50',
                NUMBER_32: '50',
                NUMBER_33: '-50',
                NUMBER_34: '50',
                NUMBER_35: '50',
                NUMBER_36: '-50',
                NUMBER_37: '5',
                NUMBER_38: '5',
                NUMBER_39: '-5',
                NUMBER_40: '45',
                NUMBER_41: '45',
                NUMBER_42: '-45',

                NUMBER_51: '50',
                NUMBER_52: '50',
                NUMBER_53: '-50',
                NUMBER_54: '50',
                NUMBER_55: '50',
                NUMBER_56: '-50',
                NUMBER_57: '5',
                NUMBER_58: '5',
                NUMBER_59: '-5',
                NUMBER_60: '45',
                NUMBER_61: '45',
                NUMBER_72: '-45',

                NUMBER_81: '0.5',
                NUMBER_82: '0.5',
                NUMBER_83: '-0.5',
                NUMBER_84: '0.5',
                NUMBER_85: '0.5',
                NUMBER_86: '-0.5',
                NUMBER_87: '0.05',
                NUMBER_88: '0.05',
                NUMBER_89: '-0.05',
                NUMBER_90: '0.45',
                NUMBER_91: '0.45',
                NUMBER_92: '-0.45',

                NUMBER_101: '45',
                NUMBER_102: '45',
                NUMBER_103: '0.45',

                NUMBER_111: '4.5e+123',
                NUMBER_112: '4.5e+123',
                NUMBER_113: '4.5e-123',

                NUMBER_211: '5',
                NUMBER_212: '4.5',
                NUMBER_213: '45',
                NUMBER_214: '4.5e+123',

                NUMBER_301: '10',
                NUMBER_302: '10',
                NUMBER_303: '-10',
                NUMBER_304: '10',
                NUMBER_305: '10',
                NUMBER_306: '-10',
                NUMBER_311: '10',
                NUMBER_312: '10',
                NUMBER_313: '-10',
                NUMBER_314: '10',
                NUMBER_315: '10',
                NUMBER_316: '-10',
                NUMBER_321: '10',
                NUMBER_322: '10',
                NUMBER_323: '-10',
                NUMBER_324: '10',
                NUMBER_325: '10',
                NUMBER_326: '-10',

                NUMBER_901: 'NaN',
                NUMBER_902: 'Infinity',
                NUMBER_903: '4.5e+123',

                // No conversion
                NUMBER_1001: 'NAN',
                NUMBER_1002: 'INFINITY',
                NUMBER_1003: '+INFINITY',
                NUMBER_1004: '-INFINITY',
                // These values are supported only in number method
                NUMBER_1011: '4.5e',
                NUMBER_1012: '4.5e+123any',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:auto:bigint', function (done) {
            // input
            const input = {
                BIGINT_1: '0n',
                BIGINT_2: '+0n',
                BIGINT_3: '-0n',
                BIGINT_4: '5n',
                BIGINT_5: '+5n',
                BIGINT_6: '-5n',

                BIGINT_101: ' 5n ',

                BIGINT_201: '0b1010n',
                BIGINT_202: '+0b1010n',
                BIGINT_203: '-0b1010n',
                BIGINT_204: '0B1010n',
                BIGINT_205: '+0B1010n',
                BIGINT_206: '-0B1010n',
                BIGINT_211: '0o12n',
                BIGINT_212: '+0o12n',
                BIGINT_213: '-0o12n',
                BIGINT_214: '0O12n',
                BIGINT_215: '+0O12n',
                BIGINT_216: '-0O12n',
                BIGINT_221: '0xan',
                BIGINT_222: '+0xan',
                BIGINT_223: '-0xan',
                BIGINT_224: '0XAn',
                BIGINT_225: '+0XAn',
                BIGINT_226: '-0XAn',

                // No conversion
                BIGINT_1001: '5N',
                BIGINT_1002: '+5N',
                BIGINT_1003: '-5N',

                BIGINT_1101: '5nany',
                BIGINT_1102: '+5nany',
                BIGINT_1103: '-5nany',

                BIGINT_1201: '0b1010N',
                BIGINT_1202: '+0b1010N',
                BIGINT_1203: '-0b1010N',
                BIGINT_1204: '0B1010N',
                BIGINT_1205: '+0B1010N',
                BIGINT_1206: '-0B1010N',
                BIGINT_1211: '0o12N',
                BIGINT_1212: '+0o12N',
                BIGINT_1213: '-0o12N',
                BIGINT_1214: '0O12N',
                BIGINT_1215: '+0O12N',
                BIGINT_1216: '-0O12N',
                BIGINT_1221: '0xaN',
                BIGINT_1222: '+0xaN',
                BIGINT_1223: '-0xaN',
                BIGINT_1224: '0XAN',
                BIGINT_1225: '+0XAN',
                BIGINT_1226: '-0XAN',

                BIGINT_1301: '0b1010nany',
                BIGINT_1302: '+0b1010nany',
                BIGINT_1303: '-0b1010nany',
                BIGINT_1304: '0B1010nany',
                BIGINT_1305: '+0B1010nany',
                BIGINT_1306: '-0B1010nany',
                BIGINT_1311: '0o12nany',
                BIGINT_1312: '+0o12nany',
                BIGINT_1313: '-0o12nany',
                BIGINT_1314: '0O12nany',
                BIGINT_1315: '+0O12nany',
                BIGINT_1316: '-0O12nany',
                BIGINT_1321: '0xanany',
                BIGINT_1322: '+0xanany',
                BIGINT_1323: '-0xanany',
                BIGINT_1324: '0XAnany',
                BIGINT_1325: '+0XAnany',
                BIGINT_1326: '-0XAnany',
            }

            // output
            const expected = {
                BIGINT_1: 0n,
                BIGINT_2: 0n,
                BIGINT_3: 0n,
                BIGINT_4: 5n,
                BIGINT_5: 5n,
                BIGINT_6: -5n,

                BIGINT_101: 5n,

                BIGINT_201: 10n,
                BIGINT_202: 10n,
                BIGINT_203: -10n,
                BIGINT_204: 10n,
                BIGINT_205: 10n,
                BIGINT_206: -10n,
                BIGINT_211: 10n,
                BIGINT_212: 10n,
                BIGINT_213: -10n,
                BIGINT_214: 10n,
                BIGINT_215: 10n,
                BIGINT_216: -10n,
                BIGINT_221: 10n,
                BIGINT_222: 10n,
                BIGINT_223: -10n,
                BIGINT_224: 10n,
                BIGINT_225: 10n,
                BIGINT_226: -10n,

                // No conversion
                BIGINT_1001: '5N',
                BIGINT_1002: '+5N',
                BIGINT_1003: '-5N',

                BIGINT_1101: '5nany',
                BIGINT_1102: '+5nany',
                BIGINT_1103: '-5nany',

                BIGINT_1201: '0b1010N',
                BIGINT_1202: '+0b1010N',
                BIGINT_1203: '-0b1010N',
                BIGINT_1204: '0B1010N',
                BIGINT_1205: '+0B1010N',
                BIGINT_1206: '-0B1010N',
                BIGINT_1211: '0o12N',
                BIGINT_1212: '+0o12N',
                BIGINT_1213: '-0o12N',
                BIGINT_1214: '0O12N',
                BIGINT_1215: '+0O12N',
                BIGINT_1216: '-0O12N',
                BIGINT_1221: '0xaN',
                BIGINT_1222: '+0xaN',
                BIGINT_1223: '-0xaN',
                BIGINT_1224: '0XAN',
                BIGINT_1225: '+0XAN',
                BIGINT_1226: '-0XAN',

                BIGINT_1301: '0b1010nany',
                BIGINT_1302: '+0b1010nany',
                BIGINT_1303: '-0b1010nany',
                BIGINT_1304: '0B1010nany',
                BIGINT_1305: '+0B1010nany',
                BIGINT_1306: '-0B1010nany',
                BIGINT_1311: '0o12nany',
                BIGINT_1312: '+0o12nany',
                BIGINT_1313: '-0o12nany',
                BIGINT_1314: '0O12nany',
                BIGINT_1315: '+0O12nany',
                BIGINT_1316: '-0O12nany',
                BIGINT_1321: '0xanany',
                BIGINT_1322: '+0xanany',
                BIGINT_1323: '-0xanany',
                BIGINT_1324: '0XAnany',
                BIGINT_1325: '+0XAnany',
                BIGINT_1326: '-0XAnany',
            }
            const expectedForEnv = {
                BIGINT_1: '0n',
                BIGINT_2: '0n',
                BIGINT_3: '0n',
                BIGINT_4: '5n',
                BIGINT_5: '5n',
                BIGINT_6: '-5n',

                BIGINT_101: '5n',

                BIGINT_201: '10n',
                BIGINT_202: '10n',
                BIGINT_203: '-10n',
                BIGINT_204: '10n',
                BIGINT_205: '10n',
                BIGINT_206: '-10n',
                BIGINT_211: '10n',
                BIGINT_212: '10n',
                BIGINT_213: '-10n',
                BIGINT_214: '10n',
                BIGINT_215: '10n',
                BIGINT_216: '-10n',
                BIGINT_221: '10n',
                BIGINT_222: '10n',
                BIGINT_223: '-10n',
                BIGINT_224: '10n',
                BIGINT_225: '10n',
                BIGINT_226: '-10n',

                // No conversion
                BIGINT_1001: '5N',
                BIGINT_1002: '+5N',
                BIGINT_1003: '-5N',

                BIGINT_1101: '5nany',
                BIGINT_1102: '+5nany',
                BIGINT_1103: '-5nany',

                BIGINT_1201: '0b1010N',
                BIGINT_1202: '+0b1010N',
                BIGINT_1203: '-0b1010N',
                BIGINT_1204: '0B1010N',
                BIGINT_1205: '+0B1010N',
                BIGINT_1206: '-0B1010N',
                BIGINT_1211: '0o12N',
                BIGINT_1212: '+0o12N',
                BIGINT_1213: '-0o12N',
                BIGINT_1214: '0O12N',
                BIGINT_1215: '+0O12N',
                BIGINT_1216: '-0O12N',
                BIGINT_1221: '0xaN',
                BIGINT_1222: '+0xaN',
                BIGINT_1223: '-0xaN',
                BIGINT_1224: '0XAN',
                BIGINT_1225: '+0XAN',
                BIGINT_1226: '-0XAN',

                BIGINT_1301: '0b1010nany',
                BIGINT_1302: '+0b1010nany',
                BIGINT_1303: '-0b1010nany',
                BIGINT_1304: '0B1010nany',
                BIGINT_1305: '+0B1010nany',
                BIGINT_1306: '-0B1010nany',
                BIGINT_1311: '0o12nany',
                BIGINT_1312: '+0o12nany',
                BIGINT_1313: '-0o12nany',
                BIGINT_1314: '0O12nany',
                BIGINT_1315: '+0O12nany',
                BIGINT_1316: '-0O12nany',
                BIGINT_1321: '0xanany',
                BIGINT_1322: '+0xanany',
                BIGINT_1323: '-0xanany',
                BIGINT_1324: '0XAnany',
                BIGINT_1325: '+0XAnany',
                BIGINT_1326: '-0XAnany',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:auto:symbol', function (done) {
            // input
            const input = {
                SYMBOL_1: 'Symbol()',
                SYMBOL_2: 'Symbol(any)',
                SYMBOL_3: 'Symbol((any))',
                SYMBOL_4: 'Symbol(a(n)y)',
                SYMBOL_5: 'Symbol(a(ny)',
                SYMBOL_6: 'Symbol(an)y)',

                SYMBOL_101: ' Symbol(any) ',

                // No conversion
                SYMBOL_1001: 'SYMBOL(any)',
                SYMBOL_1002: 'Symbol(any)any',
            }

            // output
            const expected = {
                SYMBOL_1: Symbol(),
                SYMBOL_2: Symbol('any'),
                SYMBOL_3: Symbol('(any)'),
                SYMBOL_4: Symbol('a(n)y'),
                SYMBOL_5: Symbol('a(ny'),
                SYMBOL_6: Symbol('an)y'),

                SYMBOL_101: Symbol('any'),

                // No conversion
                SYMBOL_1001: 'SYMBOL(any)',
                SYMBOL_1002: 'Symbol(any)any',
            }
            const expectedForEnv = {
                SYMBOL_1: 'Symbol()',
                SYMBOL_2: 'Symbol(any)',
                SYMBOL_3: 'Symbol((any))',
                SYMBOL_4: 'Symbol(a(n)y)',
                SYMBOL_5: 'Symbol(a(ny)',
                SYMBOL_6: 'Symbol(an)y)',

                SYMBOL_101: 'Symbol(any)',

                // No conversion
                SYMBOL_1001: 'SYMBOL(any)',
                SYMBOL_1002: 'Symbol(any)any',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.SYMBOL_1.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_1.toString().should.equal(expected.SYMBOL_1.toString())
            dotenvConversionConfig.parsed.SYMBOL_2.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_2.toString().should.equal(expected.SYMBOL_2.toString())
            dotenvConversionConfig.parsed.SYMBOL_3.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_3.toString().should.equal(expected.SYMBOL_3.toString())
            dotenvConversionConfig.parsed.SYMBOL_4.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_4.toString().should.equal(expected.SYMBOL_4.toString())
            dotenvConversionConfig.parsed.SYMBOL_5.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_5.toString().should.equal(expected.SYMBOL_5.toString())
            dotenvConversionConfig.parsed.SYMBOL_6.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_6.toString().should.equal(expected.SYMBOL_6.toString())
            dotenvConversionConfig.parsed.SYMBOL_101.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_101.toString().should.equal(expected.SYMBOL_101.toString())
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:auto:array', function (done) {
            // input
            const input = {
                ARRAY_1: '[null,true,false,1,"x",[-1,2.1,3e1,4.5e+123],{"y":"z"}]',

                ARRAY_21: '[" ","\'\'","\\"\\"","``","\\\\\\\\","()","[]","{}"]',

                ARRAY_101: 'null,true,4.5e+123," x y "',
                ARRAY_102: ' [null, true, 4.5e+123, " x y "] ',
                ARRAY_103: ' null, true, 4.5e+123, " x y " ',
                ARRAY_104: '"a"',

                // No conversion
                ARRAY_1001: '["a","b","c"',
                ARRAY_1002: '"a","b","c"]',
                ARRAY_1003: '"a","b"],"c"',
                ARRAY_1004: '["a","b","c",]',
                ARRAY_1005: '["a","b","c"]any',
                ARRAY_1006: '[\'a\',\'b\',\'c\']',
                ARRAY_1007: '[a,b,c]',
                ARRAY_1021: '[undefined]',
                ARRAY_1022: '[UNDEFINED]',
                ARRAY_1023: '[True]',
                ARRAY_1024: '[TRUE]',
                ARRAY_1025: '[False]',
                ARRAY_1026: '[FALSE]',
                ARRAY_1027: '[no]',
                ARRAY_1028: '[No]',
                ARRAY_1029: '[No]',
                ARRAY_1030: '[NaN]',
                ARRAY_1031: '[Infinity]',
                ARRAY_1032: '[+Infinity]',
                ARRAY_1033: '[-Infinity]',
            }

            // output
            const expected = {
                ARRAY_1: [null, true, false, 1, 'x', [-1, 2.1, 30, 4.5e+123], {'y': 'z'}],

                ARRAY_21: [' ', '\'\'', '""', '``', '\\\\', '()', '[]', '{}'],

                ARRAY_101: [null, true, 4.5e+123, ' x y '],
                ARRAY_102: [null, true, 4.5e+123, ' x y '],
                ARRAY_103: [null, true, 4.5e+123, ' x y '],
                ARRAY_104: ['a'],

                // No conversion
                ARRAY_1001: '["a","b","c"',
                ARRAY_1002: '"a","b","c"]',
                ARRAY_1003: '"a","b"],"c"',
                ARRAY_1004: '["a","b","c",]',
                ARRAY_1005: '["a","b","c"]any',
                ARRAY_1006: '[\'a\',\'b\',\'c\']',
                ARRAY_1007: '[a,b,c]',
                ARRAY_1021: '[undefined]',
                ARRAY_1022: '[UNDEFINED]',
                ARRAY_1023: '[True]',
                ARRAY_1024: '[TRUE]',
                ARRAY_1025: '[False]',
                ARRAY_1026: '[FALSE]',
                ARRAY_1027: '[no]',
                ARRAY_1028: '[No]',
                ARRAY_1029: '[No]',
                ARRAY_1030: '[NaN]',
                ARRAY_1031: '[Infinity]',
                ARRAY_1032: '[+Infinity]',
                ARRAY_1033: '[-Infinity]',
            }
            const expectedForEnv = {
                ARRAY_1: '[null,true,false,1,"x",[-1,2.1,30,4.5e+123],{"y":"z"}]',

                ARRAY_21: '[" ","\'\'","\\"\\"","``","\\\\\\\\","()","[]","{}"]',

                ARRAY_101: '[null,true,4.5e+123," x y "]',
                ARRAY_102: '[null,true,4.5e+123," x y "]',
                ARRAY_103: '[null,true,4.5e+123," x y "]',
                ARRAY_104: '["a"]',

                // No conversion
                ARRAY_1001: '["a","b","c"',
                ARRAY_1002: '"a","b","c"]',
                ARRAY_1003: '"a","b"],"c"',
                ARRAY_1004: '["a","b","c",]',
                ARRAY_1005: '["a","b","c"]any',
                ARRAY_1006: '[\'a\',\'b\',\'c\']',
                ARRAY_1007: '[a,b,c]',
                ARRAY_1021: '[undefined]',
                ARRAY_1022: '[UNDEFINED]',
                ARRAY_1023: '[True]',
                ARRAY_1024: '[TRUE]',
                ARRAY_1025: '[False]',
                ARRAY_1026: '[FALSE]',
                ARRAY_1027: '[no]',
                ARRAY_1028: '[No]',
                ARRAY_1029: '[No]',
                ARRAY_1030: '[NaN]',
                ARRAY_1031: '[Infinity]',
                ARRAY_1032: '[+Infinity]',
                ARRAY_1033: '[-Infinity]',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:auto:object', function (done) {
            // input
            const input = {
                OBJECT_1: '{"a":null,"b":true,"c":false,"d":1,"e":"x","f":[-1,2.1,3e1,4.5e+123],"g":{"y":"z"}}',

                OBJECT_21: '{"_":" ","a":"\'\'","b":"\\"\\"","c":"``","d":"\\\\\\\\","e":"()","f":"[]","g":"{}"}',

                OBJECT_101: '"a":null,"b":true,"c":4.5e+123,"d":" x y "',
                OBJECT_102: ' {"a": null, "b": true, "c": 4.5e+123, "d": " x y "} ',
                OBJECT_103: ' "a": null, "b": true, "c": 4.5e+123, "d": " x y " ',

                // No conversion
                OBJECT_1001: '{"a":1,"b":2,"c":3',
                OBJECT_1002: '"a":1,"b":2,"c":3}',
                OBJECT_1003: '"a":1,"b":2},"c":3',
                OBJECT_1004: '{"a":1,"b":2,"c":3,}',
                OBJECT_1005: '{"a":1,"b":2,"c":3}any',
                OBJECT_1006: '{\'a\':1,\'b\':2,\'c\':3}',
                OBJECT_1007: '{a:1,b:2,c:3}',
                OBJECT_1008: '{"a":a,"b":b,"c":c}',
                OBJECT_1021: '{"a":undefined}',
                OBJECT_1022: '{"a":UNDEFINED}',
                OBJECT_1023: '{"a":True}',
                OBJECT_1024: '{"a":TRUE}',
                OBJECT_1025: '{"a":False}',
                OBJECT_1026: '{"a":FALSE}',
                OBJECT_1027: '{"a":no}',
                OBJECT_1028: '{"a":No}',
                OBJECT_1029: '{"a":No}',
                OBJECT_1030: '{"a":NaN}',
                OBJECT_1031: '{"a":Infinity}',
                OBJECT_1032: '{"a":+Infinity}',
                OBJECT_1033: '{"a":-Infinity}',
            }

            // output
            const expected = {
                OBJECT_1: {'a': null, 'b': true, 'c': false, 'd': 1, 'e': 'x', 'f': [-1, 2.1, 30, 4.5e+123], 'g': {'y': 'z'}},

                OBJECT_21: {'_': ' ', 'a': '\'\'', 'b': '""', 'c': '``', 'd': '\\\\', 'e': '()', 'f': '[]', 'g': '{}'},

                OBJECT_101: {'a': null, 'b': true, 'c': 4.5e+123, 'd': ' x y '},
                OBJECT_102: {'a': null, 'b': true, 'c': 4.5e+123, 'd': ' x y '},
                OBJECT_103: {'a': null, 'b': true, 'c': 4.5e+123, 'd': ' x y '},

                // No conversion
                OBJECT_1001: '{"a":1,"b":2,"c":3',
                OBJECT_1002: '"a":1,"b":2,"c":3}',
                OBJECT_1003: '"a":1,"b":2},"c":3',
                OBJECT_1004: '{"a":1,"b":2,"c":3,}',
                OBJECT_1005: '{"a":1,"b":2,"c":3}any',
                OBJECT_1006: '{\'a\':1,\'b\':2,\'c\':3}',
                OBJECT_1007: '{a:1,b:2,c:3}',
                OBJECT_1008: '{"a":a,"b":b,"c":c}',
                OBJECT_1021: '{"a":undefined}',
                OBJECT_1022: '{"a":UNDEFINED}',
                OBJECT_1023: '{"a":True}',
                OBJECT_1024: '{"a":TRUE}',
                OBJECT_1025: '{"a":False}',
                OBJECT_1026: '{"a":FALSE}',
                OBJECT_1027: '{"a":no}',
                OBJECT_1028: '{"a":No}',
                OBJECT_1029: '{"a":No}',
                OBJECT_1030: '{"a":NaN}',
                OBJECT_1031: '{"a":Infinity}',
                OBJECT_1032: '{"a":+Infinity}',
                OBJECT_1033: '{"a":-Infinity}',
            }
            const expectedForEnv = {
                OBJECT_1: '{"a":null,"b":true,"c":false,"d":1,"e":"x","f":[-1,2.1,30,4.5e+123],"g":{"y":"z"}}',

                OBJECT_21: '{"_":" ","a":"\'\'","b":"\\"\\"","c":"``","d":"\\\\\\\\","e":"()","f":"[]","g":"{}"}',

                OBJECT_101: '{"a":null,"b":true,"c":4.5e+123,"d":" x y "}',
                OBJECT_102: '{"a":null,"b":true,"c":4.5e+123,"d":" x y "}',
                OBJECT_103: '{"a":null,"b":true,"c":4.5e+123,"d":" x y "}',

                // No conversion
                OBJECT_1001: '{"a":1,"b":2,"c":3',
                OBJECT_1002: '"a":1,"b":2,"c":3}',
                OBJECT_1003: '"a":1,"b":2},"c":3',
                OBJECT_1004: '{"a":1,"b":2,"c":3,}',
                OBJECT_1005: '{"a":1,"b":2,"c":3}any',
                OBJECT_1006: '{\'a\':1,\'b\':2,\'c\':3}',
                OBJECT_1007: '{a:1,b:2,c:3}',
                OBJECT_1008: '{"a":a,"b":b,"c":c}',
                OBJECT_1021: '{"a":undefined}',
                OBJECT_1022: '{"a":UNDEFINED}',
                OBJECT_1023: '{"a":True}',
                OBJECT_1024: '{"a":TRUE}',
                OBJECT_1025: '{"a":False}',
                OBJECT_1026: '{"a":FALSE}',
                OBJECT_1027: '{"a":no}',
                OBJECT_1028: '{"a":No}',
                OBJECT_1029: '{"a":No}',
                OBJECT_1030: '{"a":NaN}',
                OBJECT_1031: '{"a":Infinity}',
                OBJECT_1032: '{"a":+Infinity}',
                OBJECT_1033: '{"a":-Infinity}',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:boolean', function (done) {
            // input
            const input = {
                BOOLEAN_1: 'boolean:false',
                BOOLEAN_2: 'boolean:False',
                BOOLEAN_3: 'boolean:FALSE',
                BOOLEAN_4: 'boolean:no',
                BOOLEAN_5: 'boolean:No',
                BOOLEAN_6: 'boolean:NO',
                BOOLEAN_7: 'boolean:null',
                BOOLEAN_8: 'boolean:Null',
                BOOLEAN_9: 'boolean:NULL',
                BOOLEAN_10: 'boolean:undefined',
                BOOLEAN_11: 'boolean:UNDEFINED',
                BOOLEAN_12: 'boolean:NaN',
                BOOLEAN_13: 'boolean:not',
                BOOLEAN_14: 'boolean:Not',
                BOOLEAN_15: 'boolean:NOT',
                BOOLEAN_16: 'boolean:none',
                BOOLEAN_17: 'boolean:None',
                BOOLEAN_18: 'boolean:NONE',

                BOOLEAN_21: 'boolean:0',
                BOOLEAN_22: 'boolean:+0',
                BOOLEAN_23: 'boolean:-0',
                BOOLEAN_24: 'boolean:.0',
                BOOLEAN_25: 'boolean:+.0',
                BOOLEAN_26: 'boolean:-.0',
                BOOLEAN_27: 'boolean:0.',
                BOOLEAN_28: 'boolean:+0.',
                BOOLEAN_29: 'boolean:-0.',
                BOOLEAN_30: 'boolean:0.0',
                BOOLEAN_31: 'boolean:+0.0',
                BOOLEAN_32: 'boolean:-0.0',
                BOOLEAN_33: 'boolean:0.0e123',
                BOOLEAN_34: 'boolean:+0.0e+123',
                BOOLEAN_35: 'boolean:-0.0e-123',

                BOOLEAN_41: 'boolean:0n',
                BOOLEAN_42: 'boolean:+0n',
                BOOLEAN_43: 'boolean:-0n',

                BOOLEAN_51: 'boolean:[]',
                BOOLEAN_52: 'boolean:{}',

                BOOLEAN_101: 'boolean:',
                BOOLEAN_102: ' boolean: ',
                BOOLEAN_103: ' boolean: false ',
                BOOLEAN_104: ' boolean: 0.0e+123 ',
                BOOLEAN_105: ' boolean: 0n ',

                BOOLEAN_201: 'boolean:any',
                BOOLEAN_202: ' boolean: any ',

                BOOLEAN_301: 'bool:false',
                BOOLEAN_302: ' bool:false ',
                BOOLEAN_303: 'bool:any',
                BOOLEAN_304: ' bool: any ',

                BOOLEAN_401: 'boolean:0b1010',
                BOOLEAN_402: 'boolean:+0b1010',
                BOOLEAN_403: 'boolean:-0b1010',
                BOOLEAN_404: 'boolean:0B1010',
                BOOLEAN_405: 'boolean:+0B1010',
                BOOLEAN_406: 'boolean:-0B1010',
                BOOLEAN_411: 'boolean:0o12',
                BOOLEAN_412: 'boolean:+0o12',
                BOOLEAN_413: 'boolean:-0o12',
                BOOLEAN_414: 'boolean:0O12',
                BOOLEAN_415: 'boolean:+0O12',
                BOOLEAN_416: 'boolean:-0O12',
                BOOLEAN_421: 'boolean:0xa',
                BOOLEAN_422: 'boolean:+0xa',
                BOOLEAN_423: 'boolean:-0xa',
                BOOLEAN_424: 'boolean:0XA',
                BOOLEAN_425: 'boolean:+0XA',
                BOOLEAN_426: 'boolean:-0XA',

                BOOLEAN_501: 'boolean:0b0',
                BOOLEAN_502: 'boolean:+0b0',
                BOOLEAN_503: 'boolean:-0b0',
                BOOLEAN_504: 'boolean:0B0',
                BOOLEAN_505: 'boolean:+0B0',
                BOOLEAN_506: 'boolean:-0B0',
                BOOLEAN_511: 'boolean:0o0',
                BOOLEAN_512: 'boolean:+0o0',
                BOOLEAN_513: 'boolean:-0o0',
                BOOLEAN_514: 'boolean:0O0',
                BOOLEAN_515: 'boolean:+0O0',
                BOOLEAN_516: 'boolean:-0O0',
                BOOLEAN_521: 'boolean:0x0',
                BOOLEAN_522: 'boolean:+0x0',
                BOOLEAN_523: 'boolean:-0x0',
                BOOLEAN_524: 'boolean:0X0',
                BOOLEAN_525: 'boolean:+0X0',
                BOOLEAN_526: 'boolean:-0X0',

                BOOLEAN_601: 'boolean:0b1010n',
                BOOLEAN_602: 'boolean:+0b1010n',
                BOOLEAN_603: 'boolean:-0b1010n',
                BOOLEAN_604: 'boolean:0B1010n',
                BOOLEAN_605: 'boolean:+0B1010n',
                BOOLEAN_606: 'boolean:-0B1010n',
                BOOLEAN_611: 'boolean:0o12n',
                BOOLEAN_612: 'boolean:+0o12n',
                BOOLEAN_613: 'boolean:-0o12n',
                BOOLEAN_614: 'boolean:0O12n',
                BOOLEAN_615: 'boolean:+0O12n',
                BOOLEAN_616: 'boolean:-0O12n',
                BOOLEAN_621: 'boolean:0xan',
                BOOLEAN_622: 'boolean:+0xan',
                BOOLEAN_623: 'boolean:-0xan',
                BOOLEAN_624: 'boolean:0XAn',
                BOOLEAN_625: 'boolean:+0XAn',
                BOOLEAN_626: 'boolean:-0XAn',

                BOOLEAN_701: 'boolean:0b0n',
                BOOLEAN_702: 'boolean:+0b0n',
                BOOLEAN_703: 'boolean:-0b0n',
                BOOLEAN_704: 'boolean:0B0n',
                BOOLEAN_705: 'boolean:+0B0n',
                BOOLEAN_706: 'boolean:-0B0n',
                BOOLEAN_711: 'boolean:0o0n',
                BOOLEAN_712: 'boolean:+0o0n',
                BOOLEAN_713: 'boolean:-0o0n',
                BOOLEAN_714: 'boolean:0O0n',
                BOOLEAN_715: 'boolean:+0O0n',
                BOOLEAN_716: 'boolean:-0O0n',
                BOOLEAN_721: 'boolean:0x0n',
                BOOLEAN_722: 'boolean:+0x0n',
                BOOLEAN_723: 'boolean:-0x0n',
                BOOLEAN_724: 'boolean:0X0n',
                BOOLEAN_725: 'boolean:+0X0n',
                BOOLEAN_726: 'boolean:-0X0n',

                // No conversion
                BOOLEAN_1001: 'BOOLEAN:any',
                BOOLEAN_1002: 'BOOL:any',
                BOOLEAN_1003: ' BOOLEAN: any ',
                BOOLEAN_1004: ' BOOL: any ',
                BOOLEAN_1005: ' boolean : any ',
                BOOLEAN_1006: ' bool : any ',
            }

            // output
            const expected = {
                BOOLEAN_1: false,
                BOOLEAN_2: false,
                BOOLEAN_3: false,
                BOOLEAN_4: false,
                BOOLEAN_5: false,
                BOOLEAN_6: false,
                BOOLEAN_7: false,
                BOOLEAN_8: false,
                BOOLEAN_9: false,
                BOOLEAN_10: false,
                BOOLEAN_11: false,
                BOOLEAN_12: false,
                BOOLEAN_13: false,
                BOOLEAN_14: false,
                BOOLEAN_15: false,
                BOOLEAN_16: false,
                BOOLEAN_17: false,
                BOOLEAN_18: false,

                BOOLEAN_21: false,
                BOOLEAN_22: false,
                BOOLEAN_23: false,
                BOOLEAN_24: false,
                BOOLEAN_25: false,
                BOOLEAN_26: false,
                BOOLEAN_27: false,
                BOOLEAN_28: false,
                BOOLEAN_29: false,
                BOOLEAN_30: false,
                BOOLEAN_31: false,
                BOOLEAN_32: false,
                BOOLEAN_33: false,
                BOOLEAN_34: false,
                BOOLEAN_35: false,

                BOOLEAN_41: false,
                BOOLEAN_42: false,
                BOOLEAN_43: false,

                BOOLEAN_51: false,
                BOOLEAN_52: false,

                BOOLEAN_101: false,
                BOOLEAN_102: false,
                BOOLEAN_103: false,
                BOOLEAN_104: false,
                BOOLEAN_105: false,

                BOOLEAN_201: true,
                BOOLEAN_202: true,

                BOOLEAN_301: false,
                BOOLEAN_302: false,
                BOOLEAN_303: true,
                BOOLEAN_304: true,

                BOOLEAN_401: true,
                BOOLEAN_402: true,
                BOOLEAN_403: true,
                BOOLEAN_404: true,
                BOOLEAN_405: true,
                BOOLEAN_406: true,
                BOOLEAN_411: true,
                BOOLEAN_412: true,
                BOOLEAN_413: true,
                BOOLEAN_414: true,
                BOOLEAN_415: true,
                BOOLEAN_416: true,
                BOOLEAN_421: true,
                BOOLEAN_422: true,
                BOOLEAN_423: true,
                BOOLEAN_424: true,
                BOOLEAN_425: true,
                BOOLEAN_426: true,

                BOOLEAN_501: false,
                BOOLEAN_502: false,
                BOOLEAN_503: false,
                BOOLEAN_504: false,
                BOOLEAN_505: false,
                BOOLEAN_506: false,
                BOOLEAN_511: false,
                BOOLEAN_512: false,
                BOOLEAN_513: false,
                BOOLEAN_514: false,
                BOOLEAN_515: false,
                BOOLEAN_516: false,
                BOOLEAN_521: false,
                BOOLEAN_522: false,
                BOOLEAN_523: false,
                BOOLEAN_524: false,
                BOOLEAN_525: false,
                BOOLEAN_526: false,

                BOOLEAN_601: true,
                BOOLEAN_602: true,
                BOOLEAN_603: true,
                BOOLEAN_604: true,
                BOOLEAN_605: true,
                BOOLEAN_606: true,
                BOOLEAN_611: true,
                BOOLEAN_612: true,
                BOOLEAN_613: true,
                BOOLEAN_614: true,
                BOOLEAN_615: true,
                BOOLEAN_616: true,
                BOOLEAN_621: true,
                BOOLEAN_622: true,
                BOOLEAN_623: true,
                BOOLEAN_624: true,
                BOOLEAN_625: true,
                BOOLEAN_626: true,

                BOOLEAN_701: false,
                BOOLEAN_702: false,
                BOOLEAN_703: false,
                BOOLEAN_704: false,
                BOOLEAN_705: false,
                BOOLEAN_706: false,
                BOOLEAN_711: false,
                BOOLEAN_712: false,
                BOOLEAN_713: false,
                BOOLEAN_714: false,
                BOOLEAN_715: false,
                BOOLEAN_716: false,
                BOOLEAN_721: false,
                BOOLEAN_722: false,
                BOOLEAN_723: false,
                BOOLEAN_724: false,
                BOOLEAN_725: false,
                BOOLEAN_726: false,

                // No conversion
                BOOLEAN_1001: 'BOOLEAN:any',
                BOOLEAN_1002: 'BOOL:any',
                BOOLEAN_1003: ' BOOLEAN: any ',
                BOOLEAN_1004: ' BOOL: any ',
                BOOLEAN_1005: ' boolean : any ',
                BOOLEAN_1006: ' bool : any ',
            }
            const expectedForEnv = {
                BOOLEAN_1: 'false',
                BOOLEAN_2: 'false',
                BOOLEAN_3: 'false',
                BOOLEAN_4: 'false',
                BOOLEAN_5: 'false',
                BOOLEAN_6: 'false',
                BOOLEAN_7: 'false',
                BOOLEAN_8: 'false',
                BOOLEAN_9: 'false',
                BOOLEAN_10: 'false',
                BOOLEAN_11: 'false',
                BOOLEAN_12: 'false',
                BOOLEAN_13: 'false',
                BOOLEAN_14: 'false',
                BOOLEAN_15: 'false',
                BOOLEAN_16: 'false',
                BOOLEAN_17: 'false',
                BOOLEAN_18: 'false',

                BOOLEAN_21: 'false',
                BOOLEAN_22: 'false',
                BOOLEAN_23: 'false',
                BOOLEAN_24: 'false',
                BOOLEAN_25: 'false',
                BOOLEAN_26: 'false',
                BOOLEAN_27: 'false',
                BOOLEAN_28: 'false',
                BOOLEAN_29: 'false',
                BOOLEAN_30: 'false',
                BOOLEAN_31: 'false',
                BOOLEAN_32: 'false',
                BOOLEAN_33: 'false',
                BOOLEAN_34: 'false',
                BOOLEAN_35: 'false',

                BOOLEAN_41: 'false',
                BOOLEAN_42: 'false',
                BOOLEAN_43: 'false',

                BOOLEAN_51: 'false',
                BOOLEAN_52: 'false',

                BOOLEAN_101: 'false',
                BOOLEAN_102: 'false',
                BOOLEAN_103: 'false',
                BOOLEAN_104: 'false',
                BOOLEAN_105: 'false',

                BOOLEAN_201: 'true',
                BOOLEAN_202: 'true',

                BOOLEAN_301: 'false',
                BOOLEAN_302: 'false',
                BOOLEAN_303: 'true',
                BOOLEAN_304: 'true',

                BOOLEAN_401: 'true',
                BOOLEAN_402: 'true',
                BOOLEAN_403: 'true',
                BOOLEAN_404: 'true',
                BOOLEAN_405: 'true',
                BOOLEAN_406: 'true',
                BOOLEAN_411: 'true',
                BOOLEAN_412: 'true',
                BOOLEAN_413: 'true',
                BOOLEAN_414: 'true',
                BOOLEAN_415: 'true',
                BOOLEAN_416: 'true',
                BOOLEAN_421: 'true',
                BOOLEAN_422: 'true',
                BOOLEAN_423: 'true',
                BOOLEAN_424: 'true',
                BOOLEAN_425: 'true',
                BOOLEAN_426: 'true',

                BOOLEAN_501: 'false',
                BOOLEAN_502: 'false',
                BOOLEAN_503: 'false',
                BOOLEAN_504: 'false',
                BOOLEAN_505: 'false',
                BOOLEAN_506: 'false',
                BOOLEAN_511: 'false',
                BOOLEAN_512: 'false',
                BOOLEAN_513: 'false',
                BOOLEAN_514: 'false',
                BOOLEAN_515: 'false',
                BOOLEAN_516: 'false',
                BOOLEAN_521: 'false',
                BOOLEAN_522: 'false',
                BOOLEAN_523: 'false',
                BOOLEAN_524: 'false',
                BOOLEAN_525: 'false',
                BOOLEAN_526: 'false',

                BOOLEAN_601: 'true',
                BOOLEAN_602: 'true',
                BOOLEAN_603: 'true',
                BOOLEAN_604: 'true',
                BOOLEAN_605: 'true',
                BOOLEAN_606: 'true',
                BOOLEAN_611: 'true',
                BOOLEAN_612: 'true',
                BOOLEAN_613: 'true',
                BOOLEAN_614: 'true',
                BOOLEAN_615: 'true',
                BOOLEAN_616: 'true',
                BOOLEAN_621: 'true',
                BOOLEAN_622: 'true',
                BOOLEAN_623: 'true',
                BOOLEAN_624: 'true',
                BOOLEAN_625: 'true',
                BOOLEAN_626: 'true',

                BOOLEAN_701: 'false',
                BOOLEAN_702: 'false',
                BOOLEAN_703: 'false',
                BOOLEAN_704: 'false',
                BOOLEAN_705: 'false',
                BOOLEAN_706: 'false',
                BOOLEAN_711: 'false',
                BOOLEAN_712: 'false',
                BOOLEAN_713: 'false',
                BOOLEAN_714: 'false',
                BOOLEAN_715: 'false',
                BOOLEAN_716: 'false',
                BOOLEAN_721: 'false',
                BOOLEAN_722: 'false',
                BOOLEAN_723: 'false',
                BOOLEAN_724: 'false',
                BOOLEAN_725: 'false',
                BOOLEAN_726: 'false',

                // No conversion
                BOOLEAN_1001: 'BOOLEAN:any',
                BOOLEAN_1002: 'BOOL:any',
                BOOLEAN_1003: ' BOOLEAN: any ',
                BOOLEAN_1004: ' BOOL: any ',
                BOOLEAN_1005: ' boolean : any ',
                BOOLEAN_1006: ' bool : any ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:number', function (done) {
            // input
            const input = {
                NUMBER_1: 'number:true',
                NUMBER_2: 'number:True',
                NUMBER_3: 'number:TRUE',
                NUMBER_4: 'number:yes',
                NUMBER_5: 'number:Yes',
                NUMBER_6: 'number:YES',
                NUMBER_7: 'number:false',
                NUMBER_8: 'number:False',
                NUMBER_9: 'number:FALSE',
                NUMBER_10: 'number:no',
                NUMBER_11: 'number:No',
                NUMBER_12: 'number:NO',
                NUMBER_13: 'number:null',
                NUMBER_14: 'number:Null',
                NUMBER_15: 'number:NULL',
                NUMBER_16: 'number:undefined',
                NUMBER_17: 'number:UNDEFINED',
                NUMBER_18: 'number:not',
                NUMBER_19: 'number:Not',
                NUMBER_20: 'number:NOT',
                NUMBER_21: 'number:none',
                NUMBER_22: 'number:None',
                NUMBER_23: 'number:NONE',
                NUMBER_24: 'number:NaN',
                NUMBER_25: 'number:Infinity',
                NUMBER_26: 'number:+Infinity',
                NUMBER_27: 'number:-Infinity',
                NUMBER_28: 'number:0',
                NUMBER_29: 'number:+0',
                NUMBER_30: 'number:-0',
                NUMBER_31: 'number:0n',
                NUMBER_32: 'number:+0n',
                NUMBER_33: 'number:-0n',
                NUMBER_34: 'number:1n',
                NUMBER_35: 'number:+1n',
                NUMBER_36: 'number:-1n',
                NUMBER_37: 'number:[]',
                NUMBER_38: 'number:{}',

                NUMBER_41: 'number:4.5e1',
                NUMBER_42: 'number:+4.5e+1',
                NUMBER_43: 'number:-4.5e-1',
                NUMBER_44: 'number:4.5e123',
                NUMBER_45: 'number:+4.5e+123',
                NUMBER_46: 'number:-4.5e-123',

                NUMBER_101: 'number:',
                NUMBER_102: 'number:4.5e+123any',
                NUMBER_103: 'number:any',
                NUMBER_104: ' number: ',
                NUMBER_105: ' number: true ',
                NUMBER_106: ' number: false ',
                NUMBER_107: ' number: 4.5e+123any ',
                NUMBER_108: ' number: any ',

                NUMBER_201: 'num:',
                NUMBER_202: 'num:4.5e+123any',
                NUMBER_203: 'num:any',
                NUMBER_204: ' num: ',
                NUMBER_205: ' num: true ',
                NUMBER_206: ' num: false ',
                NUMBER_207: ' num: 4.5e+123any ',
                NUMBER_208: ' num: any ',

                NUMBER_301: 'number:0b1010',
                NUMBER_302: 'number:+0b1010',
                NUMBER_303: 'number:-0b1010',
                NUMBER_304: 'number:0B1010',
                NUMBER_305: 'number:+0B1010',
                NUMBER_306: 'number:-0B1010',
                NUMBER_311: 'number:0o12',
                NUMBER_312: 'number:+0o12',
                NUMBER_313: 'number:-0o12',
                NUMBER_314: 'number:0O12',
                NUMBER_315: 'number:+0O12',
                NUMBER_316: 'number:-0O12',
                NUMBER_321: 'number:0xa',
                NUMBER_322: 'number:+0xa',
                NUMBER_323: 'number:-0xa',
                NUMBER_324: 'number:0XA',
                NUMBER_325: 'number:+0XA',
                NUMBER_326: 'number:-0XA',

                NUMBER_401: 'number:0b1010n',
                NUMBER_402: 'number:+0b1010n',
                NUMBER_403: 'number:-0b1010n',
                NUMBER_404: 'number:0B1010n',
                NUMBER_405: 'number:+0B1010n',
                NUMBER_406: 'number:-0B1010n',
                NUMBER_411: 'number:0o12n',
                NUMBER_412: 'number:+0o12n',
                NUMBER_413: 'number:-0o12n',
                NUMBER_414: 'number:0O12n',
                NUMBER_415: 'number:+0O12n',
                NUMBER_416: 'number:-0O12n',
                NUMBER_421: 'number:0xan',
                NUMBER_422: 'number:+0xan',
                NUMBER_423: 'number:-0xan',
                NUMBER_424: 'number:0XAn',
                NUMBER_425: 'number:+0XAn',
                NUMBER_426: 'number:-0XAn',

                NUMBER_501: 'number:0b1010any',
                NUMBER_502: 'number:+0b1010any',
                NUMBER_503: 'number:-0b1010any',
                NUMBER_504: 'number:0B1010any',
                NUMBER_505: 'number:+0B1010any',
                NUMBER_506: 'number:-0B1010any',
                NUMBER_511: 'number:0o12any',
                NUMBER_512: 'number:+0o12any',
                NUMBER_513: 'number:-0o12any',
                NUMBER_514: 'number:0O12any',
                NUMBER_515: 'number:+0O12any',
                NUMBER_516: 'number:-0O12any',
                NUMBER_521: 'number:0xaany',
                NUMBER_522: 'number:+0xaany',
                NUMBER_523: 'number:-0xaany',
                NUMBER_524: 'number:0XAany',
                NUMBER_525: 'number:+0XAany',
                NUMBER_526: 'number:-0XAany',

                // No conversion
                NUMBER_1001: 'NUMBER:any',
                NUMBER_1002: 'NUM:any',
                NUMBER_1003: ' NUMBER: any ',
                NUMBER_1004: ' NUM: any ',
                NUMBER_1005: ' number : any ',
                NUMBER_1006: ' num : any ',
            }

            // output
            const expected = {
                NUMBER_1: 1,
                NUMBER_2: 1,
                NUMBER_3: 1,
                NUMBER_4: 1,
                NUMBER_5: 1,
                NUMBER_6: 1,
                NUMBER_7: 0,
                NUMBER_8: 0,
                NUMBER_9: 0,
                NUMBER_10: 0,
                NUMBER_11: 0,
                NUMBER_12: 0,
                NUMBER_13: 0,
                NUMBER_14: 0,
                NUMBER_15: 0,
                NUMBER_16: NaN,
                NUMBER_17: NaN,
                NUMBER_18: 0,
                NUMBER_19: 0,
                NUMBER_20: 0,
                NUMBER_21: 0,
                NUMBER_22: 0,
                NUMBER_23: 0,
                NUMBER_24: NaN,
                NUMBER_25: Infinity,
                NUMBER_26: Infinity,
                NUMBER_27: -Infinity,
                NUMBER_28: 0,
                NUMBER_29: 0,
                NUMBER_30: 0,
                NUMBER_31: 0,
                NUMBER_32: 0,
                NUMBER_33: 0,
                NUMBER_34: 1,
                NUMBER_35: 1,
                NUMBER_36: -1,
                NUMBER_37: 0,
                NUMBER_38: 0,

                NUMBER_41: 45,
                NUMBER_42: 45,
                NUMBER_43: -0.45,
                NUMBER_44: 4.5e+123,
                NUMBER_45: 4.5e+123,
                NUMBER_46: -4.5e-123,

                NUMBER_101: 0,
                NUMBER_102: 4.5e+123,
                NUMBER_103: 0,
                NUMBER_104: 0,
                NUMBER_105: 1,
                NUMBER_106: 0,
                NUMBER_107: 4.5e+123,
                NUMBER_108: 0,

                NUMBER_201: 0,
                NUMBER_202: 4.5e+123,
                NUMBER_203: 0,
                NUMBER_204: 0,
                NUMBER_205: 1,
                NUMBER_206: 0,
                NUMBER_207: 4.5e+123,
                NUMBER_208: 0,

                NUMBER_301: 10,
                NUMBER_302: 10,
                NUMBER_303: -10,
                NUMBER_304: 10,
                NUMBER_305: 10,
                NUMBER_306: -10,
                NUMBER_311: 10,
                NUMBER_312: 10,
                NUMBER_313: -10,
                NUMBER_314: 10,
                NUMBER_315: 10,
                NUMBER_316: -10,
                NUMBER_321: 10,
                NUMBER_322: 10,
                NUMBER_323: -10,
                NUMBER_324: 10,
                NUMBER_325: 10,
                NUMBER_326: -10,

                NUMBER_401: 10,
                NUMBER_402: 10,
                NUMBER_403: -10,
                NUMBER_404: 10,
                NUMBER_405: 10,
                NUMBER_406: -10,
                NUMBER_411: 10,
                NUMBER_412: 10,
                NUMBER_413: -10,
                NUMBER_414: 10,
                NUMBER_415: 10,
                NUMBER_416: -10,
                NUMBER_421: 10,
                NUMBER_422: 10,
                NUMBER_423: -10,
                NUMBER_424: 10,
                NUMBER_425: 10,
                NUMBER_426: -10,

                NUMBER_501: 0,
                NUMBER_502: 0,
                NUMBER_503: 0,
                NUMBER_504: 0,
                NUMBER_505: 0,
                NUMBER_506: 0,
                NUMBER_511: 0,
                NUMBER_512: 0,
                NUMBER_513: 0,
                NUMBER_514: 0,
                NUMBER_515: 0,
                NUMBER_516: 0,
                NUMBER_521: 0,
                NUMBER_522: 0,
                NUMBER_523: 0,
                NUMBER_524: 0,
                NUMBER_525: 0,
                NUMBER_526: 0,

                // No conversion
                NUMBER_1001: 'NUMBER:any',
                NUMBER_1002: 'NUM:any',
                NUMBER_1003: ' NUMBER: any ',
                NUMBER_1004: ' NUM: any ',
                NUMBER_1005: ' number : any ',
                NUMBER_1006: ' num : any ',
            }
            const expectedForEnv = {
                NUMBER_1: '1',
                NUMBER_2: '1',
                NUMBER_3: '1',
                NUMBER_4: '1',
                NUMBER_5: '1',
                NUMBER_6: '1',
                NUMBER_7: '0',
                NUMBER_8: '0',
                NUMBER_9: '0',
                NUMBER_10: '0',
                NUMBER_11: '0',
                NUMBER_12: '0',
                NUMBER_13: '0',
                NUMBER_14: '0',
                NUMBER_15: '0',
                NUMBER_16: 'NaN',
                NUMBER_17: 'NaN',
                NUMBER_18: '0',
                NUMBER_19: '0',
                NUMBER_20: '0',
                NUMBER_21: '0',
                NUMBER_22: '0',
                NUMBER_23: '0',
                NUMBER_24: 'NaN',
                NUMBER_25: 'Infinity',
                NUMBER_26: 'Infinity',
                NUMBER_27: '-Infinity',
                NUMBER_28: '0',
                NUMBER_29: '0',
                NUMBER_30: '0',
                NUMBER_31: '0',
                NUMBER_32: '0',
                NUMBER_33: '0',
                NUMBER_34: '1',
                NUMBER_35: '1',
                NUMBER_36: '-1',
                NUMBER_37: '0',
                NUMBER_38: '0',

                NUMBER_41: '45',
                NUMBER_42: '45',
                NUMBER_43: '-0.45',
                NUMBER_44: '4.5e+123',
                NUMBER_45: '4.5e+123',
                NUMBER_46: '-4.5e-123',

                NUMBER_101: '0',
                NUMBER_102: '4.5e+123',
                NUMBER_103: '0',
                NUMBER_104: '0',
                NUMBER_105: '1',
                NUMBER_106: '0',
                NUMBER_107: '4.5e+123',
                NUMBER_108: '0',

                NUMBER_201: '0',
                NUMBER_202: '4.5e+123',
                NUMBER_203: '0',
                NUMBER_204: '0',
                NUMBER_205: '1',
                NUMBER_206: '0',
                NUMBER_207: '4.5e+123',
                NUMBER_208: '0',

                NUMBER_301: '10',
                NUMBER_302: '10',
                NUMBER_303: '-10',
                NUMBER_304: '10',
                NUMBER_305: '10',
                NUMBER_306: '-10',
                NUMBER_311: '10',
                NUMBER_312: '10',
                NUMBER_313: '-10',
                NUMBER_314: '10',
                NUMBER_315: '10',
                NUMBER_316: '-10',
                NUMBER_321: '10',
                NUMBER_322: '10',
                NUMBER_323: '-10',
                NUMBER_324: '10',
                NUMBER_325: '10',
                NUMBER_326: '-10',

                NUMBER_401: '10',
                NUMBER_402: '10',
                NUMBER_403: '-10',
                NUMBER_404: '10',
                NUMBER_405: '10',
                NUMBER_406: '-10',
                NUMBER_411: '10',
                NUMBER_412: '10',
                NUMBER_413: '-10',
                NUMBER_414: '10',
                NUMBER_415: '10',
                NUMBER_416: '-10',
                NUMBER_421: '10',
                NUMBER_422: '10',
                NUMBER_423: '-10',
                NUMBER_424: '10',
                NUMBER_425: '10',
                NUMBER_426: '-10',

                NUMBER_501: '0',
                NUMBER_502: '0',
                NUMBER_503: '0',
                NUMBER_504: '0',
                NUMBER_505: '0',
                NUMBER_506: '0',
                NUMBER_511: '0',
                NUMBER_512: '0',
                NUMBER_513: '0',
                NUMBER_514: '0',
                NUMBER_515: '0',
                NUMBER_516: '0',
                NUMBER_521: '0',
                NUMBER_522: '0',
                NUMBER_523: '0',
                NUMBER_524: '0',
                NUMBER_525: '0',
                NUMBER_526: '0',

                // No conversion
                NUMBER_1001: 'NUMBER:any',
                NUMBER_1002: 'NUM:any',
                NUMBER_1003: ' NUMBER: any ',
                NUMBER_1004: ' NUM: any ',
                NUMBER_1005: ' number : any ',
                NUMBER_1006: ' num : any ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:bigint', function (done) {
            // input
            const input = {
                BIGINT_1: 'bigint:true',
                BIGINT_2: 'bigint:True',
                BIGINT_3: 'bigint:TRUE',
                BIGINT_4: 'bigint:yes',
                BIGINT_5: 'bigint:Yes',
                BIGINT_6: 'bigint:YES',
                BIGINT_7: 'bigint:false',
                BIGINT_8: 'bigint:False',
                BIGINT_9: 'bigint:FALSE',
                BIGINT_10: 'bigint:no',
                BIGINT_11: 'bigint:No',
                BIGINT_12: 'bigint:NO',
                BIGINT_13: 'bigint:null',
                BIGINT_14: 'bigint:Null',
                BIGINT_15: 'bigint:NULL',
                BIGINT_16: 'bigint:undefined',
                BIGINT_17: 'bigint:UNDEFINED',
                BIGINT_18: 'bigint:not',
                BIGINT_19: 'bigint:Not',
                BIGINT_20: 'bigint:NOT',
                BIGINT_21: 'bigint:none',
                BIGINT_22: 'bigint:None',
                BIGINT_23: 'bigint:NONE',
                BIGINT_24: 'bigint:NaN',
                BIGINT_25: 'bigint:Infinity',
                BIGINT_26: 'bigint:+Infinity',
                BIGINT_27: 'bigint:-Infinity',
                NUMBER_28: 'bigint:0',
                NUMBER_29: 'bigint:+0',
                NUMBER_30: 'bigint:-0',
                BIGINT_31: 'bigint:5',
                BIGINT_32: 'bigint:+5',
                BIGINT_33: 'bigint:-5',
                BIGINT_34: 'bigint:5.',
                BIGINT_35: 'bigint:+5.',
                BIGINT_36: 'bigint:-5.',
                BIGINT_37: 'bigint:.5',
                BIGINT_38: 'bigint:+.5',
                BIGINT_39: 'bigint:-.5',
                BIGINT_40: 'bigint:5.5',
                BIGINT_41: 'bigint:+5.5',
                BIGINT_42: 'bigint:-5.5',
                BIGINT_43: 'bigint:4.5e10',
                BIGINT_44: 'bigint:+4.5e10',
                BIGINT_45: 'bigint:-4.5e10',
                BIGINT_46: 'bigint:4.5e+10',
                BIGINT_47: 'bigint:+4.5e+10',
                BIGINT_48: 'bigint:-4.5e+10',
                BIGINT_49: 'bigint:4.5e-10',
                BIGINT_50: 'bigint:+4.5e-10',
                BIGINT_51: 'bigint:-4.5e-10',
                BIGINT_52: 'bigint:[]',
                BIGINT_53: 'bigint:{}',

                BIGINT_61: 'bigint:5n',
                BIGINT_62: 'bigint:+5n',
                BIGINT_63: 'bigint:-5n',

                BIGINT_101: 'bigint:',
                BIGINT_102: 'bigint:5any',
                BIGINT_103: 'bigint:.5any',
                BIGINT_104: 'bigint:4.5e+10any',
                BIGINT_105: 'bigint:any',
                BIGINT_106: ' bigint: ',
                BIGINT_107: ' bigint: true ',
                BIGINT_108: ' bigint: false ',
                BIGINT_109: ' bigint: 5any ',
                BIGINT_110: ' bigint: .5any ',
                BIGINT_111: ' bigint: 4.5e+10any ',
                BIGINT_112: ' bigint: any ',

                BIGINT_201: 'big:',
                BIGINT_202: 'big:5any',
                BIGINT_203: 'big:.5any',
                BIGINT_204: 'big:4.5e+10any',
                BIGINT_205: 'big:any',
                BIGINT_206: ' big: ',
                BIGINT_207: ' big: true ',
                BIGINT_208: ' big: false ',
                BIGINT_209: ' big: 5any ',
                BIGINT_210: ' big: .5any ',
                BIGINT_211: ' big: 4.5e+10any ',
                BIGINT_212: ' big: any ',

                BIGINT_301: 'bigint:0b1010n',
                BIGINT_302: 'bigint:+0b1010n',
                BIGINT_303: 'bigint:-0b1010n',
                BIGINT_304: 'bigint:0B1010n',
                BIGINT_305: 'bigint:+0B1010n',
                BIGINT_306: 'bigint:-0B1010n',
                BIGINT_311: 'bigint:0o12n',
                BIGINT_312: 'bigint:+0o12n',
                BIGINT_313: 'bigint:-0o12n',
                BIGINT_314: 'bigint:0O12n',
                BIGINT_315: 'bigint:+0O12n',
                BIGINT_316: 'bigint:-0O12n',
                BIGINT_321: 'bigint:0xan',
                BIGINT_322: 'bigint:+0xan',
                BIGINT_323: 'bigint:-0xan',
                BIGINT_324: 'bigint:0XAn',
                BIGINT_325: 'bigint:+0XAn',
                BIGINT_326: 'bigint:-0XAn',

                BIGINT_401: 'bigint:0b1010',
                BIGINT_402: 'bigint:+0b1010',
                BIGINT_403: 'bigint:-0b1010',
                BIGINT_404: 'bigint:0B1010',
                BIGINT_405: 'bigint:+0B1010',
                BIGINT_406: 'bigint:-0B1010',
                BIGINT_411: 'bigint:0o12',
                BIGINT_412: 'bigint:+0o12',
                BIGINT_413: 'bigint:-0o12',
                BIGINT_414: 'bigint:0O12',
                BIGINT_415: 'bigint:+0O12',
                BIGINT_416: 'bigint:-0O12',
                BIGINT_421: 'bigint:0xa',
                BIGINT_422: 'bigint:+0xa',
                BIGINT_423: 'bigint:-0xa',
                BIGINT_424: 'bigint:0XA',
                BIGINT_425: 'bigint:+0XA',
                BIGINT_426: 'bigint:-0XA',

                BIGINT_501: 'bigint:0b1010any',
                BIGINT_502: 'bigint:+0b1010any',
                BIGINT_503: 'bigint:-0b1010any',
                BIGINT_504: 'bigint:0B1010any',
                BIGINT_505: 'bigint:+0B1010any',
                BIGINT_506: 'bigint:-0B1010any',
                BIGINT_511: 'bigint:0o12any',
                BIGINT_512: 'bigint:+0o12any',
                BIGINT_513: 'bigint:-0o12any',
                BIGINT_514: 'bigint:0O12any',
                BIGINT_515: 'bigint:+0O12any',
                BIGINT_516: 'bigint:-0O12any',
                BIGINT_521: 'bigint:0xaany',
                BIGINT_522: 'bigint:+0xaany',
                BIGINT_523: 'bigint:-0xaany',
                BIGINT_524: 'bigint:0XAany',
                BIGINT_525: 'bigint:+0XAany',
                BIGINT_526: 'bigint:-0XAany',

                // No conversion
                BIGINT_1001: 'BIGINT:any',
                BIGINT_1002: 'BIG:any',
                BIGINT_1003: ' BIGINT: any ',
                BIGINT_1004: ' BIG: any ',
                BIGINT_1005: ' bigint : any ',
                BIGINT_1006: ' big : any ',
            }

            // output
            const expected = {
                BIGINT_1: 1n,
                BIGINT_2: 1n,
                BIGINT_3: 1n,
                BIGINT_4: 1n,
                BIGINT_5: 1n,
                BIGINT_6: 1n,
                BIGINT_7: 0n,
                BIGINT_8: 0n,
                BIGINT_9: 0n,
                BIGINT_10: 0n,
                BIGINT_11: 0n,
                BIGINT_12: 0n,
                BIGINT_13: 0n,
                BIGINT_14: 0n,
                BIGINT_15: 0n,
                BIGINT_16: 0n,
                BIGINT_17: 0n,
                BIGINT_18: 0n,
                BIGINT_19: 0n,
                BIGINT_20: 0n,
                BIGINT_21: 0n,
                BIGINT_22: 0n,
                BIGINT_23: 0n,
                BIGINT_24: 0n,
                BIGINT_25: 1n,
                BIGINT_26: 1n,
                BIGINT_27: -1n,
                NUMBER_28: 0n,
                NUMBER_29: 0n,
                NUMBER_30: 0n,
                BIGINT_31: 5n,
                BIGINT_32: 5n,
                BIGINT_33: -5n,
                BIGINT_34: 5n,
                BIGINT_35: 5n,
                BIGINT_36: -5n,
                BIGINT_37: 0n,
                BIGINT_38: 0n,
                BIGINT_39: 0n,
                BIGINT_40: 5n,
                BIGINT_41: 5n,
                BIGINT_42: -5n,
                BIGINT_43: 45000000000n,
                BIGINT_44: 45000000000n,
                BIGINT_45: -45000000000n,
                BIGINT_46: 45000000000n,
                BIGINT_47: 45000000000n,
                BIGINT_48: -45000000000n,
                BIGINT_49: 0n,
                BIGINT_50: 0n,
                BIGINT_51: 0n,
                BIGINT_52: 0n,
                BIGINT_53: 0n,

                BIGINT_61: 5n,
                BIGINT_62: 5n,
                BIGINT_63: -5n,

                BIGINT_101: 0n,
                BIGINT_102: 5n,
                BIGINT_103: 0n,
                BIGINT_104: 45000000000n,
                BIGINT_105: 0n,
                BIGINT_106: 0n,
                BIGINT_107: 1n,
                BIGINT_108: 0n,
                BIGINT_109: 5n,
                BIGINT_110: 0n,
                BIGINT_111: 45000000000n,
                BIGINT_112: 0n,

                BIGINT_201: 0n,
                BIGINT_202: 5n,
                BIGINT_203: 0n,
                BIGINT_204: 45000000000n,
                BIGINT_205: 0n,
                BIGINT_206: 0n,
                BIGINT_207: 1n,
                BIGINT_208: 0n,
                BIGINT_209: 5n,
                BIGINT_210: 0n,
                BIGINT_211: 45000000000n,
                BIGINT_212: 0n,

                BIGINT_301: 10n,
                BIGINT_302: 10n,
                BIGINT_303: -10n,
                BIGINT_304: 10n,
                BIGINT_305: 10n,
                BIGINT_306: -10n,
                BIGINT_311: 10n,
                BIGINT_312: 10n,
                BIGINT_313: -10n,
                BIGINT_314: 10n,
                BIGINT_315: 10n,
                BIGINT_316: -10n,
                BIGINT_321: 10n,
                BIGINT_322: 10n,
                BIGINT_323: -10n,
                BIGINT_324: 10n,
                BIGINT_325: 10n,
                BIGINT_326: -10n,

                BIGINT_401: 10n,
                BIGINT_402: 10n,
                BIGINT_403: -10n,
                BIGINT_404: 10n,
                BIGINT_405: 10n,
                BIGINT_406: -10n,
                BIGINT_411: 10n,
                BIGINT_412: 10n,
                BIGINT_413: -10n,
                BIGINT_414: 10n,
                BIGINT_415: 10n,
                BIGINT_416: -10n,
                BIGINT_421: 10n,
                BIGINT_422: 10n,
                BIGINT_423: -10n,
                BIGINT_424: 10n,
                BIGINT_425: 10n,
                BIGINT_426: -10n,

                BIGINT_501: 0n,
                BIGINT_502: 0n,
                BIGINT_503: 0n,
                BIGINT_504: 0n,
                BIGINT_505: 0n,
                BIGINT_506: 0n,
                BIGINT_511: 0n,
                BIGINT_512: 0n,
                BIGINT_513: 0n,
                BIGINT_514: 0n,
                BIGINT_515: 0n,
                BIGINT_516: 0n,
                BIGINT_521: 0n,
                BIGINT_522: 0n,
                BIGINT_523: 0n,
                BIGINT_524: 0n,
                BIGINT_525: 0n,
                BIGINT_526: 0n,

                // No conversion
                BIGINT_1001: 'BIGINT:any',
                BIGINT_1002: 'BIG:any',
                BIGINT_1003: ' BIGINT: any ',
                BIGINT_1004: ' BIG: any ',
                BIGINT_1005: ' bigint : any ',
                BIGINT_1006: ' big : any ',
            }
            const expectedForEnv = {
                BIGINT_1: '1n',
                BIGINT_2: '1n',
                BIGINT_3: '1n',
                BIGINT_4: '1n',
                BIGINT_5: '1n',
                BIGINT_6: '1n',
                BIGINT_7: '0n',
                BIGINT_8: '0n',
                BIGINT_9: '0n',
                BIGINT_10: '0n',
                BIGINT_11: '0n',
                BIGINT_12: '0n',
                BIGINT_13: '0n',
                BIGINT_14: '0n',
                BIGINT_15: '0n',
                BIGINT_16: '0n',
                BIGINT_17: '0n',
                BIGINT_18: '0n',
                BIGINT_19: '0n',
                BIGINT_20: '0n',
                BIGINT_21: '0n',
                BIGINT_22: '0n',
                BIGINT_23: '0n',
                BIGINT_24: '0n',
                BIGINT_25: '1n',
                BIGINT_26: '1n',
                BIGINT_27: '-1n',
                NUMBER_28: '0n',
                NUMBER_29: '0n',
                NUMBER_30: '0n',
                BIGINT_31: '5n',
                BIGINT_32: '5n',
                BIGINT_33: '-5n',
                BIGINT_34: '5n',
                BIGINT_35: '5n',
                BIGINT_36: '-5n',
                BIGINT_37: '0n',
                BIGINT_38: '0n',
                BIGINT_39: '0n',
                BIGINT_40: '5n',
                BIGINT_41: '5n',
                BIGINT_42: '-5n',
                BIGINT_43: '45000000000n',
                BIGINT_44: '45000000000n',
                BIGINT_45: '-45000000000n',
                BIGINT_46: '45000000000n',
                BIGINT_47: '45000000000n',
                BIGINT_48: '-45000000000n',
                BIGINT_49: '0n',
                BIGINT_50: '0n',
                BIGINT_51: '0n',
                BIGINT_52: '0n',
                BIGINT_53: '0n',

                BIGINT_61: '5n',
                BIGINT_62: '5n',
                BIGINT_63: '-5n',

                BIGINT_101: '0n',
                BIGINT_102: '5n',
                BIGINT_103: '0n',
                BIGINT_104: '45000000000n',
                BIGINT_105: '0n',
                BIGINT_106: '0n',
                BIGINT_107: '1n',
                BIGINT_108: '0n',
                BIGINT_109: '5n',
                BIGINT_110: '0n',
                BIGINT_111: '45000000000n',
                BIGINT_112: '0n',

                BIGINT_201: '0n',
                BIGINT_202: '5n',
                BIGINT_203: '0n',
                BIGINT_204: '45000000000n',
                BIGINT_205: '0n',
                BIGINT_206: '0n',
                BIGINT_207: '1n',
                BIGINT_208: '0n',
                BIGINT_209: '5n',
                BIGINT_210: '0n',
                BIGINT_211: '45000000000n',
                BIGINT_212: '0n',

                BIGINT_301: '10n',
                BIGINT_302: '10n',
                BIGINT_303: '-10n',
                BIGINT_304: '10n',
                BIGINT_305: '10n',
                BIGINT_306: '-10n',
                BIGINT_311: '10n',
                BIGINT_312: '10n',
                BIGINT_313: '-10n',
                BIGINT_314: '10n',
                BIGINT_315: '10n',
                BIGINT_316: '-10n',
                BIGINT_321: '10n',
                BIGINT_322: '10n',
                BIGINT_323: '-10n',
                BIGINT_324: '10n',
                BIGINT_325: '10n',
                BIGINT_326: '-10n',

                BIGINT_401: '10n',
                BIGINT_402: '10n',
                BIGINT_403: '-10n',
                BIGINT_404: '10n',
                BIGINT_405: '10n',
                BIGINT_406: '-10n',
                BIGINT_411: '10n',
                BIGINT_412: '10n',
                BIGINT_413: '-10n',
                BIGINT_414: '10n',
                BIGINT_415: '10n',
                BIGINT_416: '-10n',
                BIGINT_421: '10n',
                BIGINT_422: '10n',
                BIGINT_423: '-10n',
                BIGINT_424: '10n',
                BIGINT_425: '10n',
                BIGINT_426: '-10n',

                BIGINT_501: '0n',
                BIGINT_502: '0n',
                BIGINT_503: '0n',
                BIGINT_504: '0n',
                BIGINT_505: '0n',
                BIGINT_506: '0n',
                BIGINT_511: '0n',
                BIGINT_512: '0n',
                BIGINT_513: '0n',
                BIGINT_514: '0n',
                BIGINT_515: '0n',
                BIGINT_516: '0n',
                BIGINT_521: '0n',
                BIGINT_522: '0n',
                BIGINT_523: '0n',
                BIGINT_524: '0n',
                BIGINT_525: '0n',
                BIGINT_526: '0n',

                // No conversion
                BIGINT_1001: 'BIGINT:any',
                BIGINT_1002: 'BIG:any',
                BIGINT_1003: ' BIGINT: any ',
                BIGINT_1004: ' BIG: any ',
                BIGINT_1005: ' bigint : any ',
                BIGINT_1006: ' big : any ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:string', function (done) {
            // input
            const input = {
                STRING_1: 'string:null',
                STRING_2: 'string:undefined',
                STRING_3: 'string:true',
                STRING_4: 'string:false',
                STRING_5: 'string:NaN',
                STRING_6: 'string:Infinity',
                STRING_7: 'string:4.5e+1',
                STRING_8: 'string:1n',
                STRING_9: 'string:Symbol(a)',
                STRING_10: 'string:[1,2,3]',
                STRING_11: 'string:{"a":1,"b":2,"c":3}',

                STRING_21: 'string:',
                STRING_22: 'string:any',
                STRING_23: ' string: ',
                STRING_24: ' string: any ',

                STRING_31: 'str:',
                STRING_32: 'str:any',
                STRING_33: ' str: ',
                STRING_34: ' str: any ',

                STRING_101: '',
                STRING_102: 'text',
                STRING_103: ' ',
                STRING_104: ' text ',

                // No conversion
                STRING_1001: 'STRING:any',
                STRING_1002: 'STR:any',
                STRING_1003: ' STRING: any ',
                STRING_1004: ' STR: any ',
                STRING_1005: ' string : any ',
                STRING_1006: ' str : any ',
            }

            // output
            const expected = {
                STRING_1: 'null',
                STRING_2: 'undefined',
                STRING_3: 'true',
                STRING_4: 'false',
                STRING_5: 'NaN',
                STRING_6: 'Infinity',
                STRING_7: '4.5e+1',
                STRING_8: '1n',
                STRING_9: 'Symbol(a)',
                STRING_10: '[1,2,3]',
                STRING_11: '{"a":1,"b":2,"c":3}',

                STRING_21: '',
                STRING_22: 'any',
                STRING_23: ' ',
                STRING_24: ' any ',

                STRING_31: '',
                STRING_32: 'any',
                STRING_33: ' ',
                STRING_34: ' any ',

                STRING_101: '',
                STRING_102: 'text',
                STRING_103: ' ',
                STRING_104: ' text ',

                // No conversion
                STRING_1001: 'STRING:any',
                STRING_1002: 'STR:any',
                STRING_1003: ' STRING: any ',
                STRING_1004: ' STR: any ',
                STRING_1005: ' string : any ',
                STRING_1006: ' str : any ',
            }
            const expectedForEnv = {
                STRING_1: 'null',
                STRING_2: 'undefined',
                STRING_3: 'true',
                STRING_4: 'false',
                STRING_5: 'NaN',
                STRING_6: 'Infinity',
                STRING_7: '4.5e+1',
                STRING_8: '1n',
                STRING_9: 'Symbol(a)',
                STRING_10: '[1,2,3]',
                STRING_11: '{"a":1,"b":2,"c":3}',

                STRING_21: '',
                STRING_22: 'any',
                STRING_23: ' ',
                STRING_24: ' any ',

                STRING_31: '',
                STRING_32: 'any',
                STRING_33: ' ',
                STRING_34: ' any ',

                STRING_101: '',
                STRING_102: 'text',
                STRING_103: ' ',
                STRING_104: ' text ',

                // No conversion
                STRING_1001: 'STRING:any',
                STRING_1002: 'STR:any',
                STRING_1003: ' STRING: any ',
                STRING_1004: ' STR: any ',
                STRING_1005: ' string : any ',
                STRING_1006: ' str : any ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:symbol', function (done) {
            // input
            const input = {
                SYMBOL_1: 'symbol:',
                SYMBOL_2: ' symbol: ',

                SYMBOL_11: 'symbol:any',
                SYMBOL_12: ' symbol: any ',

                SYMBOL_21: 'symbol:Symbol(any)',
                SYMBOL_22: ' symbol: Symbol(any) ',
                SYMBOL_23: ' symbol: Symbol( any ) ',

                // No conversion
                SYMBOL_1001: 'SYMBOL:any',
                SYMBOL_1002: ' SYMBOL: any ',
                SYMBOL_1003: ' symbol : any ',
            }

            // output
            const expected = {
                SYMBOL_1: Symbol(),
                SYMBOL_2: Symbol(' '),

                SYMBOL_11: Symbol('any'),
                SYMBOL_12: Symbol(' any '),

                SYMBOL_21: Symbol('any'),
                SYMBOL_22: Symbol('any'),
                SYMBOL_23: Symbol(' any '),

                // No conversion
                SYMBOL_1001: 'SYMBOL:any',
                SYMBOL_1002: ' SYMBOL: any ',
                SYMBOL_1003: ' symbol : any ',
            }
            const expectedForEnv = {
                SYMBOL_1: 'Symbol()',
                SYMBOL_2: 'Symbol( )',

                SYMBOL_11: 'Symbol(any)',
                SYMBOL_12: 'Symbol( any )',

                SYMBOL_21: 'Symbol(any)',
                SYMBOL_22: 'Symbol(any)',
                SYMBOL_23: 'Symbol( any )',

                // No conversion
                SYMBOL_1001: 'SYMBOL:any',
                SYMBOL_1002: ' SYMBOL: any ',
                SYMBOL_1003: ' symbol : any ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.SYMBOL_1.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_1.toString().should.equal(expected.SYMBOL_1.toString())
            dotenvConversionConfig.parsed.SYMBOL_2.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_2.toString().should.equal(expected.SYMBOL_2.toString())
            dotenvConversionConfig.parsed.SYMBOL_11.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_11.toString().should.equal(expected.SYMBOL_11.toString())
            dotenvConversionConfig.parsed.SYMBOL_12.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_12.toString().should.equal(expected.SYMBOL_12.toString())
            dotenvConversionConfig.parsed.SYMBOL_21.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_21.toString().should.equal(expected.SYMBOL_21.toString())
            dotenvConversionConfig.parsed.SYMBOL_22.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_22.toString().should.equal(expected.SYMBOL_22.toString())
            dotenvConversionConfig.parsed.SYMBOL_23.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_23.toString().should.equal(expected.SYMBOL_23.toString())
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:array', function (done) {
            // input
            const input = {
                ARRAY_1: 'array:[null,true,false,1,"x",[-1,2.1,3e1,4.5e+123],{"y":"z"}]',
                ARRAY_2: 'arr:[null,true,false,1,"x",[-1,2.1,3e1,4.5e+123],{"y":"z"}]',

                ARRAY_21: 'array:[" ","\'\'","\\"\\"","``","\\\\\\\\","()","[]","{}"]',
                ARRAY_22: 'arr:[" ","\'\'","\\"\\"","``","\\\\\\\\","()","[]","{}"]',

                ARRAY_101: 'array:null,true,4.5e+123," x y "',
                ARRAY_102: ' array: [null, true, 4.5e+123, " x y "] ',
                ARRAY_103: ' array: null, true, 4.5e+123, " x y " ',

                ARRAY_201: 'arr:null,true,4.5e+123," x y "',
                ARRAY_202: ' arr: [null, true, 4.5e+123, " x y "] ',
                ARRAY_203: ' arr: null, true, 4.5e+123, " x y " ',

                ARRAY_301: 'array:',
                ARRAY_302: ' array: ',
                ARRAY_303: 'arr:',
                ARRAY_304: 'arr:',

                // No conversion
                ARRAY_1001: 'array:["a","b","c"',
                ARRAY_1002: 'array:"a","b","c"]',
                ARRAY_1003: 'array:"a","b"],"c"',
                ARRAY_1004: 'array:["a","b","c",]',
                ARRAY_1005: 'array:["a","b","c"]any',
                ARRAY_1006: 'array:[\'a\',\'b\',\'c\']',
                ARRAY_1007: 'array:[a,b,c]',
                ARRAY_1021: 'array:[undefined]',
                ARRAY_1022: 'array:[UNDEFINED]',
                ARRAY_1023: 'array:[True]',
                ARRAY_1024: 'array:[TRUE]',
                ARRAY_1025: 'array:[False]',
                ARRAY_1026: 'array:[FALSE]',
                ARRAY_1027: 'array:[no]',
                ARRAY_1028: 'array:[No]',
                ARRAY_1029: 'array:[No]',
                ARRAY_1030: 'array:[NaN]',
                ARRAY_1031: 'array:[Infinity]',
                ARRAY_1032: 'array:[+Infinity]',
                ARRAY_1033: 'array:[-Infinity]',
                ARRAY_2001: 'ARRAY:',
                ARRAY_2002: 'ARR:',
                ARRAY_2003: ' ARRAY: ',
                ARRAY_2004: ' ARR: ',
                ARRAY_2005: ' array : ',
                ARRAY_2006: ' arr : ',
            }

            // output
            const expected = {
                ARRAY_1: [null, true, false, 1, 'x', [-1, 2.1, 30, 4.5e+123], {'y': 'z'}],
                ARRAY_2: [null, true, false, 1, 'x', [-1, 2.1, 30, 4.5e+123], {'y': 'z'}],

                ARRAY_21: [' ', '\'\'', '""', '``', '\\\\', '()', '[]', '{}'],
                ARRAY_22: [' ', '\'\'', '""', '``', '\\\\', '()', '[]', '{}'],

                ARRAY_102: [null, true, 4.5e+123, ' x y '],
                ARRAY_101: [null, true, 4.5e+123, ' x y '],
                ARRAY_103: [null, true, 4.5e+123, ' x y '],

                ARRAY_201: [null, true, 4.5e+123, ' x y '],
                ARRAY_202: [null, true, 4.5e+123, ' x y '],
                ARRAY_203: [null, true, 4.5e+123, ' x y '],

                ARRAY_301: [],
                ARRAY_302: [],
                ARRAY_303: [],
                ARRAY_304: [],

                // No conversion
                ARRAY_1001: '["a","b","c"',
                ARRAY_1002: '"a","b","c"]',
                ARRAY_1003: '"a","b"],"c"',
                ARRAY_1004: '["a","b","c",]',
                ARRAY_1005: '["a","b","c"]any',
                ARRAY_1006: '[\'a\',\'b\',\'c\']',
                ARRAY_1007: '[a,b,c]',
                ARRAY_1021: '[undefined]',
                ARRAY_1022: '[UNDEFINED]',
                ARRAY_1023: '[True]',
                ARRAY_1024: '[TRUE]',
                ARRAY_1025: '[False]',
                ARRAY_1026: '[FALSE]',
                ARRAY_1027: '[no]',
                ARRAY_1028: '[No]',
                ARRAY_1029: '[No]',
                ARRAY_1030: '[NaN]',
                ARRAY_1031: '[Infinity]',
                ARRAY_1032: '[+Infinity]',
                ARRAY_1033: '[-Infinity]',
                ARRAY_2001: 'ARRAY:',
                ARRAY_2002: 'ARR:',
                ARRAY_2003: ' ARRAY: ',
                ARRAY_2004: ' ARR: ',
                ARRAY_2005: ' array : ',
                ARRAY_2006: ' arr : ',
            }
            const expectedForEnv = {
                ARRAY_1: '[null,true,false,1,"x",[-1,2.1,30,4.5e+123],{"y":"z"}]',
                ARRAY_2: '[null,true,false,1,"x",[-1,2.1,30,4.5e+123],{"y":"z"}]',

                ARRAY_21: '[" ","\'\'","\\"\\"","``","\\\\\\\\","()","[]","{}"]',
                ARRAY_22: '[" ","\'\'","\\"\\"","``","\\\\\\\\","()","[]","{}"]',

                ARRAY_101: '[null,true,4.5e+123," x y "]',
                ARRAY_102: '[null,true,4.5e+123," x y "]',
                ARRAY_103: '[null,true,4.5e+123," x y "]',

                ARRAY_201: '[null,true,4.5e+123," x y "]',
                ARRAY_202: '[null,true,4.5e+123," x y "]',
                ARRAY_203: '[null,true,4.5e+123," x y "]',

                ARRAY_301: '[]',
                ARRAY_302: '[]',
                ARRAY_303: '[]',
                ARRAY_304: '[]',

                // No conversion
                ARRAY_1001: '["a","b","c"',
                ARRAY_1002: '"a","b","c"]',
                ARRAY_1003: '"a","b"],"c"',
                ARRAY_1004: '["a","b","c",]',
                ARRAY_1005: '["a","b","c"]any',
                ARRAY_1006: '[\'a\',\'b\',\'c\']',
                ARRAY_1007: '[a,b,c]',
                ARRAY_1021: '[undefined]',
                ARRAY_1022: '[UNDEFINED]',
                ARRAY_1023: '[True]',
                ARRAY_1024: '[TRUE]',
                ARRAY_1025: '[False]',
                ARRAY_1026: '[FALSE]',
                ARRAY_1027: '[no]',
                ARRAY_1028: '[No]',
                ARRAY_1029: '[No]',
                ARRAY_1030: '[NaN]',
                ARRAY_1031: '[Infinity]',
                ARRAY_1032: '[+Infinity]',
                ARRAY_1033: '[-Infinity]',
                ARRAY_2001: 'ARRAY:',
                ARRAY_2002: 'ARR:',
                ARRAY_2003: ' ARRAY: ',
                ARRAY_2004: ' ARR: ',
                ARRAY_2005: ' array : ',
                ARRAY_2006: ' arr : ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:object', function (done) {
            // input
            const input = {
                OBJECT_1: 'object:{"a":null,"b":true,"c":false,"d":1,"e":"x","f":[-1,2.1,3e1,4.5e+123],"g":{"y":"z"}}',
                OBJECT_2: 'obj:{"a":null,"b":true,"c":false,"d":1,"e":"x","f":[-1,2.1,3e1,4.5e+123],"g":{"y":"z"}}',

                OBJECT_21: 'object:{"_":" ","a":"\'\'","b":"\\"\\"","c":"``","d":"\\\\\\\\","e":"()","f":"[]","g":"{}"}',
                OBJECT_22: 'obj:{"_":" ","a":"\'\'","b":"\\"\\"","c":"``","d":"\\\\\\\\","e":"()","f":"[]","g":"{}"}',

                OBJECT_101: 'object:"a":null,"b":true,"c":4.5e+123,"d":" x y "',
                OBJECT_102: ' object: {"a": null, "b": true, "c": 4.5e+123, "d": " x y "} ',
                OBJECT_103: ' object: "a": null, "b": true, "c": 4.5e+123, "d": " x y " ',

                OBJECT_201: 'obj:"a":null,"b":true,"c":4.5e+123,"d":" x y "',
                OBJECT_202: ' obj: {"a": null, "b": true, "c": 4.5e+123, "d": " x y "} ',
                OBJECT_203: ' obj: "a": null, "b": true, "c": 4.5e+123, "d": " x y " ',

                OBJECT_301: 'object:',
                OBJECT_302: ' object: ',
                OBJECT_303: 'obj:',
                OBJECT_304: ' obj: ',

                // No conversion
                OBJECT_1001: 'object:{"a":1,"b":2,"c":3',
                OBJECT_1002: 'object:"a":1,"b":2,"c":3}',
                OBJECT_1003: 'object:"a":1,"b":2},"c":3',
                OBJECT_1004: 'object:{"a":1,"b":2,"c":3,}',
                OBJECT_1005: 'object:{"a":1,"b":2,"c":3}any',
                OBJECT_1006: 'object:{\'a\':1,\'b\':2,\'c\':3}',
                OBJECT_1007: 'object:{a:1,b:2,c:3}',
                OBJECT_1008: 'object:{"a":a,"b":b,"c":c}',
                OBJECT_1021: 'object:{"a":undefined}',
                OBJECT_1022: 'object:{"a":UNDEFINED}',
                OBJECT_1023: 'object:{"a":True}',
                OBJECT_1024: 'object:{"a":TRUE}',
                OBJECT_1025: 'object:{"a":False}',
                OBJECT_1026: 'object:{"a":FALSE}',
                OBJECT_1027: 'object:{"a":no}',
                OBJECT_1028: 'object:{"a":No}',
                OBJECT_1029: 'object:{"a":No}',
                OBJECT_1030: 'object:{"a":NaN}',
                OBJECT_1031: 'object:{"a":Infinity}',
                OBJECT_1032: 'object:{"a":+Infinity}',
                OBJECT_1033: 'object:{"a":-Infinity}',
                OBJECT_2001: 'OBJECT:',
                OBJECT_2002: 'OBJ:',
                OBJECT_2003: ' OBJECT: ',
                OBJECT_2004: ' OBJ: ',
                OBJECT_2005: ' object : ',
                OBJECT_2006: ' obj : ',
            }

            // output
            const expected = {
                OBJECT_1: {'a': null, 'b': true, 'c': false, 'd': 1, 'e': 'x', 'f': [-1, 2.1, 30, 4.5e+123], 'g': {'y': 'z'}},
                OBJECT_2: {'a': null, 'b': true, 'c': false, 'd': 1, 'e': 'x', 'f': [-1, 2.1, 30, 4.5e+123], 'g': {'y': 'z'}},

                OBJECT_21: {'_': ' ', 'a': '\'\'', 'b': '""', 'c': '``', 'd': '\\\\', 'e': '()', 'f': '[]', 'g': '{}'},
                OBJECT_22: {'_': ' ', 'a': '\'\'', 'b': '""', 'c': '``', 'd': '\\\\', 'e': '()', 'f': '[]', 'g': '{}'},

                OBJECT_101: {'a': null, 'b': true, 'c': 4.5e+123, 'd': ' x y '},
                OBJECT_102: {'a': null, 'b': true, 'c': 4.5e+123, 'd': ' x y '},
                OBJECT_103: {'a': null, 'b': true, 'c': 4.5e+123, 'd': ' x y '},

                OBJECT_201: {'a': null, 'b': true, 'c': 4.5e+123, 'd': ' x y '},
                OBJECT_202: {'a': null, 'b': true, 'c': 4.5e+123, 'd': ' x y '},
                OBJECT_203: {'a': null, 'b': true, 'c': 4.5e+123, 'd': ' x y '},

                OBJECT_301: {},
                OBJECT_302: {},
                OBJECT_303: {},
                OBJECT_304: {},

                // No conversion
                OBJECT_1001: '{"a":1,"b":2,"c":3',
                OBJECT_1002: '"a":1,"b":2,"c":3}',
                OBJECT_1003: '"a":1,"b":2},"c":3',
                OBJECT_1004: '{"a":1,"b":2,"c":3,}',
                OBJECT_1005: '{"a":1,"b":2,"c":3}any',
                OBJECT_1006: '{\'a\':1,\'b\':2,\'c\':3}',
                OBJECT_1007: '{a:1,b:2,c:3}',
                OBJECT_1008: '{"a":a,"b":b,"c":c}',
                OBJECT_1021: '{"a":undefined}',
                OBJECT_1022: '{"a":UNDEFINED}',
                OBJECT_1023: '{"a":True}',
                OBJECT_1024: '{"a":TRUE}',
                OBJECT_1025: '{"a":False}',
                OBJECT_1026: '{"a":FALSE}',
                OBJECT_1027: '{"a":no}',
                OBJECT_1028: '{"a":No}',
                OBJECT_1029: '{"a":No}',
                OBJECT_1030: '{"a":NaN}',
                OBJECT_1031: '{"a":Infinity}',
                OBJECT_1032: '{"a":+Infinity}',
                OBJECT_1033: '{"a":-Infinity}',
                OBJECT_2001: 'OBJECT:',
                OBJECT_2002: 'OBJ:',
                OBJECT_2003: ' OBJECT: ',
                OBJECT_2004: ' OBJ: ',
                OBJECT_2005: ' object : ',
                OBJECT_2006: ' obj : ',
            }
            const expectedForEnv = {
                OBJECT_1: '{"a":null,"b":true,"c":false,"d":1,"e":"x","f":[-1,2.1,30,4.5e+123],"g":{"y":"z"}}',
                OBJECT_2: '{"a":null,"b":true,"c":false,"d":1,"e":"x","f":[-1,2.1,30,4.5e+123],"g":{"y":"z"}}',

                OBJECT_21: '{"_":" ","a":"\'\'","b":"\\"\\"","c":"``","d":"\\\\\\\\","e":"()","f":"[]","g":"{}"}',
                OBJECT_22: '{"_":" ","a":"\'\'","b":"\\"\\"","c":"``","d":"\\\\\\\\","e":"()","f":"[]","g":"{}"}',

                OBJECT_101: '{"a":null,"b":true,"c":4.5e+123,"d":" x y "}',
                OBJECT_102: '{"a":null,"b":true,"c":4.5e+123,"d":" x y "}',
                OBJECT_103: '{"a":null,"b":true,"c":4.5e+123,"d":" x y "}',

                OBJECT_201: '{"a":null,"b":true,"c":4.5e+123,"d":" x y "}',
                OBJECT_202: '{"a":null,"b":true,"c":4.5e+123,"d":" x y "}',
                OBJECT_203: '{"a":null,"b":true,"c":4.5e+123,"d":" x y "}',

                OBJECT_301: '{}',
                OBJECT_302: '{}',
                OBJECT_303: '{}',
                OBJECT_304: '{}',

                // No conversion
                OBJECT_1001: '{"a":1,"b":2,"c":3',
                OBJECT_1002: '"a":1,"b":2,"c":3}',
                OBJECT_1003: '"a":1,"b":2},"c":3',
                OBJECT_1004: '{"a":1,"b":2,"c":3,}',
                OBJECT_1005: '{"a":1,"b":2,"c":3}any',
                OBJECT_1006: '{\'a\':1,\'b\':2,\'c\':3}',
                OBJECT_1007: '{a:1,b:2,c:3}',
                OBJECT_1008: '{"a":a,"b":b,"c":c}',
                OBJECT_1021: '{"a":undefined}',
                OBJECT_1022: '{"a":UNDEFINED}',
                OBJECT_1023: '{"a":True}',
                OBJECT_1024: '{"a":TRUE}',
                OBJECT_1025: '{"a":False}',
                OBJECT_1026: '{"a":FALSE}',
                OBJECT_1027: '{"a":no}',
                OBJECT_1028: '{"a":No}',
                OBJECT_1029: '{"a":No}',
                OBJECT_1030: '{"a":NaN}',
                OBJECT_1031: '{"a":Infinity}',
                OBJECT_1032: '{"a":+Infinity}',
                OBJECT_1033: '{"a":-Infinity}',
                OBJECT_2001: 'OBJECT:',
                OBJECT_2002: 'OBJ:',
                OBJECT_2003: ' OBJECT: ',
                OBJECT_2004: ' OBJ: ',
                OBJECT_2005: ' object : ',
                OBJECT_2006: ' obj : ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:custom:not-set(default)', function (done) {
            // input
            const input = {
                OK: 'custom:yes',
                NOT_OK: 'custom:no',
            }

            // output
            const expected = {
                OK: 'custom:yes',
                NOT_OK: 'custom:no',
            }
            const expectedForEnv = {
                OK: 'custom:yes',
                NOT_OK: 'custom:no',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:custom:set', function (done) {
            // input
            const input = {
                OK: 'custom:yes',
                NOT_OK: 'custom:no',
            }
            const inputConfig = {
                methods: {
                    custom(value) {
                        return value === 'yes' ? 1 : 0
                    },
                },
            }

            // output
            const expected = {
                OK: 1,
                NOT_OK: 0,
            }
            const expectedForEnv = {
                OK: '1',
                NOT_OK: '0',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:custom:set:call-existing-method', function (done) {
            // input
            const input = {
                OK: 'custom:yes',
                NOT_OK: 'custom:no',
            }
            const inputConfig = {
                methods: {
                    custom(value, name, config) {
                        return this.boolean(value, name, config)
                    },
                },
            }

            // output
            const expected = {
                OK: true,
                NOT_OK: false,
            }
            const expectedForEnv = {
                OK: 'true',
                NOT_OK: 'false',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method-aliases:not-set(default)', function (done) {
            // input
            const input = {
                OK: 'boolean:yes',
                OK_ALIAS: 'bool:yes',
                OK_ALIAS_MORE: 'bl:yes',
            }

            // output
            const expected = {
                OK: true,
                OK_ALIAS: true,
                OK_ALIAS_MORE: 'bl:yes',
            }
            const expectedForEnv = {
                OK: 'true',
                OK_ALIAS: 'true',
                OK_ALIAS_MORE: 'bl:yes',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method-aliases:set', function (done) {
            // input
            const input = {
                OK: 'boolean:yes',
                OK_ALIAS: 'bool:yes',
                OK_ALIAS_MORE: 'bl:yes',
            }
            const inputConfig = {
                methodAliases: {
                    bl: 'boolean',
                },
            }

            // output
            const expected = {
                OK: true,
                OK_ALIAS: true,
                OK_ALIAS_MORE: true,
            }
            const expectedForEnv = {
                OK: 'true',
                OK_ALIAS: 'true',
                OK_ALIAS_MORE: 'true',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })
    })

    describe('convert:integration:dotenv', function () {
        const dotEnvPath = './.env'
        after(() => {
            fs.rmSync(dotEnvPath)
        })

        function useEnv(envBasename) {
            fs.copyFileSync(`./tests/inputs/${envBasename}.env`, dotEnvPath)
            return dotenv.config()
        }

        it('ignoreProcessEnv:no(default)', function (done) {
            // input
            const input = 'ignore-process-env'

            // output
            const expected = {
                OK: true,
            }
            const expectedForEnv = {
                OK: 'true',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('ignoreProcessEnv:yes', function (done) {
            // input
            const input = 'ignore-process-env'
            const inputConfig = {
                ignoreProcessEnv: true,
            }

            // output
            const expected = {
                OK: true,
            }
            const expectedForEnv = {
                OK: 'yes',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('prevents:not-set(default)', function (done) {
            // input
            const input = 'prevents'

            // output
            const expected = {
                OK: true,
            }
            const expectedForEnv = {
                OK: 'true',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('prevents:set', function (done) {
            // input
            const input = 'prevents'
            const inputConfig = {
                prevents: ['OK'],
            }

            // output
            const expected = {
                OK: 'yes',
            }
            const expectedForEnv = {
                OK: 'yes',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('specs:not-set(default)', function (done) {
            // input
            const input = 'specs'

            // output
            const expected = {
                OK: true,
            }
            const expectedForEnv = {
                OK: 'true',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('specs:set:use-exist-method', function (done) {
            // input
            const input = 'specs'
            const inputConfig = {
                specs: {
                    OK: 'number',
                },
            }

            // output
            const expected = {
                OK: 1,
            }
            const expectedForEnv = {
                OK: '1',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('specs:set:use-exist-method-alias', function (done) {
            // input
            const input = 'specs'
            const inputConfig = {
                specs: {
                    OK: 'num',
                },
            }

            // output
            const expected = {
                OK: 1,
            }
            const expectedForEnv = {
                OK: '1',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('specs:set:use-none-exist-method(fallback->string)', function (done) {
            // input
            const input = 'specs'
            const inputConfig = {
                specs: {
                    OK: 'none-existing-method-will-fallback-to-string-method',
                },
            }

            // output
            const expected = {
                OK: 'yes',
            }
            const expectedForEnv = {
                OK: 'yes',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('specs:set:use-custom-method', function (done) {
            // input
            const input = 'specs'
            const inputConfig = {
                specs: {
                    OK: function (value) {
                        return `custom:${value}`
                    },
                },
            }

            // output
            const expected = {
                OK: 'custom:yes',
            }
            const expectedForEnv = {
                OK: 'custom:yes',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('specs:set:use-anything-else(fallback->string)', function (done) {
            // input
            const input = 'specs'
            const inputConfig = {
                specs: {
                    OK: {'anything else': 'will fallback to string method'},
                },
            }

            // output
            const expected = {
                OK: 'yes',
            }
            const expectedForEnv = {
                OK: 'yes',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:auto:null', function (done) {
            // input
            const input = 'method.auto.null'

            // output
            const expected = {
                NULL_1: null,
                NULL_2: null,
                NULL_3: null,

                NULL_101: null,

                // No conversion
                NULL_1001: 'NuLL',
            }
            const expectedForEnv = {
                NULL_1: 'null',
                NULL_2: 'null',
                NULL_3: 'null',

                NULL_101: 'null',

                // No conversion
                NULL_1001: 'NuLL',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:auto:undefined', function (done) {
            // input
            const input = 'method.auto.undefined'

            // output
            const expected = {
                UNDEFINED_1: undefined,
                UNDEFINED_2: undefined,

                UNDEFINED_101: undefined,

                // No conversion
                UNDEFINED_1001: 'Undefined',
            }
            const expectedForEnv = {
                UNDEFINED_1: 'undefined',
                UNDEFINED_2: 'undefined',

                UNDEFINED_101: 'undefined',

                // No conversion
                UNDEFINED_1001: 'Undefined',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:auto:boolean', function (done) {
            // input
            const input = 'method.auto.boolean'

            // output
            const expected = {
                BOOLEAN_1: true,
                BOOLEAN_2: true,
                BOOLEAN_3: true,
                BOOLEAN_4: true,
                BOOLEAN_5: true,
                BOOLEAN_6: true,
                BOOLEAN_7: true,
                BOOLEAN_8: true,
                BOOLEAN_9: true,

                BOOLEAN_11: false,
                BOOLEAN_12: false,
                BOOLEAN_13: false,
                BOOLEAN_14: false,
                BOOLEAN_15: false,
                BOOLEAN_16: false,
                BOOLEAN_17: false,
                BOOLEAN_18: false,
                BOOLEAN_19: false,
                BOOLEAN_20: false,
                BOOLEAN_21: false,
                BOOLEAN_22: false,

                BOOLEAN_101: true,
                BOOLEAN_102: false,

                // No conversion
                BOOLEAN_1001: 'TruE',
                BOOLEAN_1002: 'YeS',
                BOOLEAN_1003: 'oK',
                BOOLEAN_1004: 'FalsE',
                BOOLEAN_1005: 'nO',
                BOOLEAN_1006: 'NoT',
                BOOLEAN_1007: 'NonE',
            }
            const expectedForEnv = {
                BOOLEAN_1: 'true',
                BOOLEAN_2: 'true',
                BOOLEAN_3: 'true',
                BOOLEAN_4: 'true',
                BOOLEAN_5: 'true',
                BOOLEAN_6: 'true',
                BOOLEAN_7: 'true',
                BOOLEAN_8: 'true',
                BOOLEAN_9: 'true',

                BOOLEAN_11: 'false',
                BOOLEAN_12: 'false',
                BOOLEAN_13: 'false',
                BOOLEAN_14: 'false',
                BOOLEAN_15: 'false',
                BOOLEAN_16: 'false',
                BOOLEAN_17: 'false',
                BOOLEAN_18: 'false',
                BOOLEAN_19: 'false',
                BOOLEAN_20: 'false',
                BOOLEAN_21: 'false',
                BOOLEAN_22: 'false',

                BOOLEAN_101: 'true',
                BOOLEAN_102: 'false',

                // No conversion
                BOOLEAN_1001: 'TruE',
                BOOLEAN_1002: 'YeS',
                BOOLEAN_1003: 'oK',
                BOOLEAN_1004: 'FalsE',
                BOOLEAN_1005: 'nO',
                BOOLEAN_1006: 'NoT',
                BOOLEAN_1007: 'NonE',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:auto:number', function (done) {
            // input
            const input = 'method.auto.number'

            // output
            const expected = {
                NUMBER_1: NaN,
                NUMBER_2: Infinity,
                NUMBER_3: +Infinity,
                NUMBER_4: -Infinity,
                NUMBER_5: 0,
                NUMBER_6: 0,
                NUMBER_7: 0,

                NUMBER_11: 5,
                NUMBER_12: 5,
                NUMBER_13: -5,
                NUMBER_14: 5,
                NUMBER_15: 5,
                NUMBER_16: -5,
                NUMBER_17: 0.5,
                NUMBER_18: 0.5,
                NUMBER_19: -0.5,
                NUMBER_20: 4.5,
                NUMBER_21: 4.5,
                NUMBER_22: -4.5,

                NUMBER_31: 50,
                NUMBER_32: 50,
                NUMBER_33: -50,
                NUMBER_34: 50,
                NUMBER_35: 50,
                NUMBER_36: -50,
                NUMBER_37: 5,
                NUMBER_38: 5,
                NUMBER_39: -5,
                NUMBER_40: 45,
                NUMBER_41: 45,
                NUMBER_42: -45,

                NUMBER_51: 50,
                NUMBER_52: 50,
                NUMBER_53: -50,
                NUMBER_54: 50,
                NUMBER_55: 50,
                NUMBER_56: -50,
                NUMBER_57: 5,
                NUMBER_58: 5,
                NUMBER_59: -5,
                NUMBER_60: 45,
                NUMBER_61: 45,
                NUMBER_72: -45,

                NUMBER_81: 0.5,
                NUMBER_82: 0.5,
                NUMBER_83: -0.5,
                NUMBER_84: 0.5,
                NUMBER_85: 0.5,
                NUMBER_86: -0.5,
                NUMBER_87: 0.05,
                NUMBER_88: 0.05,
                NUMBER_89: -0.05,
                NUMBER_90: 0.45,
                NUMBER_91: 0.45,
                NUMBER_92: -0.45,

                NUMBER_101: 45,
                NUMBER_102: 45,
                NUMBER_103: 0.45,

                NUMBER_111: 4.5e+123,
                NUMBER_112: 4.5e+123,
                NUMBER_113: 4.5e-123,

                NUMBER_211: 5,
                NUMBER_212: 4.5,
                NUMBER_213: 45,
                NUMBER_214: 4.5e+123,

                NUMBER_301: 10,
                NUMBER_302: 10,
                NUMBER_303: -10,
                NUMBER_304: 10,
                NUMBER_305: 10,
                NUMBER_306: -10,
                NUMBER_311: 10,
                NUMBER_312: 10,
                NUMBER_313: -10,
                NUMBER_314: 10,
                NUMBER_315: 10,
                NUMBER_316: -10,
                NUMBER_321: 10,
                NUMBER_322: 10,
                NUMBER_323: -10,
                NUMBER_324: 10,
                NUMBER_325: 10,
                NUMBER_326: -10,

                NUMBER_901: NaN,
                NUMBER_902: Infinity,
                NUMBER_903: 4.5e+123,

                // No conversion
                NUMBER_1001: 'NAN',
                NUMBER_1002: 'INFINITY',
                NUMBER_1003: '+INFINITY',
                NUMBER_1004: '-INFINITY',
                // These values are supported only in number method
                NUMBER_1011: '4.5e',
                NUMBER_1012: '4.5e+123any',
            }
            const expectedForEnv = {
                NUMBER_1: 'NaN',
                NUMBER_2: 'Infinity',
                NUMBER_3: 'Infinity',
                NUMBER_4: '-Infinity',
                NUMBER_5: '0',
                NUMBER_6: '0',
                NUMBER_7: '0',

                NUMBER_11: '5',
                NUMBER_12: '5',
                NUMBER_13: '-5',
                NUMBER_14: '5',
                NUMBER_15: '5',
                NUMBER_16: '-5',
                NUMBER_17: '0.5',
                NUMBER_18: '0.5',
                NUMBER_19: '-0.5',
                NUMBER_20: '4.5',
                NUMBER_21: '4.5',
                NUMBER_22: '-4.5',

                NUMBER_31: '50',
                NUMBER_32: '50',
                NUMBER_33: '-50',
                NUMBER_34: '50',
                NUMBER_35: '50',
                NUMBER_36: '-50',
                NUMBER_37: '5',
                NUMBER_38: '5',
                NUMBER_39: '-5',
                NUMBER_40: '45',
                NUMBER_41: '45',
                NUMBER_42: '-45',

                NUMBER_51: '50',
                NUMBER_52: '50',
                NUMBER_53: '-50',
                NUMBER_54: '50',
                NUMBER_55: '50',
                NUMBER_56: '-50',
                NUMBER_57: '5',
                NUMBER_58: '5',
                NUMBER_59: '-5',
                NUMBER_60: '45',
                NUMBER_61: '45',
                NUMBER_72: '-45',

                NUMBER_81: '0.5',
                NUMBER_82: '0.5',
                NUMBER_83: '-0.5',
                NUMBER_84: '0.5',
                NUMBER_85: '0.5',
                NUMBER_86: '-0.5',
                NUMBER_87: '0.05',
                NUMBER_88: '0.05',
                NUMBER_89: '-0.05',
                NUMBER_90: '0.45',
                NUMBER_91: '0.45',
                NUMBER_92: '-0.45',

                NUMBER_101: '45',
                NUMBER_102: '45',
                NUMBER_103: '0.45',

                NUMBER_111: '4.5e+123',
                NUMBER_112: '4.5e+123',
                NUMBER_113: '4.5e-123',

                NUMBER_211: '5',
                NUMBER_212: '4.5',
                NUMBER_213: '45',
                NUMBER_214: '4.5e+123',

                NUMBER_301: '10',
                NUMBER_302: '10',
                NUMBER_303: '-10',
                NUMBER_304: '10',
                NUMBER_305: '10',
                NUMBER_306: '-10',
                NUMBER_311: '10',
                NUMBER_312: '10',
                NUMBER_313: '-10',
                NUMBER_314: '10',
                NUMBER_315: '10',
                NUMBER_316: '-10',
                NUMBER_321: '10',
                NUMBER_322: '10',
                NUMBER_323: '-10',
                NUMBER_324: '10',
                NUMBER_325: '10',
                NUMBER_326: '-10',

                NUMBER_901: 'NaN',
                NUMBER_902: 'Infinity',
                NUMBER_903: '4.5e+123',

                // No conversion
                NUMBER_1001: 'NAN',
                NUMBER_1002: 'INFINITY',
                NUMBER_1003: '+INFINITY',
                NUMBER_1004: '-INFINITY',
                // These values are supported only in number method
                NUMBER_1011: '4.5e',
                NUMBER_1012: '4.5e+123any',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:auto:bigint', function (done) {
            // input
            const input = 'method.auto.bigint'

            // output
            const expected = {
                BIGINT_1: 0n,
                BIGINT_2: 0n,
                BIGINT_3: 0n,
                BIGINT_4: 5n,
                BIGINT_5: 5n,
                BIGINT_6: -5n,

                BIGINT_101: 5n,

                BIGINT_201: 10n,
                BIGINT_202: 10n,
                BIGINT_203: -10n,
                BIGINT_204: 10n,
                BIGINT_205: 10n,
                BIGINT_206: -10n,
                BIGINT_211: 10n,
                BIGINT_212: 10n,
                BIGINT_213: -10n,
                BIGINT_214: 10n,
                BIGINT_215: 10n,
                BIGINT_216: -10n,
                BIGINT_221: 10n,
                BIGINT_222: 10n,
                BIGINT_223: -10n,
                BIGINT_224: 10n,
                BIGINT_225: 10n,
                BIGINT_226: -10n,

                // No conversion
                BIGINT_1001: '5N',
                BIGINT_1002: '+5N',
                BIGINT_1003: '-5N',

                BIGINT_1101: '5nany',
                BIGINT_1102: '+5nany',
                BIGINT_1103: '-5nany',

                BIGINT_1201: '0b1010N',
                BIGINT_1202: '+0b1010N',
                BIGINT_1203: '-0b1010N',
                BIGINT_1204: '0B1010N',
                BIGINT_1205: '+0B1010N',
                BIGINT_1206: '-0B1010N',
                BIGINT_1211: '0o12N',
                BIGINT_1212: '+0o12N',
                BIGINT_1213: '-0o12N',
                BIGINT_1214: '0O12N',
                BIGINT_1215: '+0O12N',
                BIGINT_1216: '-0O12N',
                BIGINT_1221: '0xaN',
                BIGINT_1222: '+0xaN',
                BIGINT_1223: '-0xaN',
                BIGINT_1224: '0XAN',
                BIGINT_1225: '+0XAN',
                BIGINT_1226: '-0XAN',

                BIGINT_1301: '0b1010nany',
                BIGINT_1302: '+0b1010nany',
                BIGINT_1303: '-0b1010nany',
                BIGINT_1304: '0B1010nany',
                BIGINT_1305: '+0B1010nany',
                BIGINT_1306: '-0B1010nany',
                BIGINT_1311: '0o12nany',
                BIGINT_1312: '+0o12nany',
                BIGINT_1313: '-0o12nany',
                BIGINT_1314: '0O12nany',
                BIGINT_1315: '+0O12nany',
                BIGINT_1316: '-0O12nany',
                BIGINT_1321: '0xanany',
                BIGINT_1322: '+0xanany',
                BIGINT_1323: '-0xanany',
                BIGINT_1324: '0XAnany',
                BIGINT_1325: '+0XAnany',
                BIGINT_1326: '-0XAnany',
            }
            const expectedForEnv = {
                BIGINT_1: '0n',
                BIGINT_2: '0n',
                BIGINT_3: '0n',
                BIGINT_4: '5n',
                BIGINT_5: '5n',
                BIGINT_6: '-5n',

                BIGINT_101: '5n',

                BIGINT_201: '10n',
                BIGINT_202: '10n',
                BIGINT_203: '-10n',
                BIGINT_204: '10n',
                BIGINT_205: '10n',
                BIGINT_206: '-10n',
                BIGINT_211: '10n',
                BIGINT_212: '10n',
                BIGINT_213: '-10n',
                BIGINT_214: '10n',
                BIGINT_215: '10n',
                BIGINT_216: '-10n',
                BIGINT_221: '10n',
                BIGINT_222: '10n',
                BIGINT_223: '-10n',
                BIGINT_224: '10n',
                BIGINT_225: '10n',
                BIGINT_226: '-10n',

                // No conversion
                BIGINT_1001: '5N',
                BIGINT_1002: '+5N',
                BIGINT_1003: '-5N',

                BIGINT_1101: '5nany',
                BIGINT_1102: '+5nany',
                BIGINT_1103: '-5nany',

                BIGINT_1201: '0b1010N',
                BIGINT_1202: '+0b1010N',
                BIGINT_1203: '-0b1010N',
                BIGINT_1204: '0B1010N',
                BIGINT_1205: '+0B1010N',
                BIGINT_1206: '-0B1010N',
                BIGINT_1211: '0o12N',
                BIGINT_1212: '+0o12N',
                BIGINT_1213: '-0o12N',
                BIGINT_1214: '0O12N',
                BIGINT_1215: '+0O12N',
                BIGINT_1216: '-0O12N',
                BIGINT_1221: '0xaN',
                BIGINT_1222: '+0xaN',
                BIGINT_1223: '-0xaN',
                BIGINT_1224: '0XAN',
                BIGINT_1225: '+0XAN',
                BIGINT_1226: '-0XAN',

                BIGINT_1301: '0b1010nany',
                BIGINT_1302: '+0b1010nany',
                BIGINT_1303: '-0b1010nany',
                BIGINT_1304: '0B1010nany',
                BIGINT_1305: '+0B1010nany',
                BIGINT_1306: '-0B1010nany',
                BIGINT_1311: '0o12nany',
                BIGINT_1312: '+0o12nany',
                BIGINT_1313: '-0o12nany',
                BIGINT_1314: '0O12nany',
                BIGINT_1315: '+0O12nany',
                BIGINT_1316: '-0O12nany',
                BIGINT_1321: '0xanany',
                BIGINT_1322: '+0xanany',
                BIGINT_1323: '-0xanany',
                BIGINT_1324: '0XAnany',
                BIGINT_1325: '+0XAnany',
                BIGINT_1326: '-0XAnany',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:auto:symbol', function (done) {
            // input
            const input = 'method.auto.symbol'

            // output
            const expected = {
                SYMBOL_1: Symbol(),
                SYMBOL_2: Symbol('any'),
                SYMBOL_3: Symbol('(any)'),
                SYMBOL_4: Symbol('a(n)y'),
                SYMBOL_5: Symbol('a(ny'),
                SYMBOL_6: Symbol('an)y'),

                SYMBOL_101: Symbol('any'),

                // No conversion
                SYMBOL_1001: 'SYMBOL(any)',
                SYMBOL_1002: 'Symbol(any)any',
            }
            const expectedForEnv = {
                SYMBOL_1: 'Symbol()',
                SYMBOL_2: 'Symbol(any)',
                SYMBOL_3: 'Symbol((any))',
                SYMBOL_4: 'Symbol(a(n)y)',
                SYMBOL_5: 'Symbol(a(ny)',
                SYMBOL_6: 'Symbol(an)y)',

                SYMBOL_101: 'Symbol(any)',

                // No conversion
                SYMBOL_1001: 'SYMBOL(any)',
                SYMBOL_1002: 'Symbol(any)any',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.SYMBOL_1.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_1.toString().should.equal(expected.SYMBOL_1.toString())
            dotenvConversionConfig.parsed.SYMBOL_2.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_2.toString().should.equal(expected.SYMBOL_2.toString())
            dotenvConversionConfig.parsed.SYMBOL_3.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_3.toString().should.equal(expected.SYMBOL_3.toString())
            dotenvConversionConfig.parsed.SYMBOL_4.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_4.toString().should.equal(expected.SYMBOL_4.toString())
            dotenvConversionConfig.parsed.SYMBOL_5.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_5.toString().should.equal(expected.SYMBOL_5.toString())
            dotenvConversionConfig.parsed.SYMBOL_6.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_6.toString().should.equal(expected.SYMBOL_6.toString())
            dotenvConversionConfig.parsed.SYMBOL_101.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_101.toString().should.equal(expected.SYMBOL_101.toString())
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:auto:array', function (done) {
            // input
            const input = 'method.auto.array'

            // output
            const expected = {
                ARRAY_1: [null, true, false, 1, 'x', [-1, 2.1, 30, 4.5e+123], {'y': 'z'}],

                ARRAY_21: [' ', '\'\'', '""', '``', '\\\\', '()', '[]', '{}'],

                ARRAY_102: [null, true, 4.5e+123, ' x y '],
                ARRAY_101: [null, true, 4.5e+123, ' x y '],
                ARRAY_103: [null, true, 4.5e+123, ' x y '],
                ARRAY_104: ['a'],

                // No conversion
                ARRAY_1001: '["a","b","c"',
                ARRAY_1002: '"a","b","c"]',
                ARRAY_1003: '"a","b"],"c"',
                ARRAY_1004: '["a","b","c",]',
                ARRAY_1005: '["a","b","c"]any',
                ARRAY_1006: '[\'a\',\'b\',\'c\']',
                ARRAY_1007: '[a,b,c]',
                ARRAY_1021: '[undefined]',
                ARRAY_1022: '[UNDEFINED]',
                ARRAY_1023: '[True]',
                ARRAY_1024: '[TRUE]',
                ARRAY_1025: '[False]',
                ARRAY_1026: '[FALSE]',
                ARRAY_1027: '[no]',
                ARRAY_1028: '[No]',
                ARRAY_1029: '[No]',
                ARRAY_1030: '[NaN]',
                ARRAY_1031: '[Infinity]',
                ARRAY_1032: '[+Infinity]',
                ARRAY_1033: '[-Infinity]',
            }
            const expectedForEnv = {
                ARRAY_1: '[null,true,false,1,"x",[-1,2.1,30,4.5e+123],{"y":"z"}]',

                ARRAY_21: '[" ","\'\'","\\"\\"","``","\\\\\\\\","()","[]","{}"]',

                ARRAY_102: '[null,true,4.5e+123," x y "]',
                ARRAY_101: '[null,true,4.5e+123," x y "]',
                ARRAY_103: '[null,true,4.5e+123," x y "]',
                ARRAY_104: '["a"]',

                // No conversion
                ARRAY_1001: '["a","b","c"',
                ARRAY_1002: '"a","b","c"]',
                ARRAY_1003: '"a","b"],"c"',
                ARRAY_1004: '["a","b","c",]',
                ARRAY_1005: '["a","b","c"]any',
                ARRAY_1006: '[\'a\',\'b\',\'c\']',
                ARRAY_1007: '[a,b,c]',
                ARRAY_1021: '[undefined]',
                ARRAY_1022: '[UNDEFINED]',
                ARRAY_1023: '[True]',
                ARRAY_1024: '[TRUE]',
                ARRAY_1025: '[False]',
                ARRAY_1026: '[FALSE]',
                ARRAY_1027: '[no]',
                ARRAY_1028: '[No]',
                ARRAY_1029: '[No]',
                ARRAY_1030: '[NaN]',
                ARRAY_1031: '[Infinity]',
                ARRAY_1032: '[+Infinity]',
                ARRAY_1033: '[-Infinity]',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:auto:object', function (done) {
            // input
            const input = 'method.auto.object'

            // output
            const expected = {
                OBJECT_1: {'a': null, 'b': true, 'c': false, 'd': 1, 'e': 'x', 'f': [-1, 2.1, 30, 4.5e+123], 'g': {'y': 'z'}},

                OBJECT_21: {'_': ' ', 'a': '\'\'', 'b': '""', 'c': '``', 'd': '\\\\', 'e': '()', 'f': '[]', 'g': '{}'},

                OBJECT_101: {'a': null, 'b': true, 'c': 4.5e+123, 'd': ' x y '},
                OBJECT_102: {'a': null, 'b': true, 'c': 4.5e+123, 'd': ' x y '},
                OBJECT_103: {'a': null, 'b': true, 'c': 4.5e+123, 'd': ' x y '},

                // No conversion
                OBJECT_1001: '{"a":1,"b":2,"c":3',
                OBJECT_1002: '"a":1,"b":2,"c":3}',
                OBJECT_1003: '"a":1,"b":2},"c":3',
                OBJECT_1004: '{"a":1,"b":2,"c":3,}',
                OBJECT_1005: '{"a":1,"b":2,"c":3}any',
                OBJECT_1006: '{\'a\':1,\'b\':2,\'c\':3}',
                OBJECT_1007: '{a:1,b:2,c:3}',
                OBJECT_1008: '{"a":a,"b":b,"c":c}',
                OBJECT_1021: '{"a":undefined}',
                OBJECT_1022: '{"a":UNDEFINED}',
                OBJECT_1023: '{"a":True}',
                OBJECT_1024: '{"a":TRUE}',
                OBJECT_1025: '{"a":False}',
                OBJECT_1026: '{"a":FALSE}',
                OBJECT_1027: '{"a":no}',
                OBJECT_1028: '{"a":No}',
                OBJECT_1029: '{"a":No}',
                OBJECT_1030: '{"a":NaN}',
                OBJECT_1031: '{"a":Infinity}',
                OBJECT_1032: '{"a":+Infinity}',
                OBJECT_1033: '{"a":-Infinity}',
            }
            const expectedForEnv = {
                OBJECT_1: '{"a":null,"b":true,"c":false,"d":1,"e":"x","f":[-1,2.1,30,4.5e+123],"g":{"y":"z"}}',

                OBJECT_21: '{"_":" ","a":"\'\'","b":"\\"\\"","c":"``","d":"\\\\\\\\","e":"()","f":"[]","g":"{}"}',

                OBJECT_101: '{"a":null,"b":true,"c":4.5e+123,"d":" x y "}',
                OBJECT_102: '{"a":null,"b":true,"c":4.5e+123,"d":" x y "}',
                OBJECT_103: '{"a":null,"b":true,"c":4.5e+123,"d":" x y "}',

                // No conversion
                OBJECT_1001: '{"a":1,"b":2,"c":3',
                OBJECT_1002: '"a":1,"b":2,"c":3}',
                OBJECT_1003: '"a":1,"b":2},"c":3',
                OBJECT_1004: '{"a":1,"b":2,"c":3,}',
                OBJECT_1005: '{"a":1,"b":2,"c":3}any',
                OBJECT_1006: '{\'a\':1,\'b\':2,\'c\':3}',
                OBJECT_1007: '{a:1,b:2,c:3}',
                OBJECT_1008: '{"a":a,"b":b,"c":c}',
                OBJECT_1021: '{"a":undefined}',
                OBJECT_1022: '{"a":UNDEFINED}',
                OBJECT_1023: '{"a":True}',
                OBJECT_1024: '{"a":TRUE}',
                OBJECT_1025: '{"a":False}',
                OBJECT_1026: '{"a":FALSE}',
                OBJECT_1027: '{"a":no}',
                OBJECT_1028: '{"a":No}',
                OBJECT_1029: '{"a":No}',
                OBJECT_1030: '{"a":NaN}',
                OBJECT_1031: '{"a":Infinity}',
                OBJECT_1032: '{"a":+Infinity}',
                OBJECT_1033: '{"a":-Infinity}',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:boolean', function (done) {
            // input
            const input = 'method.boolean'

            // output
            const expected = {
                BOOLEAN_1: false,
                BOOLEAN_2: false,
                BOOLEAN_3: false,
                BOOLEAN_4: false,
                BOOLEAN_5: false,
                BOOLEAN_6: false,
                BOOLEAN_7: false,
                BOOLEAN_8: false,
                BOOLEAN_9: false,
                BOOLEAN_10: false,
                BOOLEAN_11: false,
                BOOLEAN_12: false,
                BOOLEAN_13: false,
                BOOLEAN_14: false,
                BOOLEAN_15: false,
                BOOLEAN_16: false,
                BOOLEAN_17: false,
                BOOLEAN_18: false,

                BOOLEAN_21: false,
                BOOLEAN_22: false,
                BOOLEAN_23: false,
                BOOLEAN_24: false,
                BOOLEAN_25: false,
                BOOLEAN_26: false,
                BOOLEAN_27: false,
                BOOLEAN_28: false,
                BOOLEAN_29: false,
                BOOLEAN_30: false,
                BOOLEAN_31: false,
                BOOLEAN_32: false,
                BOOLEAN_33: false,
                BOOLEAN_34: false,
                BOOLEAN_35: false,

                BOOLEAN_41: false,
                BOOLEAN_42: false,
                BOOLEAN_43: false,

                BOOLEAN_51: false,
                BOOLEAN_52: false,

                BOOLEAN_101: false,
                BOOLEAN_102: false,
                BOOLEAN_103: false,
                BOOLEAN_104: false,
                BOOLEAN_105: false,

                BOOLEAN_201: true,
                BOOLEAN_202: true,

                BOOLEAN_301: false,
                BOOLEAN_302: false,
                BOOLEAN_303: true,
                BOOLEAN_304: true,

                BOOLEAN_401: true,
                BOOLEAN_402: true,
                BOOLEAN_403: true,
                BOOLEAN_404: true,
                BOOLEAN_405: true,
                BOOLEAN_406: true,
                BOOLEAN_411: true,
                BOOLEAN_412: true,
                BOOLEAN_413: true,
                BOOLEAN_414: true,
                BOOLEAN_415: true,
                BOOLEAN_416: true,
                BOOLEAN_421: true,
                BOOLEAN_422: true,
                BOOLEAN_423: true,
                BOOLEAN_424: true,
                BOOLEAN_425: true,
                BOOLEAN_426: true,

                BOOLEAN_501: false,
                BOOLEAN_502: false,
                BOOLEAN_503: false,
                BOOLEAN_504: false,
                BOOLEAN_505: false,
                BOOLEAN_506: false,
                BOOLEAN_511: false,
                BOOLEAN_512: false,
                BOOLEAN_513: false,
                BOOLEAN_514: false,
                BOOLEAN_515: false,
                BOOLEAN_516: false,
                BOOLEAN_521: false,
                BOOLEAN_522: false,
                BOOLEAN_523: false,
                BOOLEAN_524: false,
                BOOLEAN_525: false,
                BOOLEAN_526: false,

                BOOLEAN_601: true,
                BOOLEAN_602: true,
                BOOLEAN_603: true,
                BOOLEAN_604: true,
                BOOLEAN_605: true,
                BOOLEAN_606: true,
                BOOLEAN_611: true,
                BOOLEAN_612: true,
                BOOLEAN_613: true,
                BOOLEAN_614: true,
                BOOLEAN_615: true,
                BOOLEAN_616: true,
                BOOLEAN_621: true,
                BOOLEAN_622: true,
                BOOLEAN_623: true,
                BOOLEAN_624: true,
                BOOLEAN_625: true,
                BOOLEAN_626: true,

                BOOLEAN_701: false,
                BOOLEAN_702: false,
                BOOLEAN_703: false,
                BOOLEAN_704: false,
                BOOLEAN_705: false,
                BOOLEAN_706: false,
                BOOLEAN_711: false,
                BOOLEAN_712: false,
                BOOLEAN_713: false,
                BOOLEAN_714: false,
                BOOLEAN_715: false,
                BOOLEAN_716: false,
                BOOLEAN_721: false,
                BOOLEAN_722: false,
                BOOLEAN_723: false,
                BOOLEAN_724: false,
                BOOLEAN_725: false,
                BOOLEAN_726: false,

                // No conversion
                BOOLEAN_1001: 'BOOLEAN:any',
                BOOLEAN_1002: 'BOOL:any',
                BOOLEAN_1003: ' BOOLEAN: any ',
                BOOLEAN_1004: ' BOOL: any ',
                BOOLEAN_1005: ' boolean : any ',
                BOOLEAN_1006: ' bool : any ',
            }
            const expectedForEnv = {
                BOOLEAN_1: 'false',
                BOOLEAN_2: 'false',
                BOOLEAN_3: 'false',
                BOOLEAN_4: 'false',
                BOOLEAN_5: 'false',
                BOOLEAN_6: 'false',
                BOOLEAN_7: 'false',
                BOOLEAN_8: 'false',
                BOOLEAN_9: 'false',
                BOOLEAN_10: 'false',
                BOOLEAN_11: 'false',
                BOOLEAN_12: 'false',
                BOOLEAN_13: 'false',
                BOOLEAN_14: 'false',
                BOOLEAN_15: 'false',
                BOOLEAN_16: 'false',
                BOOLEAN_17: 'false',
                BOOLEAN_18: 'false',

                BOOLEAN_21: 'false',
                BOOLEAN_22: 'false',
                BOOLEAN_23: 'false',
                BOOLEAN_24: 'false',
                BOOLEAN_25: 'false',
                BOOLEAN_26: 'false',
                BOOLEAN_27: 'false',
                BOOLEAN_28: 'false',
                BOOLEAN_29: 'false',
                BOOLEAN_30: 'false',
                BOOLEAN_31: 'false',
                BOOLEAN_32: 'false',
                BOOLEAN_33: 'false',
                BOOLEAN_34: 'false',
                BOOLEAN_35: 'false',

                BOOLEAN_41: 'false',
                BOOLEAN_42: 'false',
                BOOLEAN_43: 'false',

                BOOLEAN_51: 'false',
                BOOLEAN_52: 'false',

                BOOLEAN_101: 'false',
                BOOLEAN_102: 'false',
                BOOLEAN_103: 'false',
                BOOLEAN_104: 'false',
                BOOLEAN_105: 'false',

                BOOLEAN_201: 'true',
                BOOLEAN_202: 'true',

                BOOLEAN_301: 'false',
                BOOLEAN_302: 'false',
                BOOLEAN_303: 'true',
                BOOLEAN_304: 'true',

                BOOLEAN_401: 'true',
                BOOLEAN_402: 'true',
                BOOLEAN_403: 'true',
                BOOLEAN_404: 'true',
                BOOLEAN_405: 'true',
                BOOLEAN_406: 'true',
                BOOLEAN_411: 'true',
                BOOLEAN_412: 'true',
                BOOLEAN_413: 'true',
                BOOLEAN_414: 'true',
                BOOLEAN_415: 'true',
                BOOLEAN_416: 'true',
                BOOLEAN_421: 'true',
                BOOLEAN_422: 'true',
                BOOLEAN_423: 'true',
                BOOLEAN_424: 'true',
                BOOLEAN_425: 'true',
                BOOLEAN_426: 'true',

                BOOLEAN_501: 'false',
                BOOLEAN_502: 'false',
                BOOLEAN_503: 'false',
                BOOLEAN_504: 'false',
                BOOLEAN_505: 'false',
                BOOLEAN_506: 'false',
                BOOLEAN_511: 'false',
                BOOLEAN_512: 'false',
                BOOLEAN_513: 'false',
                BOOLEAN_514: 'false',
                BOOLEAN_515: 'false',
                BOOLEAN_516: 'false',
                BOOLEAN_521: 'false',
                BOOLEAN_522: 'false',
                BOOLEAN_523: 'false',
                BOOLEAN_524: 'false',
                BOOLEAN_525: 'false',
                BOOLEAN_526: 'false',

                BOOLEAN_601: 'true',
                BOOLEAN_602: 'true',
                BOOLEAN_603: 'true',
                BOOLEAN_604: 'true',
                BOOLEAN_605: 'true',
                BOOLEAN_606: 'true',
                BOOLEAN_611: 'true',
                BOOLEAN_612: 'true',
                BOOLEAN_613: 'true',
                BOOLEAN_614: 'true',
                BOOLEAN_615: 'true',
                BOOLEAN_616: 'true',
                BOOLEAN_621: 'true',
                BOOLEAN_622: 'true',
                BOOLEAN_623: 'true',
                BOOLEAN_624: 'true',
                BOOLEAN_625: 'true',
                BOOLEAN_626: 'true',

                BOOLEAN_701: 'false',
                BOOLEAN_702: 'false',
                BOOLEAN_703: 'false',
                BOOLEAN_704: 'false',
                BOOLEAN_705: 'false',
                BOOLEAN_706: 'false',
                BOOLEAN_711: 'false',
                BOOLEAN_712: 'false',
                BOOLEAN_713: 'false',
                BOOLEAN_714: 'false',
                BOOLEAN_715: 'false',
                BOOLEAN_716: 'false',
                BOOLEAN_721: 'false',
                BOOLEAN_722: 'false',
                BOOLEAN_723: 'false',
                BOOLEAN_724: 'false',
                BOOLEAN_725: 'false',
                BOOLEAN_726: 'false',

                // No conversion
                BOOLEAN_1001: 'BOOLEAN:any',
                BOOLEAN_1002: 'BOOL:any',
                BOOLEAN_1003: ' BOOLEAN: any ',
                BOOLEAN_1004: ' BOOL: any ',
                BOOLEAN_1005: ' boolean : any ',
                BOOLEAN_1006: ' bool : any ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:number', function (done) {
            // input
            const input = 'method.number'

            // output
            const expected = {
                NUMBER_1: 1,
                NUMBER_2: 1,
                NUMBER_3: 1,
                NUMBER_4: 1,
                NUMBER_5: 1,
                NUMBER_6: 1,
                NUMBER_7: 0,
                NUMBER_8: 0,
                NUMBER_9: 0,
                NUMBER_10: 0,
                NUMBER_11: 0,
                NUMBER_12: 0,
                NUMBER_13: 0,
                NUMBER_14: 0,
                NUMBER_15: 0,
                NUMBER_16: NaN,
                NUMBER_17: NaN,
                NUMBER_18: 0,
                NUMBER_19: 0,
                NUMBER_20: 0,
                NUMBER_21: 0,
                NUMBER_22: 0,
                NUMBER_23: 0,
                NUMBER_24: NaN,
                NUMBER_25: Infinity,
                NUMBER_26: Infinity,
                NUMBER_27: -Infinity,
                NUMBER_28: 0,
                NUMBER_29: 0,
                NUMBER_30: 0,
                NUMBER_31: 0,
                NUMBER_32: 0,
                NUMBER_33: 0,
                NUMBER_34: 1,
                NUMBER_35: 1,
                NUMBER_36: -1,
                NUMBER_37: 0,
                NUMBER_38: 0,

                NUMBER_41: 45,
                NUMBER_42: 45,
                NUMBER_43: -0.45,
                NUMBER_44: 4.5e+123,
                NUMBER_45: 4.5e+123,
                NUMBER_46: -4.5e-123,

                NUMBER_101: 0,
                NUMBER_102: 4.5e+123,
                NUMBER_103: 0,
                NUMBER_104: 0,
                NUMBER_105: 1,
                NUMBER_106: 0,
                NUMBER_107: 4.5e+123,
                NUMBER_108: 0,

                NUMBER_201: 0,
                NUMBER_202: 4.5e+123,
                NUMBER_203: 0,
                NUMBER_204: 0,
                NUMBER_205: 1,
                NUMBER_206: 0,
                NUMBER_207: 4.5e+123,
                NUMBER_208: 0,

                NUMBER_301: 10,
                NUMBER_302: 10,
                NUMBER_303: -10,
                NUMBER_304: 10,
                NUMBER_305: 10,
                NUMBER_306: -10,
                NUMBER_311: 10,
                NUMBER_312: 10,
                NUMBER_313: -10,
                NUMBER_314: 10,
                NUMBER_315: 10,
                NUMBER_316: -10,
                NUMBER_321: 10,
                NUMBER_322: 10,
                NUMBER_323: -10,
                NUMBER_324: 10,
                NUMBER_325: 10,
                NUMBER_326: -10,

                NUMBER_401: 10,
                NUMBER_402: 10,
                NUMBER_403: -10,
                NUMBER_404: 10,
                NUMBER_405: 10,
                NUMBER_406: -10,
                NUMBER_411: 10,
                NUMBER_412: 10,
                NUMBER_413: -10,
                NUMBER_414: 10,
                NUMBER_415: 10,
                NUMBER_416: -10,
                NUMBER_421: 10,
                NUMBER_422: 10,
                NUMBER_423: -10,
                NUMBER_424: 10,
                NUMBER_425: 10,
                NUMBER_426: -10,

                NUMBER_501: 0,
                NUMBER_502: 0,
                NUMBER_503: 0,
                NUMBER_504: 0,
                NUMBER_505: 0,
                NUMBER_506: 0,
                NUMBER_511: 0,
                NUMBER_512: 0,
                NUMBER_513: 0,
                NUMBER_514: 0,
                NUMBER_515: 0,
                NUMBER_516: 0,
                NUMBER_521: 0,
                NUMBER_522: 0,
                NUMBER_523: 0,
                NUMBER_524: 0,
                NUMBER_525: 0,
                NUMBER_526: 0,

                // No conversion
                NUMBER_1001: 'NUMBER:any',
                NUMBER_1002: 'NUM:any',
                NUMBER_1003: ' NUMBER: any ',
                NUMBER_1004: ' NUM: any ',
                NUMBER_1005: ' number : any ',
                NUMBER_1006: ' num : any ',
            }
            const expectedForEnv = {
                NUMBER_1: '1',
                NUMBER_2: '1',
                NUMBER_3: '1',
                NUMBER_4: '1',
                NUMBER_5: '1',
                NUMBER_6: '1',
                NUMBER_7: '0',
                NUMBER_8: '0',
                NUMBER_9: '0',
                NUMBER_10: '0',
                NUMBER_11: '0',
                NUMBER_12: '0',
                NUMBER_13: '0',
                NUMBER_14: '0',
                NUMBER_15: '0',
                NUMBER_16: 'NaN',
                NUMBER_17: 'NaN',
                NUMBER_18: '0',
                NUMBER_19: '0',
                NUMBER_20: '0',
                NUMBER_21: '0',
                NUMBER_22: '0',
                NUMBER_23: '0',
                NUMBER_24: 'NaN',
                NUMBER_25: 'Infinity',
                NUMBER_26: 'Infinity',
                NUMBER_27: '-Infinity',
                NUMBER_28: '0',
                NUMBER_29: '0',
                NUMBER_30: '0',
                NUMBER_31: '0',
                NUMBER_32: '0',
                NUMBER_33: '0',
                NUMBER_34: '1',
                NUMBER_35: '1',
                NUMBER_36: '-1',
                NUMBER_37: '0',
                NUMBER_38: '0',

                NUMBER_41: '45',
                NUMBER_42: '45',
                NUMBER_43: '-0.45',
                NUMBER_44: '4.5e+123',
                NUMBER_45: '4.5e+123',
                NUMBER_46: '-4.5e-123',

                NUMBER_101: '0',
                NUMBER_102: '4.5e+123',
                NUMBER_103: '0',
                NUMBER_104: '0',
                NUMBER_105: '1',
                NUMBER_106: '0',
                NUMBER_107: '4.5e+123',
                NUMBER_108: '0',

                NUMBER_201: '0',
                NUMBER_202: '4.5e+123',
                NUMBER_203: '0',
                NUMBER_204: '0',
                NUMBER_205: '1',
                NUMBER_206: '0',
                NUMBER_207: '4.5e+123',
                NUMBER_208: '0',

                NUMBER_301: '10',
                NUMBER_302: '10',
                NUMBER_303: '-10',
                NUMBER_304: '10',
                NUMBER_305: '10',
                NUMBER_306: '-10',
                NUMBER_311: '10',
                NUMBER_312: '10',
                NUMBER_313: '-10',
                NUMBER_314: '10',
                NUMBER_315: '10',
                NUMBER_316: '-10',
                NUMBER_321: '10',
                NUMBER_322: '10',
                NUMBER_323: '-10',
                NUMBER_324: '10',
                NUMBER_325: '10',
                NUMBER_326: '-10',

                NUMBER_401: '10',
                NUMBER_402: '10',
                NUMBER_403: '-10',
                NUMBER_404: '10',
                NUMBER_405: '10',
                NUMBER_406: '-10',
                NUMBER_411: '10',
                NUMBER_412: '10',
                NUMBER_413: '-10',
                NUMBER_414: '10',
                NUMBER_415: '10',
                NUMBER_416: '-10',
                NUMBER_421: '10',
                NUMBER_422: '10',
                NUMBER_423: '-10',
                NUMBER_424: '10',
                NUMBER_425: '10',
                NUMBER_426: '-10',

                NUMBER_501: '0',
                NUMBER_502: '0',
                NUMBER_503: '0',
                NUMBER_504: '0',
                NUMBER_505: '0',
                NUMBER_506: '0',
                NUMBER_511: '0',
                NUMBER_512: '0',
                NUMBER_513: '0',
                NUMBER_514: '0',
                NUMBER_515: '0',
                NUMBER_516: '0',
                NUMBER_521: '0',
                NUMBER_522: '0',
                NUMBER_523: '0',
                NUMBER_524: '0',
                NUMBER_525: '0',
                NUMBER_526: '0',

                // No conversion
                NUMBER_1001: 'NUMBER:any',
                NUMBER_1002: 'NUM:any',
                NUMBER_1003: ' NUMBER: any ',
                NUMBER_1004: ' NUM: any ',
                NUMBER_1005: ' number : any ',
                NUMBER_1006: ' num : any ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:bigint', function (done) {
            // input
            const input = 'method.bigint'

            // output
            const expected = {
                BIGINT_1: 1n,
                BIGINT_2: 1n,
                BIGINT_3: 1n,
                BIGINT_4: 1n,
                BIGINT_5: 1n,
                BIGINT_6: 1n,
                BIGINT_7: 0n,
                BIGINT_8: 0n,
                BIGINT_9: 0n,
                BIGINT_10: 0n,
                BIGINT_11: 0n,
                BIGINT_12: 0n,
                BIGINT_13: 0n,
                BIGINT_14: 0n,
                BIGINT_15: 0n,
                BIGINT_16: 0n,
                BIGINT_17: 0n,
                BIGINT_18: 0n,
                BIGINT_19: 0n,
                BIGINT_20: 0n,
                BIGINT_21: 0n,
                BIGINT_22: 0n,
                BIGINT_23: 0n,
                BIGINT_24: 0n,
                BIGINT_25: 1n,
                BIGINT_26: 1n,
                BIGINT_27: -1n,
                NUMBER_28: 0n,
                NUMBER_29: 0n,
                NUMBER_30: 0n,
                BIGINT_31: 5n,
                BIGINT_32: 5n,
                BIGINT_33: -5n,
                BIGINT_34: 5n,
                BIGINT_35: 5n,
                BIGINT_36: -5n,
                BIGINT_37: 0n,
                BIGINT_38: 0n,
                BIGINT_39: 0n,
                BIGINT_40: 5n,
                BIGINT_41: 5n,
                BIGINT_42: -5n,
                BIGINT_43: 45000000000n,
                BIGINT_44: 45000000000n,
                BIGINT_45: -45000000000n,
                BIGINT_46: 45000000000n,
                BIGINT_47: 45000000000n,
                BIGINT_48: -45000000000n,
                BIGINT_49: 0n,
                BIGINT_50: 0n,
                BIGINT_51: 0n,
                BIGINT_52: 0n,
                BIGINT_53: 0n,

                BIGINT_61: 5n,
                BIGINT_62: 5n,
                BIGINT_63: -5n,

                BIGINT_101: 0n,
                BIGINT_102: 5n,
                BIGINT_103: 0n,
                BIGINT_104: 45000000000n,
                BIGINT_105: 0n,
                BIGINT_106: 0n,
                BIGINT_107: 1n,
                BIGINT_108: 0n,
                BIGINT_109: 5n,
                BIGINT_110: 0n,
                BIGINT_111: 45000000000n,
                BIGINT_112: 0n,

                BIGINT_201: 0n,
                BIGINT_202: 5n,
                BIGINT_203: 0n,
                BIGINT_204: 45000000000n,
                BIGINT_205: 0n,
                BIGINT_206: 0n,
                BIGINT_207: 1n,
                BIGINT_208: 0n,
                BIGINT_209: 5n,
                BIGINT_210: 0n,
                BIGINT_211: 45000000000n,
                BIGINT_212: 0n,

                BIGINT_301: 10n,
                BIGINT_302: 10n,
                BIGINT_303: -10n,
                BIGINT_304: 10n,
                BIGINT_305: 10n,
                BIGINT_306: -10n,
                BIGINT_311: 10n,
                BIGINT_312: 10n,
                BIGINT_313: -10n,
                BIGINT_314: 10n,
                BIGINT_315: 10n,
                BIGINT_316: -10n,
                BIGINT_321: 10n,
                BIGINT_322: 10n,
                BIGINT_323: -10n,
                BIGINT_324: 10n,
                BIGINT_325: 10n,
                BIGINT_326: -10n,

                BIGINT_401: 10n,
                BIGINT_402: 10n,
                BIGINT_403: -10n,
                BIGINT_404: 10n,
                BIGINT_405: 10n,
                BIGINT_406: -10n,
                BIGINT_411: 10n,
                BIGINT_412: 10n,
                BIGINT_413: -10n,
                BIGINT_414: 10n,
                BIGINT_415: 10n,
                BIGINT_416: -10n,
                BIGINT_421: 10n,
                BIGINT_422: 10n,
                BIGINT_423: -10n,
                BIGINT_424: 10n,
                BIGINT_425: 10n,
                BIGINT_426: -10n,

                BIGINT_501: 0n,
                BIGINT_502: 0n,
                BIGINT_503: 0n,
                BIGINT_504: 0n,
                BIGINT_505: 0n,
                BIGINT_506: 0n,
                BIGINT_511: 0n,
                BIGINT_512: 0n,
                BIGINT_513: 0n,
                BIGINT_514: 0n,
                BIGINT_515: 0n,
                BIGINT_516: 0n,
                BIGINT_521: 0n,
                BIGINT_522: 0n,
                BIGINT_523: 0n,
                BIGINT_524: 0n,
                BIGINT_525: 0n,
                BIGINT_526: 0n,

                // No conversion
                BIGINT_1001: 'BIGINT:any',
                BIGINT_1002: 'BIG:any',
                BIGINT_1003: ' BIGINT: any ',
                BIGINT_1004: ' BIG: any ',
                BIGINT_1005: ' bigint : any ',
                BIGINT_1006: ' big : any ',
            }
            const expectedForEnv = {
                BIGINT_1: '1n',
                BIGINT_2: '1n',
                BIGINT_3: '1n',
                BIGINT_4: '1n',
                BIGINT_5: '1n',
                BIGINT_6: '1n',
                BIGINT_7: '0n',
                BIGINT_8: '0n',
                BIGINT_9: '0n',
                BIGINT_10: '0n',
                BIGINT_11: '0n',
                BIGINT_12: '0n',
                BIGINT_13: '0n',
                BIGINT_14: '0n',
                BIGINT_15: '0n',
                BIGINT_16: '0n',
                BIGINT_17: '0n',
                BIGINT_18: '0n',
                BIGINT_19: '0n',
                BIGINT_20: '0n',
                BIGINT_21: '0n',
                BIGINT_22: '0n',
                BIGINT_23: '0n',
                BIGINT_24: '0n',
                BIGINT_25: '1n',
                BIGINT_26: '1n',
                BIGINT_27: '-1n',
                NUMBER_28: '0n',
                NUMBER_29: '0n',
                NUMBER_30: '0n',
                BIGINT_31: '5n',
                BIGINT_32: '5n',
                BIGINT_33: '-5n',
                BIGINT_34: '5n',
                BIGINT_35: '5n',
                BIGINT_36: '-5n',
                BIGINT_37: '0n',
                BIGINT_38: '0n',
                BIGINT_39: '0n',
                BIGINT_40: '5n',
                BIGINT_41: '5n',
                BIGINT_42: '-5n',
                BIGINT_43: '45000000000n',
                BIGINT_44: '45000000000n',
                BIGINT_45: '-45000000000n',
                BIGINT_46: '45000000000n',
                BIGINT_47: '45000000000n',
                BIGINT_48: '-45000000000n',
                BIGINT_49: '0n',
                BIGINT_50: '0n',
                BIGINT_51: '0n',
                BIGINT_52: '0n',
                BIGINT_53: '0n',

                BIGINT_61: '5n',
                BIGINT_62: '5n',
                BIGINT_63: '-5n',

                BIGINT_101: '0n',
                BIGINT_102: '5n',
                BIGINT_103: '0n',
                BIGINT_104: '45000000000n',
                BIGINT_105: '0n',
                BIGINT_106: '0n',
                BIGINT_107: '1n',
                BIGINT_108: '0n',
                BIGINT_109: '5n',
                BIGINT_110: '0n',
                BIGINT_111: '45000000000n',
                BIGINT_112: '0n',

                BIGINT_201: '0n',
                BIGINT_202: '5n',
                BIGINT_203: '0n',
                BIGINT_204: '45000000000n',
                BIGINT_205: '0n',
                BIGINT_206: '0n',
                BIGINT_207: '1n',
                BIGINT_208: '0n',
                BIGINT_209: '5n',
                BIGINT_210: '0n',
                BIGINT_211: '45000000000n',
                BIGINT_212: '0n',

                BIGINT_301: '10n',
                BIGINT_302: '10n',
                BIGINT_303: '-10n',
                BIGINT_304: '10n',
                BIGINT_305: '10n',
                BIGINT_306: '-10n',
                BIGINT_311: '10n',
                BIGINT_312: '10n',
                BIGINT_313: '-10n',
                BIGINT_314: '10n',
                BIGINT_315: '10n',
                BIGINT_316: '-10n',
                BIGINT_321: '10n',
                BIGINT_322: '10n',
                BIGINT_323: '-10n',
                BIGINT_324: '10n',
                BIGINT_325: '10n',
                BIGINT_326: '-10n',

                BIGINT_401: '10n',
                BIGINT_402: '10n',
                BIGINT_403: '-10n',
                BIGINT_404: '10n',
                BIGINT_405: '10n',
                BIGINT_406: '-10n',
                BIGINT_411: '10n',
                BIGINT_412: '10n',
                BIGINT_413: '-10n',
                BIGINT_414: '10n',
                BIGINT_415: '10n',
                BIGINT_416: '-10n',
                BIGINT_421: '10n',
                BIGINT_422: '10n',
                BIGINT_423: '-10n',
                BIGINT_424: '10n',
                BIGINT_425: '10n',
                BIGINT_426: '-10n',

                BIGINT_501: '0n',
                BIGINT_502: '0n',
                BIGINT_503: '0n',
                BIGINT_504: '0n',
                BIGINT_505: '0n',
                BIGINT_506: '0n',
                BIGINT_511: '0n',
                BIGINT_512: '0n',
                BIGINT_513: '0n',
                BIGINT_514: '0n',
                BIGINT_515: '0n',
                BIGINT_516: '0n',
                BIGINT_521: '0n',
                BIGINT_522: '0n',
                BIGINT_523: '0n',
                BIGINT_524: '0n',
                BIGINT_525: '0n',
                BIGINT_526: '0n',

                // No conversion
                BIGINT_1001: 'BIGINT:any',
                BIGINT_1002: 'BIG:any',
                BIGINT_1003: ' BIGINT: any ',
                BIGINT_1004: ' BIG: any ',
                BIGINT_1005: ' bigint : any ',
                BIGINT_1006: ' big : any ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:string', function (done) {
            // input
            const input = 'method.string'

            // output
            const expected = {
                STRING_1: 'null',
                STRING_2: 'undefined',
                STRING_3: 'true',
                STRING_4: 'false',
                STRING_5: 'NaN',
                STRING_6: 'Infinity',
                STRING_7: '4.5e+1',
                STRING_8: '1n',
                STRING_9: 'Symbol(a)',
                STRING_10: '[1,2,3]',
                STRING_11: '{"a":1,"b":2,"c":3}',

                STRING_21: '',
                STRING_22: 'any',
                STRING_23: ' ',
                STRING_24: ' any ',

                STRING_31: '',
                STRING_32: 'any',
                STRING_33: ' ',
                STRING_34: ' any ',

                STRING_101: '',
                STRING_102: 'text',
                STRING_103: ' ',
                STRING_104: ' text ',

                // No conversion
                STRING_1001: 'STRING:any',
                STRING_1002: 'STR:any',
                STRING_1003: ' STRING: any ',
                STRING_1004: ' STR: any ',
                STRING_1005: ' string : any ',
                STRING_1006: ' str : any ',
            }
            const expectedForEnv = {
                STRING_1: 'null',
                STRING_2: 'undefined',
                STRING_3: 'true',
                STRING_4: 'false',
                STRING_5: 'NaN',
                STRING_6: 'Infinity',
                STRING_7: '4.5e+1',
                STRING_8: '1n',
                STRING_9: 'Symbol(a)',
                STRING_10: '[1,2,3]',
                STRING_11: '{"a":1,"b":2,"c":3}',

                STRING_21: '',
                STRING_22: 'any',
                STRING_23: ' ',
                STRING_24: ' any ',

                STRING_31: '',
                STRING_32: 'any',
                STRING_33: ' ',
                STRING_34: ' any ',

                STRING_101: '',
                STRING_102: 'text',
                STRING_103: ' ',
                STRING_104: ' text ',

                // No conversion
                STRING_1001: 'STRING:any',
                STRING_1002: 'STR:any',
                STRING_1003: ' STRING: any ',
                STRING_1004: ' STR: any ',
                STRING_1005: ' string : any ',
                STRING_1006: ' str : any ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:symbol', function (done) {
            // input
            const input = 'method.symbol'

            // output
            const expected = {
                SYMBOL_1: Symbol(),
                SYMBOL_2: Symbol(' '),

                SYMBOL_11: Symbol('any'),
                SYMBOL_12: Symbol(' any '),

                SYMBOL_21: Symbol('any'),
                SYMBOL_22: Symbol('any'),
                SYMBOL_23: Symbol(' any '),

                // No conversion
                SYMBOL_1001: 'SYMBOL:any',
                SYMBOL_1002: ' SYMBOL: any ',
                SYMBOL_1003: ' symbol : any ',
            }
            const expectedForEnv = {
                SYMBOL_1: 'Symbol()',
                SYMBOL_2: 'Symbol( )',

                SYMBOL_11: 'Symbol(any)',
                SYMBOL_12: 'Symbol( any )',

                SYMBOL_21: 'Symbol(any)',
                SYMBOL_22: 'Symbol(any)',
                SYMBOL_23: 'Symbol( any )',

                // No conversion
                SYMBOL_1001: 'SYMBOL:any',
                SYMBOL_1002: ' SYMBOL: any ',
                SYMBOL_1003: ' symbol : any ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.SYMBOL_1.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_1.toString().should.equal(expected.SYMBOL_1.toString())
            dotenvConversionConfig.parsed.SYMBOL_2.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_2.toString().should.equal(expected.SYMBOL_2.toString())
            dotenvConversionConfig.parsed.SYMBOL_11.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_11.toString().should.equal(expected.SYMBOL_11.toString())
            dotenvConversionConfig.parsed.SYMBOL_12.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_12.toString().should.equal(expected.SYMBOL_12.toString())
            dotenvConversionConfig.parsed.SYMBOL_21.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_21.toString().should.equal(expected.SYMBOL_21.toString())
            dotenvConversionConfig.parsed.SYMBOL_22.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_22.toString().should.equal(expected.SYMBOL_22.toString())
            dotenvConversionConfig.parsed.SYMBOL_23.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_23.toString().should.equal(expected.SYMBOL_23.toString())
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:array', function (done) {
            // input
            const input = 'method.array'

            // output
            const expected = {
                ARRAY_1: [null, true, false, 1, 'x', [-1, 2.1, 30, 4.5e+123], {'y': 'z'}],
                ARRAY_2: [null, true, false, 1, 'x', [-1, 2.1, 30, 4.5e+123], {'y': 'z'}],

                ARRAY_21: [' ', '\'\'', '""', '``', '\\\\', '()', '[]', '{}'],
                ARRAY_22: [' ', '\'\'', '""', '``', '\\\\', '()', '[]', '{}'],

                ARRAY_102: [null, true, 4.5e+123, ' x y '],
                ARRAY_101: [null, true, 4.5e+123, ' x y '],
                ARRAY_103: [null, true, 4.5e+123, ' x y '],

                ARRAY_201: [null, true, 4.5e+123, ' x y '],
                ARRAY_202: [null, true, 4.5e+123, ' x y '],
                ARRAY_203: [null, true, 4.5e+123, ' x y '],

                ARRAY_301: [],
                ARRAY_302: [],
                ARRAY_303: [],
                ARRAY_304: [],

                // No conversion
                ARRAY_1001: '["a","b","c"',
                ARRAY_1002: '"a","b","c"]',
                ARRAY_1003: '"a","b"],"c"',
                ARRAY_1004: '["a","b","c",]',
                ARRAY_1005: '["a","b","c"]any',
                ARRAY_1006: '[\'a\',\'b\',\'c\']',
                ARRAY_1007: '[a,b,c]',
                ARRAY_1021: '[undefined]',
                ARRAY_1022: '[UNDEFINED]',
                ARRAY_1023: '[True]',
                ARRAY_1024: '[TRUE]',
                ARRAY_1025: '[False]',
                ARRAY_1026: '[FALSE]',
                ARRAY_1027: '[no]',
                ARRAY_1028: '[No]',
                ARRAY_1029: '[No]',
                ARRAY_1030: '[NaN]',
                ARRAY_1031: '[Infinity]',
                ARRAY_1032: '[+Infinity]',
                ARRAY_1033: '[-Infinity]',
                ARRAY_2001: 'ARRAY:',
                ARRAY_2002: 'ARR:',
                ARRAY_2003: ' ARRAY: ',
                ARRAY_2004: ' ARR: ',
                ARRAY_2005: ' array : ',
                ARRAY_2006: ' arr : ',
            }
            const expectedForEnv = {
                ARRAY_1: '[null,true,false,1,"x",[-1,2.1,30,4.5e+123],{"y":"z"}]',
                ARRAY_2: '[null,true,false,1,"x",[-1,2.1,30,4.5e+123],{"y":"z"}]',

                ARRAY_21: '[" ","\'\'","\\"\\"","``","\\\\\\\\","()","[]","{}"]',
                ARRAY_22: '[" ","\'\'","\\"\\"","``","\\\\\\\\","()","[]","{}"]',

                ARRAY_101: '[null,true,4.5e+123," x y "]',
                ARRAY_102: '[null,true,4.5e+123," x y "]',
                ARRAY_103: '[null,true,4.5e+123," x y "]',

                ARRAY_201: '[null,true,4.5e+123," x y "]',
                ARRAY_202: '[null,true,4.5e+123," x y "]',
                ARRAY_203: '[null,true,4.5e+123," x y "]',

                ARRAY_301: '[]',
                ARRAY_302: '[]',
                ARRAY_303: '[]',
                ARRAY_304: '[]',

                // No conversion
                ARRAY_1001: '["a","b","c"',
                ARRAY_1002: '"a","b","c"]',
                ARRAY_1003: '"a","b"],"c"',
                ARRAY_1004: '["a","b","c",]',
                ARRAY_1005: '["a","b","c"]any',
                ARRAY_1006: '[\'a\',\'b\',\'c\']',
                ARRAY_1007: '[a,b,c]',
                ARRAY_1021: '[undefined]',
                ARRAY_1022: '[UNDEFINED]',
                ARRAY_1023: '[True]',
                ARRAY_1024: '[TRUE]',
                ARRAY_1025: '[False]',
                ARRAY_1026: '[FALSE]',
                ARRAY_1027: '[no]',
                ARRAY_1028: '[No]',
                ARRAY_1029: '[No]',
                ARRAY_1030: '[NaN]',
                ARRAY_1031: '[Infinity]',
                ARRAY_1032: '[+Infinity]',
                ARRAY_1033: '[-Infinity]',
                ARRAY_2001: 'ARRAY:',
                ARRAY_2002: 'ARR:',
                ARRAY_2003: ' ARRAY: ',
                ARRAY_2004: ' ARR: ',
                ARRAY_2005: ' array : ',
                ARRAY_2006: ' arr : ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:object', function (done) {
            // input
            const input = 'method.object'

            // output
            const expected = {
                OBJECT_1: {'a': null, 'b': true, 'c': false, 'd': 1, 'e': 'x', 'f': [-1, 2.1, 30, 4.5e+123], 'g': {'y': 'z'}},
                OBJECT_2: {'a': null, 'b': true, 'c': false, 'd': 1, 'e': 'x', 'f': [-1, 2.1, 30, 4.5e+123], 'g': {'y': 'z'}},

                OBJECT_21: {'_': ' ', 'a': '\'\'', 'b': '""', 'c': '``', 'd': '\\\\', 'e': '()', 'f': '[]', 'g': '{}'},
                OBJECT_22: {'_': ' ', 'a': '\'\'', 'b': '""', 'c': '``', 'd': '\\\\', 'e': '()', 'f': '[]', 'g': '{}'},

                OBJECT_101: {'a': null, 'b': true, 'c': 4.5e+123, 'd': ' x y '},
                OBJECT_102: {'a': null, 'b': true, 'c': 4.5e+123, 'd': ' x y '},
                OBJECT_103: {'a': null, 'b': true, 'c': 4.5e+123, 'd': ' x y '},

                OBJECT_201: {'a': null, 'b': true, 'c': 4.5e+123, 'd': ' x y '},
                OBJECT_202: {'a': null, 'b': true, 'c': 4.5e+123, 'd': ' x y '},
                OBJECT_203: {'a': null, 'b': true, 'c': 4.5e+123, 'd': ' x y '},

                OBJECT_301: {},
                OBJECT_302: {},
                OBJECT_303: {},
                OBJECT_304: {},

                // No conversion
                OBJECT_1001: '{"a":1,"b":2,"c":3',
                OBJECT_1002: '"a":1,"b":2,"c":3}',
                OBJECT_1003: '"a":1,"b":2},"c":3',
                OBJECT_1004: '{"a":1,"b":2,"c":3,}',
                OBJECT_1005: '{"a":1,"b":2,"c":3}any',
                OBJECT_1006: '{\'a\':1,\'b\':2,\'c\':3}',
                OBJECT_1007: '{a:1,b:2,c:3}',
                OBJECT_1008: '{"a":a,"b":b,"c":c}',
                OBJECT_1021: '{"a":undefined}',
                OBJECT_1022: '{"a":UNDEFINED}',
                OBJECT_1023: '{"a":True}',
                OBJECT_1024: '{"a":TRUE}',
                OBJECT_1025: '{"a":False}',
                OBJECT_1026: '{"a":FALSE}',
                OBJECT_1027: '{"a":no}',
                OBJECT_1028: '{"a":No}',
                OBJECT_1029: '{"a":No}',
                OBJECT_1030: '{"a":NaN}',
                OBJECT_1031: '{"a":Infinity}',
                OBJECT_1032: '{"a":+Infinity}',
                OBJECT_1033: '{"a":-Infinity}',
                OBJECT_2001: 'OBJECT:',
                OBJECT_2002: 'OBJ:',
                OBJECT_2003: ' OBJECT: ',
                OBJECT_2004: ' OBJ: ',
                OBJECT_2005: ' object : ',
                OBJECT_2006: ' obj : ',
            }
            const expectedForEnv = {
                OBJECT_1: '{"a":null,"b":true,"c":false,"d":1,"e":"x","f":[-1,2.1,30,4.5e+123],"g":{"y":"z"}}',
                OBJECT_2: '{"a":null,"b":true,"c":false,"d":1,"e":"x","f":[-1,2.1,30,4.5e+123],"g":{"y":"z"}}',

                OBJECT_21: '{"_":" ","a":"\'\'","b":"\\"\\"","c":"``","d":"\\\\\\\\","e":"()","f":"[]","g":"{}"}',
                OBJECT_22: '{"_":" ","a":"\'\'","b":"\\"\\"","c":"``","d":"\\\\\\\\","e":"()","f":"[]","g":"{}"}',

                OBJECT_101: '{"a":null,"b":true,"c":4.5e+123,"d":" x y "}',
                OBJECT_102: '{"a":null,"b":true,"c":4.5e+123,"d":" x y "}',
                OBJECT_103: '{"a":null,"b":true,"c":4.5e+123,"d":" x y "}',

                OBJECT_201: '{"a":null,"b":true,"c":4.5e+123,"d":" x y "}',
                OBJECT_202: '{"a":null,"b":true,"c":4.5e+123,"d":" x y "}',
                OBJECT_203: '{"a":null,"b":true,"c":4.5e+123,"d":" x y "}',

                OBJECT_301: '{}',
                OBJECT_302: '{}',
                OBJECT_303: '{}',
                OBJECT_304: '{}',

                // No conversion
                OBJECT_1001: '{"a":1,"b":2,"c":3',
                OBJECT_1002: '"a":1,"b":2,"c":3}',
                OBJECT_1003: '"a":1,"b":2},"c":3',
                OBJECT_1004: '{"a":1,"b":2,"c":3,}',
                OBJECT_1005: '{"a":1,"b":2,"c":3}any',
                OBJECT_1006: '{\'a\':1,\'b\':2,\'c\':3}',
                OBJECT_1007: '{a:1,b:2,c:3}',
                OBJECT_1008: '{"a":a,"b":b,"c":c}',
                OBJECT_1021: '{"a":undefined}',
                OBJECT_1022: '{"a":UNDEFINED}',
                OBJECT_1023: '{"a":True}',
                OBJECT_1024: '{"a":TRUE}',
                OBJECT_1025: '{"a":False}',
                OBJECT_1026: '{"a":FALSE}',
                OBJECT_1027: '{"a":no}',
                OBJECT_1028: '{"a":No}',
                OBJECT_1029: '{"a":No}',
                OBJECT_1030: '{"a":NaN}',
                OBJECT_1031: '{"a":Infinity}',
                OBJECT_1032: '{"a":+Infinity}',
                OBJECT_1033: '{"a":-Infinity}',
                OBJECT_2001: 'OBJECT:',
                OBJECT_2002: 'OBJ:',
                OBJECT_2003: ' OBJECT: ',
                OBJECT_2004: ' OBJ: ',
                OBJECT_2005: ' object : ',
                OBJECT_2006: ' obj : ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:custom:not-set(default)', function (done) {
            // input
            const input = 'method.custom'

            // output
            const expected = {
                OK: 'custom:yes',
                NOT_OK: 'custom:no',
            }
            const expectedForEnv = {
                OK: 'custom:yes',
                NOT_OK: 'custom:no',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:custom:set', function (done) {
            // input
            const input = 'method.custom'
            const inputConfig = {
                methods: {
                    custom(value) {
                        return value === 'yes' ? 1 : 0
                    },
                },
            }

            // output
            const expected = {
                OK: 1,
                NOT_OK: 0,
            }
            const expectedForEnv = {
                OK: '1',
                NOT_OK: '0',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method:custom:set:call-existing-method', function (done) {
            // input
            const input = 'method.custom'
            const inputConfig = {
                methods: {
                    custom(value, name, config) {
                        return this.boolean(value, name, config)
                    },
                },
            }

            // output
            const expected = {
                OK: true,
                NOT_OK: false,
            }
            const expectedForEnv = {
                OK: 'true',
                NOT_OK: 'false',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method-aliases:not-set(default)', function (done) {
            // input
            const input = 'method-aliases'

            // output
            const expected = {
                OK: true,
                OK_ALIAS: true,
                OK_ALIAS_MORE: 'bl:yes',
            }
            const expectedForEnv = {
                OK: 'true',
                OK_ALIAS: 'true',
                OK_ALIAS_MORE: 'bl:yes',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('method-aliases:set', function (done) {
            // input
            const input = 'method-aliases'
            const inputConfig = {
                methodAliases: {
                    bl: 'boolean',
                },
            }

            // output
            const expected = {
                OK: true,
                OK_ALIAS: true,
                OK_ALIAS_MORE: true,
            }
            const expectedForEnv = {
                OK: 'true',
                OK_ALIAS: 'true',
                OK_ALIAS_MORE: 'true',
            }

            const dotenvConfig = Object.assign({}, useEnv(input), inputConfig)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })
    })

    describe('convert:integration:dotenv-expand', function () {
        function useEnv(env) {
            return dotenvExpand.expand({
                parsed: env,
            })
        }

        it('expand', function (done) {
            // input
            const input = {
                DEBUG_LEVEL: '0',
                DEBUG: 'bool:$DEBUG_LEVEL',

                EXPONENTIAL: '2',
                NUMBER: '1e$EXPONENTIAL',
            }

            // output
            const expected = {
                DEBUG_LEVEL: 0,
                DEBUG: false,

                EXPONENTIAL: 2,
                NUMBER: 100,
            }
            const expectedForEnv = {
                DEBUG_LEVEL: '0',
                DEBUG: 'false',

                EXPONENTIAL: '2',
                NUMBER: '100',
            }

            const dotenvExpandConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvExpandConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })
    })

    describe('convert:integration:dotenv&dotenv-expand', function () {
        const dotEnvPath = './.env'
        after(() => {
            fs.rmSync(dotEnvPath)
        })

        function useEnv(envBasename) {
            fs.copyFileSync(`./tests/inputs/${envBasename}.env`, dotEnvPath)
            return dotenvExpand.expand(dotenv.config())
        }

        it('expand', function (done) {
            // input
            const input = 'expand'

            // output
            const expected = {
                DEBUG_LEVEL: 0,
                DEBUG: false,

                EXPONENTIAL: 2,
                NUMBER: 100,
            }
            const expectedForEnv = {
                DEBUG_LEVEL: '0',
                DEBUG: 'false',

                EXPONENTIAL: '2',
                NUMBER: '100',
            }

            const dotenvExpandConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvExpandConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })
    })

    describe('convert:integration:dotenv-flow&dotenv-expand', function () {
        const dotEnvPath = './.env'
        after(() => {
            fs.rmSync(dotEnvPath)
            fs.rmSync(`${dotEnvPath}.local`)
            fs.rmSync(`${dotEnvPath}.test`)
            fs.rmSync(`${dotEnvPath}.test.local`)
        })

        function useEnv(level = 1) {
            fs.copyFileSync(`./tests/inputs/flow.env`, dotEnvPath)
            level > 1 && fs.copyFileSync(`./tests/inputs/flow.env.local`, `${dotEnvPath}.local`)
            level > 2 && fs.copyFileSync(`./tests/inputs/flow.env.test`, `${dotEnvPath}.test`)
            level > 3 && fs.copyFileSync(`./tests/inputs/flow.env.test.local`, `${dotEnvPath}.test.local`)
            return dotenvExpand.expand(dotenvFlow.config())
        }

        it('flow:env', function (done) {
            // input
            const input = 1

            // output
            const expected = {
                SIGNAL: 0,
                OK: false,
            }
            const expectedForEnv = {
                SIGNAL: '0',
                OK: 'false',
            }

            const dotenvExpandConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvExpandConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('flow:env.local', function (done) {
            // input
            const input = 2

            // output
            const expected = {
                SIGNAL: 1,
                OK: true,
            }
            const expectedForEnv = {
                SIGNAL: '1',
                OK: 'true',
            }

            const dotenvExpandConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvExpandConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('flow:env.test', function (done) {
            // input
            process.env.NODE_ENV = 'test'
            const input = 3

            // output
            const expected = {
                SIGNAL: 1n,
                OK: true,
            }
            const expectedForEnv = {
                SIGNAL: '1n',
                OK: 'true',
            }

            const dotenvExpandConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvExpandConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })

        it('flow:env.test.local', function (done) {
            // input
            process.env.NODE_ENV = 'test'
            const input = 4

            // output
            const expected = {
                SIGNAL: null,
                OK: null,
            }
            const expectedForEnv = {
                SIGNAL: 'null',
                OK: 'null',
            }

            const dotenvExpandConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvExpandConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)

            done()
        })
    })
})
