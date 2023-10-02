import chai from 'chai'
import dotenv from 'dotenv'
import dotenvConversion from '../src'
import mocha from 'mocha'
import fs from 'fs'
import envUtils from '../src/env-utils'

const afterEach = mocha.afterEach
const describe = mocha.describe
const it = mocha.it
const expect = chai.expect
chai.should()

const originEnv = {...process.env}
afterEach(() => {
    process.env = {...originEnv}
})

describe('dotenv-conversion', function () {
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
                'json',
            ]
            const expectedMethodAliases = {
                bool: 'boolean',
                num: 'number',
                big: 'bigint',
                str: 'string',
                arr: 'array',
                obj: 'json',
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
                parsed: {},
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
                    auto(value) {
                        return 'auto'
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
            const expectedParsed = inputConfig.parsed
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
                'json',

                'basic',
            ]
            const expectedMethodAutoReturn = 'auto'
            const expectedMethodBasicReturn = 'basic'
            const expectedMethodAliases = {
                bool: 'boolean',
                num: 'number',
                big: 'bigint',
                str: 'string',
                arr: 'array',
                obj: 'json',

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
            dotenvConversionConfig.methods.auto('value').should.equal(expectedMethodAutoReturn)
            dotenvConversionConfig.methods.basic('value').should.equal(expectedMethodBasicReturn)

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

        it('config:ignoreProcessEnv:no', function (done) {
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

        it('config:ignoreProcessEnv:yes', function (done) {
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

        it('config:prevents:not-set', function (done) {
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

        it('config:prevents:set', function (done) {
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

        it('config:specs:not-set(default)', function (done) {
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

        it('config:specs:set:use-exist-method', function (done) {
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

        it('config:specs:set:use-exist-method-alias', function (done) {
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

        it('config:specs:set:use-none-exist-method(fallback->string)', function (done) {
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

        it('config:specs:set:use-custom-method', function (done) {
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

        it('config:specs:set:use-anything-else(fallback->string)', function (done) {
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

        it('auto:null', function (done) {
            // input
            const input = {
                NULL_1: 'null',
                NULL_2: 'Null',
                NULL_3: 'NULL',

                // No conversion
                NULL_1001: 'NuLL',
                NULL_1002: ' null ',
            }

            // output
            const expected = {
                NULL_1: null,
                NULL_2: null,
                NULL_3: null,

                // No conversion
                NULL_1001: 'NuLL',
                NULL_1002: ' null ',
            }
            const expectedForEnv = {
                NULL_1: 'null',
                NULL_2: 'null',
                NULL_3: 'null',

                // No conversion
                NULL_1001: 'NuLL',
                NULL_1002: ' null ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('auto:undefined', function (done) {
            // input
            const input = {
                UNDEFINED_1: 'undefined',
                UNDEFINED_2: 'UNDEFINED',

                // No conversion
                UNDEFINED_1001: 'Undefined',
                UNDEFINED_1002: ' undefined ',
            }

            // output
            const expected = {
                UNDEFINED_1: undefined,
                UNDEFINED_2: undefined,

                // No conversion
                UNDEFINED_1001: 'Undefined',
                UNDEFINED_1002: ' undefined ',
            }
            const expectedForEnv = {
                UNDEFINED_1: 'undefined',
                UNDEFINED_2: 'undefined',

                // No conversion
                UNDEFINED_1001: 'Undefined',
                UNDEFINED_1002: ' undefined ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('auto:boolean', function (done) {
            // input
            const input = {
                BOOLEAN_1: 'true',
                BOOLEAN_2: 'True',
                BOOLEAN_3: 'TRUE',
                BOOLEAN_4: 'yes',
                BOOLEAN_5: 'Yes',
                BOOLEAN_6: 'YES',

                BOOLEAN_11: 'false',
                BOOLEAN_12: 'False',
                BOOLEAN_13: 'FALSE',
                BOOLEAN_14: 'no',
                BOOLEAN_15: 'No',
                BOOLEAN_16: 'NO',

                // No conversion
                BOOLEAN_1001: 'TruE',
                BOOLEAN_1002: 'YeS',
                BOOLEAN_1003: 'FalsE',
                BOOLEAN_1004: 'nO',
                BOOLEAN_1005: ' true ',
            }

            // output
            const expected = {
                BOOLEAN_1: true,
                BOOLEAN_2: true,
                BOOLEAN_3: true,
                BOOLEAN_4: true,
                BOOLEAN_5: true,
                BOOLEAN_6: true,

                BOOLEAN_11: false,
                BOOLEAN_12: false,
                BOOLEAN_13: false,
                BOOLEAN_14: false,
                BOOLEAN_15: false,
                BOOLEAN_16: false,

                // No conversion
                BOOLEAN_1001: 'TruE',
                BOOLEAN_1002: 'YeS',
                BOOLEAN_1003: 'FalsE',
                BOOLEAN_1004: 'nO',
                BOOLEAN_1005: ' true ',
            }
            const expectedForEnv = {
                BOOLEAN_1: 'true',
                BOOLEAN_2: 'true',
                BOOLEAN_3: 'true',
                BOOLEAN_4: 'true',
                BOOLEAN_5: 'true',
                BOOLEAN_6: 'true',

                BOOLEAN_11: 'false',
                BOOLEAN_12: 'false',
                BOOLEAN_13: 'false',
                BOOLEAN_14: 'false',
                BOOLEAN_15: 'false',
                BOOLEAN_16: 'false',

                // No conversion
                BOOLEAN_1001: 'TruE',
                BOOLEAN_1002: 'YeS',
                BOOLEAN_1003: 'FalsE',
                BOOLEAN_1004: 'nO',
                BOOLEAN_1005: ' true ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('auto:number', function (done) {
            // input
            const input = {
                NUMBER_1: 'NaN',
                NUMBER_2: 'Infinity',
                NUMBER_3: '+Infinity',
                NUMBER_4: '-Infinity',

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

                // No conversion
                NUMBER_1001: 'NAN',
                NUMBER_1002: 'INFINITY',
                NUMBER_1003: '+INFINITY',
                NUMBER_1004: '-INFINITY',

                NUMBER_1011: ' 123 ',
                NUMBER_1012: '123e',
                NUMBER_1013: '123any',
                NUMBER_1014: '123 any',
                NUMBER_1015: 'any123',
                NUMBER_1016: 'any 123',
            }

            // output
            const expected = {
                NUMBER_1: NaN,
                NUMBER_2: Infinity,
                NUMBER_3: +Infinity,
                NUMBER_4: -Infinity,

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

                // No conversion
                NUMBER_1001: 'NAN',
                NUMBER_1002: 'INFINITY',
                NUMBER_1003: '+INFINITY',
                NUMBER_1004: '-INFINITY',

                NUMBER_1011: ' 123 ',
                NUMBER_1012: '123e',
                NUMBER_1013: '123any',
                NUMBER_1014: '123 any',
                NUMBER_1015: 'any123',
                NUMBER_1016: 'any 123',
            }
            const expectedForEnv = {
                NUMBER_1: 'NaN',
                NUMBER_2: 'Infinity',
                NUMBER_3: 'Infinity',
                NUMBER_4: '-Infinity',

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

                // No conversion
                NUMBER_1001: 'NAN',
                NUMBER_1002: 'INFINITY',
                NUMBER_1003: '+INFINITY',
                NUMBER_1004: '-INFINITY',

                NUMBER_1011: ' 123 ',
                NUMBER_1012: '123e',
                NUMBER_1013: '123any',
                NUMBER_1014: '123 any',
                NUMBER_1015: 'any123',
                NUMBER_1016: 'any 123',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('auto:bigint', function (done) {
            // input
            const input = {
                BIGINT_1: '5n',
                BIGINT_2: '+5n',
                BIGINT_3: '-5n',

                // No conversion
                BIGINT_1001: '5N',
                BIGINT_1002: ' 5n ',
                BIGINT_1003: '5nany',
                BIGINT_1004: '5n any',
                BIGINT_1005: 'any5n',
                BIGINT_1006: 'any 5n',
            }

            // output
            const expected = {
                BIGINT_1: 5n,
                BIGINT_2: 5n,
                BIGINT_3: -5n,

                // No conversion
                BIGINT_1001: '5N',
                BIGINT_1002: ' 5n ',
                BIGINT_1003: '5nany',
                BIGINT_1004: '5n any',
                BIGINT_1005: 'any5n',
                BIGINT_1006: 'any 5n',
            }
            const expectedForEnv = {
                BIGINT_1: '5n',
                BIGINT_2: '5n',
                BIGINT_3: '-5n',

                // No conversion
                BIGINT_1001: '5N',
                BIGINT_1002: ' 5n ',
                BIGINT_1003: '5nany',
                BIGINT_1004: '5n any',
                BIGINT_1005: 'any5n',
                BIGINT_1006: 'any 5n',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('auto:symbol', function (done) {
            // input
            const input = {
                SYMBOL_1: 'Symbol(any)',
                SYMBOL_2: 'Symbol((any)',
                SYMBOL_3: 'Symbol(any))',
                SYMBOL_4: 'Symbol((any))',
                SYMBOL_5: 'Symbol((an)y)',
                SYMBOL_6: 'Symbol(a(ny))',
                SYMBOL_7: 'Symbol(a(n)y)',
                SYMBOL_8: 'Symbol()',

                // No conversion
                SYMBOL_1001: 'SYMBOL(a)',
                SYMBOL_1002: ' Symbol(a) ',
                SYMBOL_1003: 'Symbol(a)any',
                SYMBOL_1004: 'Symbol(a) any',
                SYMBOL_1005: 'anySymbol(a)',
                SYMBOL_1006: 'any Symbol(a)',
            }

            // output
            const expected = {
                SYMBOL_1: Symbol('any'),
                SYMBOL_2: Symbol('(any'),
                SYMBOL_3: Symbol('any)'),
                SYMBOL_4: Symbol('(any)'),
                SYMBOL_5: Symbol('(an)y'),
                SYMBOL_6: Symbol('a(ny)'),
                SYMBOL_7: Symbol('a(n)y'),
                SYMBOL_8: Symbol(),

                // No conversion
                SYMBOL_1001: 'SYMBOL(a)',
                SYMBOL_1002: ' Symbol(a) ',
                SYMBOL_1003: 'Symbol(a)any',
                SYMBOL_1004: 'Symbol(a) any',
                SYMBOL_1005: 'anySymbol(a)',
                SYMBOL_1006: 'any Symbol(a)',
            }
            const expectedForEnv = {
                SYMBOL_1: 'Symbol(any)',
                SYMBOL_2: 'Symbol((any)',
                SYMBOL_3: 'Symbol(any))',
                SYMBOL_4: 'Symbol((any))',
                SYMBOL_5: 'Symbol((an)y)',
                SYMBOL_6: 'Symbol(a(ny))',
                SYMBOL_7: 'Symbol(a(n)y)',
                SYMBOL_8: 'Symbol()',

                // No conversion
                SYMBOL_1001: 'SYMBOL(a)',
                SYMBOL_1002: ' Symbol(a) ',
                SYMBOL_1003: 'Symbol(a)any',
                SYMBOL_1004: 'Symbol(a) any',
                SYMBOL_1005: 'anySymbol(a)',
                SYMBOL_1006: 'any Symbol(a)',
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
            dotenvConversionConfig.parsed.SYMBOL_7.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_7.toString().should.equal(expected.SYMBOL_7.toString())
            dotenvConversionConfig.parsed.SYMBOL_8.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_8.toString().should.equal(expected.SYMBOL_8.toString())
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('auto:array', function (done) {
            // input
            const input = {
                ARRAY_1: '[1,2,3]',
                ARRAY_2: '["a","b","c"]',
                ARRAY_3: '["a\'b\'c","a\\"b\\"c"]',

                ARRAY_11: '[-1, 2.1, 3e1, 4e123]',
                ARRAY_12: '["a", "b", "c"]',
                ARRAY_13: '["a\'b\'c", "a\\"b\\"c", "a b c", "[\\"a\\", \\"b\\", \\"c\\"]"]',

                ARRAY_21: '[null,true,false,1,"a",{"b":"c"}]',

                // No conversion
                ARRAY_1001: '1,2,3',
                ARRAY_1002: '[1,2,3',
                ARRAY_1003: '1,2,3]',
                ARRAY_1004: '[1,2],3',
                ARRAY_1005: '1,[2,3]',
                ARRAY_1006: '1,[2],3',
                ARRAY_1007: ' [1,2,3] ',
                ARRAY_1008: '[\'a\',\'b\',\'c\']',
                ARRAY_1011: '[undefined]',
                ARRAY_1012: '[UNDEFINED]',
                ARRAY_1013: '[True]',
                ARRAY_1014: '[TRUE]',
                ARRAY_1015: '[False]',
                ARRAY_1016: '[FALSE]',
                ARRAY_1017: '[no]',
                ARRAY_1018: '[No]',
                ARRAY_1019: '[No]',
                ARRAY_1020: '[NaN]',
                ARRAY_1021: '[Infinity]',
                ARRAY_1022: '[+Infinity]',
                ARRAY_1023: '[-Infinity]',
            }

            // output
            const expected = {
                ARRAY_1: [1, 2, 3],
                ARRAY_2: ['a', 'b', 'c'],
                ARRAY_3: ['a\'b\'c', 'a"b"c'],

                ARRAY_11: [-1, 2.1, 30, 4e123],
                ARRAY_12: ['a', 'b', 'c'],
                ARRAY_13: ['a\'b\'c', 'a"b"c', 'a b c', '["a", "b", "c"]'],

                ARRAY_21: [null, true, false, 1, 'a', {b: 'c'}],

                // No conversion
                ARRAY_1001: '1,2,3',
                ARRAY_1002: '[1,2,3',
                ARRAY_1003: '1,2,3]',
                ARRAY_1004: '[1,2],3',
                ARRAY_1005: '1,[2,3]',
                ARRAY_1006: '1,[2],3',
                ARRAY_1007: ' [1,2,3] ',
                ARRAY_1008: '[\'a\',\'b\',\'c\']',
                ARRAY_1011: '[undefined]',
                ARRAY_1012: '[UNDEFINED]',
                ARRAY_1013: '[True]',
                ARRAY_1014: '[TRUE]',
                ARRAY_1015: '[False]',
                ARRAY_1016: '[FALSE]',
                ARRAY_1017: '[no]',
                ARRAY_1018: '[No]',
                ARRAY_1019: '[No]',
                ARRAY_1020: '[NaN]',
                ARRAY_1021: '[Infinity]',
                ARRAY_1022: '[+Infinity]',
                ARRAY_1023: '[-Infinity]',
            }
            const expectedForEnv = {
                ARRAY_1: '[1,2,3]',
                ARRAY_2: '["a","b","c"]',
                ARRAY_3: '["a\'b\'c","a\\"b\\"c"]',

                ARRAY_11: '[-1,2.1,30,4e+123]',
                ARRAY_12: '["a","b","c"]',
                ARRAY_13: '["a\'b\'c","a\\"b\\"c","a b c","[\\"a\\", \\"b\\", \\"c\\"]"]',

                ARRAY_21: '[null,true,false,1,"a",{"b":"c"}]',

                // No conversion
                ARRAY_1001: '1,2,3',
                ARRAY_1002: '[1,2,3',
                ARRAY_1003: '1,2,3]',
                ARRAY_1004: '[1,2],3',
                ARRAY_1005: '1,[2,3]',
                ARRAY_1006: '1,[2],3',
                ARRAY_1007: ' [1,2,3] ',
                ARRAY_1008: '[\'a\',\'b\',\'c\']',
                ARRAY_1011: '[undefined]',
                ARRAY_1012: '[UNDEFINED]',
                ARRAY_1013: '[True]',
                ARRAY_1014: '[TRUE]',
                ARRAY_1015: '[False]',
                ARRAY_1016: '[FALSE]',
                ARRAY_1017: '[no]',
                ARRAY_1018: '[No]',
                ARRAY_1019: '[No]',
                ARRAY_1020: '[NaN]',
                ARRAY_1021: '[Infinity]',
                ARRAY_1022: '[+Infinity]',
                ARRAY_1023: '[-Infinity]',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('auto:json', function (done) {
            // input
            const input = {
                JSON_1: '{"a":1,"b":"2","c":true,"d":false,"e":null,"f":[3,"g",null,true,false,{"h":"i"}],"j":{"k":"l"}}',
                JSON_2: '{"1":"a\'b\'c","2":"a\\"b\\"c"}',

                JSON_11: '{"a": -1, "b": 2.1, "c": 3e1, "d": 4e123}',
                JSON_12: '{"1": "a\'b\'c", "2": "a\\"b\\"c", "3": "a b c", "4": "[\\"a\\", \\"b\\", \\"c\\"]"}',

                // No conversion
                JSON_1001: 'a:1,b:2,c:3',
                JSON_1002: '{a:1,b:2,c:3}',
                JSON_1003: '"a":1,"b":2,"c":3',
                JSON_1004: '{"a":1,"b":2,"c":3},',
                JSON_1005: '{"a":1,"b":2,"c":3',
                JSON_1006: '"a":1,"b":2,"c":3}',
                JSON_1007: '{"a":1,"b":2},"c":3',
                JSON_1008: '"a":1,{"b":2,"c":3}',
                JSON_1009: '"a":1,{"b":2},"c":3}',
                JSON_1010: ' {"a":1,"b":2,"c":3} ',
                JSON_1011: '{\'a\':1,\'b\':2,\'c\':3}',
                JSON_1021: '{"a":undefined}',
                JSON_1022: '{"a":UNDEFINED}',
                JSON_1023: '{"a":True}',
                JSON_1024: '{"a":TRUE}',
                JSON_1025: '{"a":False}',
                JSON_1026: '{"a":FALSE}',
                JSON_1027: '{"a":no}',
                JSON_1028: '{"a":No}',
                JSON_1029: '{"a":No}',
                JSON_1030: '{"a":NaN}',
                JSON_1031: '{"a":Infinity}',
                JSON_1032: '{"a":+Infinity}',
                JSON_1033: '{"a":-Infinity}',
            }

            // output
            const expected = {
                JSON_1: {
                    'a': 1,
                    'b': '2',
                    'c': true,
                    'd': false,
                    'e': null,
                    'f': [3, 'g', null, true, false, {'h': 'i'}],
                    'j': {
                        'k': 'l',
                    },
                },
                JSON_2: {
                    '1': 'a\'b\'c',
                    '2': 'a"b"c',
                },

                JSON_11: {
                    'a': -1,
                    'b': 2.1,
                    'c': 3e1,
                    'd': 4e123,
                },
                JSON_12: {
                    '1': 'a\'b\'c',
                    '2': 'a"b"c',
                    '3': 'a b c',
                    '4': '["a", "b", "c"]',
                },

                // No conversion
                JSON_1001: 'a:1,b:2,c:3',
                JSON_1002: '{a:1,b:2,c:3}',
                JSON_1003: '"a":1,"b":2,"c":3',
                JSON_1004: '{"a":1,"b":2,"c":3},',
                JSON_1005: '{"a":1,"b":2,"c":3',
                JSON_1006: '"a":1,"b":2,"c":3}',
                JSON_1007: '{"a":1,"b":2},"c":3',
                JSON_1008: '"a":1,{"b":2,"c":3}',
                JSON_1009: '"a":1,{"b":2},"c":3}',
                JSON_1010: ' {"a":1,"b":2,"c":3} ',
                JSON_1011: '{\'a\':1,\'b\':2,\'c\':3}',
                JSON_1021: '{"a":undefined}',
                JSON_1022: '{"a":UNDEFINED}',
                JSON_1023: '{"a":True}',
                JSON_1024: '{"a":TRUE}',
                JSON_1025: '{"a":False}',
                JSON_1026: '{"a":FALSE}',
                JSON_1027: '{"a":no}',
                JSON_1028: '{"a":No}',
                JSON_1029: '{"a":No}',
                JSON_1030: '{"a":NaN}',
                JSON_1031: '{"a":Infinity}',
                JSON_1032: '{"a":+Infinity}',
                JSON_1033: '{"a":-Infinity}',
            }
            const expectedForEnv = {
                JSON_1: '{"a":1,"b":"2","c":true,"d":false,"e":null,"f":[3,"g",null,true,false,{"h":"i"}],"j":{"k":"l"}}',
                JSON_2: '{"1":"a\'b\'c","2":"a\\"b\\"c"}',

                JSON_11: '{"a":-1,"b":2.1,"c":30,"d":4e+123}',
                JSON_12: '{"1":"a\'b\'c","2":"a\\"b\\"c","3":"a b c","4":"[\\"a\\", \\"b\\", \\"c\\"]"}',

                // No conversion
                JSON_1001: 'a:1,b:2,c:3',
                JSON_1002: '{a:1,b:2,c:3}',
                JSON_1003: '"a":1,"b":2,"c":3',
                JSON_1004: '{"a":1,"b":2,"c":3},',
                JSON_1005: '{"a":1,"b":2,"c":3',
                JSON_1006: '"a":1,"b":2,"c":3}',
                JSON_1007: '{"a":1,"b":2},"c":3',
                JSON_1008: '"a":1,{"b":2,"c":3}',
                JSON_1009: '"a":1,{"b":2},"c":3}',
                JSON_1010: ' {"a":1,"b":2,"c":3} ',
                JSON_1011: '{\'a\':1,\'b\':2,\'c\':3}',
                JSON_1021: '{"a":undefined}',
                JSON_1022: '{"a":UNDEFINED}',
                JSON_1023: '{"a":True}',
                JSON_1024: '{"a":TRUE}',
                JSON_1025: '{"a":False}',
                JSON_1026: '{"a":FALSE}',
                JSON_1027: '{"a":no}',
                JSON_1028: '{"a":No}',
                JSON_1029: '{"a":No}',
                JSON_1030: '{"a":NaN}',
                JSON_1031: '{"a":Infinity}',
                JSON_1032: '{"a":+Infinity}',
                JSON_1033: '{"a":-Infinity}',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('boolean', function (done) {
            // input
            const input = {
                BOOLEAN_1: 'boolean:',
                BOOLEAN_2: 'boolean: ',
                BOOLEAN_3: 'boolean:false',
                BOOLEAN_4: 'boolean:False',
                BOOLEAN_5: 'boolean:FALSE',
                BOOLEAN_6: 'boolean:no',
                BOOLEAN_7: 'boolean:No',
                BOOLEAN_8: 'boolean:NO',
                BOOLEAN_9: 'boolean:null',
                BOOLEAN_10: 'boolean:Null',
                BOOLEAN_11: 'boolean:NULL',
                BOOLEAN_12: 'boolean:undefined',
                BOOLEAN_13: 'boolean:UNDEFINED',
                BOOLEAN_14: 'boolean:NaN',
                BOOLEAN_15: 'boolean:not',
                BOOLEAN_16: 'boolean:Not',
                BOOLEAN_17: 'boolean:NOT',
                BOOLEAN_18: 'boolean:none',
                BOOLEAN_19: 'boolean:None',
                BOOLEAN_20: 'boolean:NONE',
                BOOLEAN_21: 'boolean: false ',

                BOOLEAN_101: 'boolean:0',
                BOOLEAN_102: 'boolean:+0',
                BOOLEAN_103: 'boolean:-0',
                BOOLEAN_104: 'boolean:00',
                BOOLEAN_105: 'boolean:+00',
                BOOLEAN_106: 'boolean:-00',
                BOOLEAN_107: 'boolean:.00',
                BOOLEAN_108: 'boolean:+.00',
                BOOLEAN_109: 'boolean:-.00',
                BOOLEAN_110: 'boolean:0.00',
                BOOLEAN_111: 'boolean:+0.00',
                BOOLEAN_112: 'boolean:-0.00',
                BOOLEAN_113: 'boolean: 0.00 ',
                BOOLEAN_114: 'boolean: +0.00 ',
                BOOLEAN_115: 'boolean: -0.00 ',

                BOOLEAN_201: 'boolean:0n',
                BOOLEAN_202: 'boolean:+0n',
                BOOLEAN_203: 'boolean:-0n',
                BOOLEAN_204: 'boolean:00n',
                BOOLEAN_205: 'boolean:+00n',
                BOOLEAN_206: 'boolean:-00n',
                BOOLEAN_207: 'boolean: 00n ',
                BOOLEAN_208: 'boolean: +00n ',
                BOOLEAN_209: 'boolean: -00n ',

                BOOLEAN_301: 'boolean:any',
                BOOLEAN_302: 'boolean: any ',

                BOOLEAN_401: 'bool:false',
                BOOLEAN_402: 'bool:any',
                BOOLEAN_403: 'bool: any ',

                // No conversion
                BOOLEAN_1001: ' boolean:any ',
                BOOLEAN_1002: ' bool:any ',
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
                BOOLEAN_19: false,
                BOOLEAN_20: false,
                BOOLEAN_21: false,

                BOOLEAN_101: false,
                BOOLEAN_102: false,
                BOOLEAN_103: false,
                BOOLEAN_104: false,
                BOOLEAN_105: false,
                BOOLEAN_106: false,
                BOOLEAN_107: false,
                BOOLEAN_108: false,
                BOOLEAN_109: false,
                BOOLEAN_110: false,
                BOOLEAN_111: false,
                BOOLEAN_112: false,
                BOOLEAN_113: false,
                BOOLEAN_114: false,
                BOOLEAN_115: false,

                BOOLEAN_201: false,
                BOOLEAN_202: false,
                BOOLEAN_203: false,
                BOOLEAN_204: false,
                BOOLEAN_205: false,
                BOOLEAN_206: false,
                BOOLEAN_207: false,
                BOOLEAN_208: false,
                BOOLEAN_209: false,

                BOOLEAN_301: true,
                BOOLEAN_302: true,

                BOOLEAN_401: false,
                BOOLEAN_402: true,
                BOOLEAN_403: true,

                // No conversion
                BOOLEAN_1001: ' boolean:any ',
                BOOLEAN_1002: ' bool:any ',
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
                BOOLEAN_19: 'false',
                BOOLEAN_20: 'false',
                BOOLEAN_21: 'false',

                BOOLEAN_101: 'false',
                BOOLEAN_102: 'false',
                BOOLEAN_103: 'false',
                BOOLEAN_104: 'false',
                BOOLEAN_105: 'false',
                BOOLEAN_106: 'false',
                BOOLEAN_107: 'false',
                BOOLEAN_108: 'false',
                BOOLEAN_109: 'false',
                BOOLEAN_110: 'false',
                BOOLEAN_111: 'false',
                BOOLEAN_112: 'false',
                BOOLEAN_113: 'false',
                BOOLEAN_114: 'false',
                BOOLEAN_115: 'false',

                BOOLEAN_201: 'false',
                BOOLEAN_202: 'false',
                BOOLEAN_203: 'false',
                BOOLEAN_204: 'false',
                BOOLEAN_205: 'false',
                BOOLEAN_206: 'false',
                BOOLEAN_207: 'false',
                BOOLEAN_208: 'false',
                BOOLEAN_209: 'false',

                BOOLEAN_301: 'true',
                BOOLEAN_302: 'true',

                BOOLEAN_401: 'false',
                BOOLEAN_402: 'true',
                BOOLEAN_403: 'true',

                // No conversion
                BOOLEAN_1001: ' boolean:any ',
                BOOLEAN_1002: ' bool:any ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('number', function (done) {
            // input
            const input = {
                NUMBER_1: 'number:',
                NUMBER_2: 'number: ',
                NUMBER_3: 'number:true',
                NUMBER_4: 'number:True',
                NUMBER_5: 'number:TRUE',
                NUMBER_6: 'number:yes',
                NUMBER_7: 'number:Yes',
                NUMBER_8: 'number:YES',
                NUMBER_9: 'number:false',
                NUMBER_10: 'number:False',
                NUMBER_11: 'number:FALSE',
                NUMBER_12: 'number:no',
                NUMBER_13: 'number:No',
                NUMBER_14: 'number:NO',
                NUMBER_15: 'number:null',
                NUMBER_16: 'number:Null',
                NUMBER_17: 'number:NULL',
                NUMBER_18: 'number:undefined',
                NUMBER_19: 'number:UNDEFINED',
                NUMBER_20: 'number:not',
                NUMBER_21: 'number:Not',
                NUMBER_22: 'number:NOT',
                NUMBER_23: 'number:none',
                NUMBER_24: 'number:None',
                NUMBER_25: 'number:NONE',
                NUMBER_26: 'number:NaN',
                NUMBER_27: 'number:Infinity',
                NUMBER_28: 'number:+Infinity',
                NUMBER_29: 'number:-Infinity',

                NUMBER_31: 'number:4.5e1any',
                NUMBER_32: 'number:+4.5e+1any',
                NUMBER_33: 'number:-4.5e-1any',
                NUMBER_34: 'number:4.5e123any',
                NUMBER_35: 'number:+4.5e+123any',
                NUMBER_36: 'number:-4.5e-123any',

                NUMBER_41: 'number:any',
                NUMBER_42: 'number: any ',
                NUMBER_43: 'number: 4.5e1 ',
                NUMBER_44: 'number: 4.5e1any ',

                NUMBER_51: 'num:4.5e1',
                NUMBER_52: 'num:4.5e1any',
                NUMBER_53: 'num:any',
                NUMBER_54: 'num: any ',
                NUMBER_55: 'num: 4.5e1 ',
                NUMBER_56: 'num: 4.5e1any ',

                // No conversion
                NUMBER_1001: ' number:any ',
                NUMBER_1002: ' num:any ',
            }

            // output
            const expected = {
                NUMBER_1: 0,
                NUMBER_2: 0,
                NUMBER_3: 1,
                NUMBER_4: 1,
                NUMBER_5: 1,
                NUMBER_6: 1,
                NUMBER_7: 1,
                NUMBER_8: 1,
                NUMBER_9: 0,
                NUMBER_10: 0,
                NUMBER_11: 0,
                NUMBER_12: 0,
                NUMBER_13: 0,
                NUMBER_14: 0,
                NUMBER_15: 0,
                NUMBER_16: 0,
                NUMBER_17: 0,
                NUMBER_18: 0,
                NUMBER_19: 0,
                NUMBER_20: 0,
                NUMBER_21: 0,
                NUMBER_22: 0,
                NUMBER_23: 0,
                NUMBER_24: 0,
                NUMBER_25: 0,
                NUMBER_26: 0,
                NUMBER_27: Infinity,
                NUMBER_28: Infinity,
                NUMBER_29: -Infinity,

                NUMBER_31: 45,
                NUMBER_32: 45,
                NUMBER_33: -0.45,
                NUMBER_34: 4.5e+123,
                NUMBER_35: 4.5e+123,
                NUMBER_36: -4.5e-123,

                NUMBER_41: 0,
                NUMBER_42: 0,
                NUMBER_43: 45,
                NUMBER_44: 45,

                NUMBER_51: 45,
                NUMBER_52: 45,
                NUMBER_53: 0,
                NUMBER_54: 0,
                NUMBER_55: 45,
                NUMBER_56: 45,

                // No conversion
                NUMBER_1001: ' number:any ',
                NUMBER_1002: ' num:any ',
            }
            const expectedForEnv = {
                NUMBER_1: '0',
                NUMBER_2: '0',
                NUMBER_3: '1',
                NUMBER_4: '1',
                NUMBER_5: '1',
                NUMBER_6: '1',
                NUMBER_7: '1',
                NUMBER_8: '1',
                NUMBER_9: '0',
                NUMBER_10: '0',
                NUMBER_11: '0',
                NUMBER_12: '0',
                NUMBER_13: '0',
                NUMBER_14: '0',
                NUMBER_15: '0',
                NUMBER_16: '0',
                NUMBER_17: '0',
                NUMBER_18: '0',
                NUMBER_19: '0',
                NUMBER_20: '0',
                NUMBER_21: '0',
                NUMBER_22: '0',
                NUMBER_23: '0',
                NUMBER_24: '0',
                NUMBER_25: '0',
                NUMBER_26: '0',
                NUMBER_27: 'Infinity',
                NUMBER_28: 'Infinity',
                NUMBER_29: '-Infinity',

                NUMBER_41: '0',
                NUMBER_42: '0',
                NUMBER_43: '45',
                NUMBER_44: '45',

                NUMBER_51: '45',
                NUMBER_52: '45',
                NUMBER_53: '0',
                NUMBER_54: '0',
                NUMBER_55: '45',
                NUMBER_56: '45',

                // No conversion
                NUMBER_1001: ' number:any ',
                NUMBER_1002: ' num:any ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('bigint', function (done) {
            // input
            const input = {
                BIGINT_1: 'bigint:',
                BIGINT_2: 'bigint: ',
                BIGINT_3: 'bigint:true',
                BIGINT_4: 'bigint:True',
                BIGINT_5: 'bigint:TRUE',
                BIGINT_6: 'bigint:yes',
                BIGINT_7: 'bigint:Yes',
                BIGINT_8: 'bigint:YES',
                BIGINT_9: 'bigint:false',
                BIGINT_10: 'bigint:False',
                BIGINT_11: 'bigint:FALSE',
                BIGINT_12: 'bigint:no',
                BIGINT_13: 'bigint:No',
                BIGINT_14: 'bigint:NO',
                BIGINT_15: 'bigint:null',
                BIGINT_16: 'bigint:Null',
                BIGINT_17: 'bigint:NULL',
                BIGINT_18: 'bigint:undefined',
                BIGINT_19: 'bigint:UNDEFINED',
                BIGINT_20: 'bigint:not',
                BIGINT_21: 'bigint:Not',
                BIGINT_22: 'bigint:NOT',
                BIGINT_23: 'bigint:none',
                BIGINT_24: 'bigint:None',
                BIGINT_25: 'bigint:NONE',

                BIGINT_31: 'bigint:123',
                BIGINT_32: 'bigint:+123',
                BIGINT_33: 'bigint:-123',
                BIGINT_34: 'bigint:123n',

                BIGINT_41: 'bigint:123any',
                BIGINT_42: 'bigint:+123any',
                BIGINT_43: 'bigint:-123any',
                BIGINT_44: 'bigint:123.4any',

                BIGINT_51: 'bigint:any',
                BIGINT_52: 'bigint: any ',
                BIGINT_53: 'bigint: 123.4any ',

                BIGINT_61: 'big:123',
                BIGINT_62: 'big:123n',
                BIGINT_63: 'big:123.4any',
                BIGINT_64: 'big:any',
                BIGINT_65: 'big: any ',
                BIGINT_66: 'big: 123.4any ',

                // No conversion
                BIGINT_1001: ' bigint:any ',
                BIGINT_1002: ' big:any ',
            }

            // output
            const expected = {
                BIGINT_1: 0n,
                BIGINT_2: 0n,
                BIGINT_3: 1n,
                BIGINT_4: 1n,
                BIGINT_5: 1n,
                BIGINT_6: 1n,
                BIGINT_7: 1n,
                BIGINT_8: 1n,
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
                BIGINT_25: 0n,

                BIGINT_31: 123n,
                BIGINT_32: 123n,
                BIGINT_33: -123n,
                BIGINT_34: 123n,

                BIGINT_41: 123n,
                BIGINT_42: 123n,
                BIGINT_43: -123n,
                BIGINT_44: 123n,

                BIGINT_51: 0n,
                BIGINT_52: 0n,
                BIGINT_53: 123n,

                BIGINT_61: 123n,
                BIGINT_62: 123n,
                BIGINT_63: 123n,
                BIGINT_64: 0n,
                BIGINT_65: 0n,
                BIGINT_66: 123n,

                // No conversion
                BIGINT_1001: ' bigint:any ',
                BIGINT_1002: ' big:any ',
            }
            const expectedForEnv = {
                BIGINT_1: '0n',
                BIGINT_2: '0n',
                BIGINT_3: '1n',
                BIGINT_4: '1n',
                BIGINT_5: '1n',
                BIGINT_6: '1n',
                BIGINT_7: '1n',
                BIGINT_8: '1n',
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
                BIGINT_25: '0n',

                BIGINT_31: '123n',
                BIGINT_32: '123n',
                BIGINT_33: '-123n',
                BIGINT_34: '123n',

                BIGINT_41: '123n',
                BIGINT_42: '123n',
                BIGINT_43: '-123n',
                BIGINT_44: '123n',

                BIGINT_51: '0n',
                BIGINT_52: '0n',
                BIGINT_53: '123n',

                BIGINT_61: '123n',
                BIGINT_62: '123n',
                BIGINT_63: '123n',
                BIGINT_64: '0n',
                BIGINT_65: '0n',
                BIGINT_66: '123n',

                // No conversion
                BIGINT_1001: ' bigint:any ',
                BIGINT_1002: ' big:any ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('symbol', function (done) {
            // input
            const input = {
                SYMBOL_1: 'symbol:',
                SYMBOL_2: 'symbol: ',
                SYMBOL_3: 'symbol:any',
                SYMBOL_4: 'symbol:Symbol(any)',

                SYMBOL_11: 'symbol: any ',
                SYMBOL_12: 'symbol: Symbol(any) ',

                // No conversion
                SYMBOL_1001: ' symbol:any ',
            }

            // output
            const expected = {
                SYMBOL_1: Symbol(),
                SYMBOL_2: Symbol(),
                SYMBOL_3: Symbol('any'),
                SYMBOL_4: Symbol('any'),

                SYMBOL_11: Symbol('any'),
                SYMBOL_12: Symbol('any'),

                // No conversion
                SYMBOL_1001: ' symbol:any ',
            }
            const expectedForEnv = {
                SYMBOL_1: 'Symbol()',
                SYMBOL_2: 'Symbol()',
                SYMBOL_3: 'Symbol(any)',
                SYMBOL_4: 'Symbol(any)',

                SYMBOL_11: 'Symbol(any)',
                SYMBOL_12: 'Symbol(any)',

                // No conversion
                SYMBOL_1001: ' symbol:any ',
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
            dotenvConversionConfig.parsed.SYMBOL_11.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_11.toString().should.equal(expected.SYMBOL_11.toString())
            dotenvConversionConfig.parsed.SYMBOL_12.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_12.toString().should.equal(expected.SYMBOL_12.toString())
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('array', function (done) {
            // input
            const input = {
                ARRAY_1: 'array:',
                ARRAY_2: 'array: ',
                ARRAY_3: 'array:1,2,3',
                ARRAY_4: 'array:"a","b","c"',
                ARRAY_5: 'array:null,true,false,1,"a"',

                ARRAY_11: 'array:[]',
                ARRAY_12: 'array:[ ]',
                ARRAY_13: 'array:[1,2,3]',
                ARRAY_14: 'array:["a","b","c"]',
                ARRAY_15: 'array:[null,true,false,1,"a"]',

                ARRAY_21: 'array: 1, 2, 3 ',
                ARRAY_22: 'arr:1,2,3',
                ARRAY_23: 'arr: 1, 2, 3 ',

                // No conversion
                ARRAY_1001: 'array:a,b,c',
                ARRAY_1002: ' array:any ',
            }

            // output
            const expected = {
                ARRAY_1: [],
                ARRAY_2: [],
                ARRAY_3: [1, 2, 3],
                ARRAY_4: ['a', 'b', 'c'],
                ARRAY_5: [null, true, false, 1, 'a'],

                ARRAY_11: [],
                ARRAY_12: [],
                ARRAY_13: [1, 2, 3],
                ARRAY_14: ['a', 'b', 'c'],
                ARRAY_15: [null, true, false, 1, 'a'],

                ARRAY_21: [1, 2, 3],
                ARRAY_22: [1, 2, 3],
                ARRAY_23: [1, 2, 3],

                // No conversion
                ARRAY_1001: 'a,b,c',
                ARRAY_1002: ' array:any ',
            }
            const expectedForEnv = {
                ARRAY_1: '[]',
                ARRAY_2: '[]',
                ARRAY_3: '[1,2,3]',
                ARRAY_4: '["a","b","c"]',
                ARRAY_5: '[null,true,false,1,"a"]',

                ARRAY_11: '[]',
                ARRAY_12: '[]',
                ARRAY_13: '[1,2,3]',
                ARRAY_14: '["a","b","c"]',
                ARRAY_15: '[null,true,false,1,"a"]',

                ARRAY_21: '[1,2,3]',
                ARRAY_22: '[1,2,3]',
                ARRAY_23: '[1,2,3]',

                // No conversion
                ARRAY_1001: 'a,b,c',
                ARRAY_1002: ' array:any ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('json', function (done) {
            // input
            const input = {
                JSON_1: 'json:',
                JSON_2: 'json: ',
                JSON_3: 'json:"a":null,"b":true,"c":false,"d":1,"e":"f"',

                JSON_11: 'json:{}',
                JSON_12: 'json:{ }',
                JSON_13: 'json:{"a":null,"b":true,"c":false,"d":1,"e":"f"}',

                JSON_21: 'json: "a":1, "b":2, "c":3',
                JSON_22: 'obj:"a":1,"b":2,"c":3',
                JSON_23: 'obj: "a":1, "b":2, "c":3',

                // No conversion
                JSON_1001: 'json:a:1,b:2,c:3',
                JSON_1002: ' array:any ',
            }

            // output
            const expected = {
                JSON_1: {},
                JSON_2: {},
                JSON_3: {'a': null, 'b': true, 'c': false, 'd': 1, 'e': 'f'},

                JSON_11: {},
                JSON_12: {},
                JSON_13: {'a': null, 'b': true, 'c': false, 'd': 1, 'e': 'f'},

                JSON_21: {'a': 1, 'b': 2, 'c': 3},
                JSON_22: {'a': 1, 'b': 2, 'c': 3},
                JSON_23: {'a': 1, 'b': 2, 'c': 3},

                // No conversion
                JSON_1001: 'a:1,b:2,c:3',
                JSON_1002: ' array:any ',
            }
            const expectedForEnv = {
                JSON_1: '{}',
                JSON_2: '{}',
                JSON_3: '{"a":null,"b":true,"c":false,"d":1,"e":"f"}',

                JSON_11: '{}',
                JSON_12: '{}',
                JSON_13: '{"a":null,"b":true,"c":false,"d":1,"e":"f"}',

                JSON_21: '{"a":1,"b":2,"c":3}',
                JSON_22: '{"a":1,"b":2,"c":3}',
                JSON_23: '{"a":1,"b":2,"c":3}',

                // No conversion
                JSON_1001: 'a:1,b:2,c:3',
                JSON_1002: ' array:any ',
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
                    custom(value) {
                        return this.boolean(value)
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

        it('config:method-aliases:not-set(default)', function (done) {
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

        it('config:method-aliases:set', function (done) {
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
        function useEnv(envBasename) {
            fs.copyFileSync(`./test/inputs/convert/${envBasename}.env`, './.env')
            return dotenv.config()
        }

        it('config:ignoreProcessEnv:no(default)', function (done) {
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

        it('config:ignoreProcessEnv:yes', function (done) {
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

        it('config:prevents:not-set(default)', function (done) {
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

        it('config:prevents:set', function (done) {
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

        it('config:specs:not-set(default)', function (done) {
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

        it('config:specs:set:use-exist-method', function (done) {
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

        it('config:specs:set:use-exist-method-alias', function (done) {
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

        it('config:specs:set:use-none-exist-method(fallback->string)', function (done) {
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

        it('config:specs:set:use-custom-method', function (done) {
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

        it('config:specs:set:use-anything-else(fallback->string)', function (done) {
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

        it('auto:null', function (done) {
            // input
            const input = 'auto.null'

            // output
            const expected = {
                NULL_1: null,
                NULL_2: null,
                NULL_3: null,

                // No conversion
                NULL_1001: 'NuLL',
                NULL_1002: ' null ',
            }
            const expectedForEnv = {
                NULL_1: 'null',
                NULL_2: 'null',
                NULL_3: 'null',

                // No conversion
                NULL_1001: 'NuLL',
                NULL_1002: ' null ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('auto:undefined', function (done) {
            // input
            const input = 'auto.undefined'

            // output
            const expected = {
                UNDEFINED_1: undefined,
                UNDEFINED_2: undefined,

                // No conversion
                UNDEFINED_1001: 'Undefined',
                UNDEFINED_1002: ' undefined ',
            }
            const expectedForEnv = {
                UNDEFINED_1: 'undefined',
                UNDEFINED_2: 'undefined',

                // No conversion
                UNDEFINED_1001: 'Undefined',
                UNDEFINED_1002: ' undefined ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('auto:boolean', function (done) {
            // input
            const input = 'auto.boolean'

            // output
            const expected = {
                BOOLEAN_1: true,
                BOOLEAN_2: true,
                BOOLEAN_3: true,
                BOOLEAN_4: true,
                BOOLEAN_5: true,
                BOOLEAN_6: true,

                BOOLEAN_11: false,
                BOOLEAN_12: false,
                BOOLEAN_13: false,
                BOOLEAN_14: false,
                BOOLEAN_15: false,
                BOOLEAN_16: false,

                // No conversion
                BOOLEAN_1001: 'TruE',
                BOOLEAN_1002: 'YeS',
                BOOLEAN_1003: 'FalsE',
                BOOLEAN_1004: 'nO',
                BOOLEAN_1005: ' true ',
            }
            const expectedForEnv = {
                BOOLEAN_1: 'true',
                BOOLEAN_2: 'true',
                BOOLEAN_3: 'true',
                BOOLEAN_4: 'true',
                BOOLEAN_5: 'true',
                BOOLEAN_6: 'true',

                BOOLEAN_11: 'false',
                BOOLEAN_12: 'false',
                BOOLEAN_13: 'false',
                BOOLEAN_14: 'false',
                BOOLEAN_15: 'false',
                BOOLEAN_16: 'false',

                // No conversion
                BOOLEAN_1001: 'TruE',
                BOOLEAN_1002: 'YeS',
                BOOLEAN_1003: 'FalsE',
                BOOLEAN_1004: 'nO',
                BOOLEAN_1005: ' true ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('auto:number', function (done) {
            // input
            const input = 'auto.number'

            // output
            const expected = {
                NUMBER_1: NaN,
                NUMBER_2: Infinity,
                NUMBER_3: +Infinity,
                NUMBER_4: -Infinity,

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

                // No conversion
                NUMBER_1001: 'NAN',
                NUMBER_1002: 'INFINITY',
                NUMBER_1003: '+INFINITY',
                NUMBER_1004: '-INFINITY',

                NUMBER_1011: ' 123 ',
                NUMBER_1012: '123e',
                NUMBER_1013: '123any',
                NUMBER_1014: '123 any',
                NUMBER_1015: 'any123',
                NUMBER_1016: 'any 123',
            }
            const expectedForEnv = {
                NUMBER_1: 'NaN',
                NUMBER_2: 'Infinity',
                NUMBER_3: 'Infinity',
                NUMBER_4: '-Infinity',

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

                // No conversion
                NUMBER_1001: 'NAN',
                NUMBER_1002: 'INFINITY',
                NUMBER_1003: '+INFINITY',
                NUMBER_1004: '-INFINITY',

                NUMBER_1011: ' 123 ',
                NUMBER_1012: '123e',
                NUMBER_1013: '123any',
                NUMBER_1014: '123 any',
                NUMBER_1015: 'any123',
                NUMBER_1016: 'any 123',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('auto:bigint', function (done) {
            // input
            const input = 'auto.bigint'

            // output
            const expected = {
                BIGINT_1: 5n,
                BIGINT_2: 5n,
                BIGINT_3: -5n,

                // No conversion
                BIGINT_1001: '5N',
                BIGINT_1002: ' 5n ',
                BIGINT_1003: '5nany',
                BIGINT_1004: '5n any',
                BIGINT_1005: 'any5n',
                BIGINT_1006: 'any 5n',
            }
            const expectedForEnv = {
                BIGINT_1: '5n',
                BIGINT_2: '5n',
                BIGINT_3: '-5n',

                // No conversion
                BIGINT_1001: '5N',
                BIGINT_1002: ' 5n ',
                BIGINT_1003: '5nany',
                BIGINT_1004: '5n any',
                BIGINT_1005: 'any5n',
                BIGINT_1006: 'any 5n',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('auto:symbol', function (done) {
            // input
            const input = 'auto.symbol'

            // output
            const expected = {
                SYMBOL_1: Symbol('any'),
                SYMBOL_2: Symbol('(any'),
                SYMBOL_3: Symbol('any)'),
                SYMBOL_4: Symbol('(any)'),
                SYMBOL_5: Symbol('(an)y'),
                SYMBOL_6: Symbol('a(ny)'),
                SYMBOL_7: Symbol('a(n)y'),
                SYMBOL_8: Symbol(),

                // No conversion
                SYMBOL_1001: 'SYMBOL(a)',
                SYMBOL_1002: ' Symbol(a) ',
                SYMBOL_1003: 'Symbol(a)any',
                SYMBOL_1004: 'Symbol(a) any',
                SYMBOL_1005: 'anySymbol(a)',
                SYMBOL_1006: 'any Symbol(a)',
            }
            const expectedForEnv = {
                SYMBOL_1: 'Symbol(any)',
                SYMBOL_2: 'Symbol((any)',
                SYMBOL_3: 'Symbol(any))',
                SYMBOL_4: 'Symbol((any))',
                SYMBOL_5: 'Symbol((an)y)',
                SYMBOL_6: 'Symbol(a(ny))',
                SYMBOL_7: 'Symbol(a(n)y)',
                SYMBOL_8: 'Symbol()',

                // No conversion
                SYMBOL_1001: 'SYMBOL(a)',
                SYMBOL_1002: ' Symbol(a) ',
                SYMBOL_1003: 'Symbol(a)any',
                SYMBOL_1004: 'Symbol(a) any',
                SYMBOL_1005: 'anySymbol(a)',
                SYMBOL_1006: 'any Symbol(a)',
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
            dotenvConversionConfig.parsed.SYMBOL_7.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_7.toString().should.equal(expected.SYMBOL_7.toString())
            dotenvConversionConfig.parsed.SYMBOL_8.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_8.toString().should.equal(expected.SYMBOL_8.toString())
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('auto:array', function (done) {
            // input
            const input = 'auto.array'

            // output
            const expected = {
                ARRAY_1: [1, 2, 3],
                ARRAY_2: ['a', 'b', 'c'],
                ARRAY_3: ['a\'b\'c', 'a"b"c'],

                ARRAY_11: [-1, 2.1, 30, 4e123],
                ARRAY_12: ['a', 'b', 'c'],
                ARRAY_13: ['a\'b\'c', 'a"b"c', 'a b c', '["a", "b", "c"]'],

                ARRAY_21: [null, true, false, 1, 'a', {b: 'c'}],

                // No conversion
                ARRAY_1001: '1,2,3',
                ARRAY_1002: '[1,2,3',
                ARRAY_1003: '1,2,3]',
                ARRAY_1004: '[1,2],3',
                ARRAY_1005: '1,[2,3]',
                ARRAY_1006: '1,[2],3',
                ARRAY_1007: ' [1,2,3] ',
                ARRAY_1008: '[\'a\',\'b\',\'c\']',
                ARRAY_1011: '[undefined]',
                ARRAY_1012: '[UNDEFINED]',
                ARRAY_1013: '[True]',
                ARRAY_1014: '[TRUE]',
                ARRAY_1015: '[False]',
                ARRAY_1016: '[FALSE]',
                ARRAY_1017: '[no]',
                ARRAY_1018: '[No]',
                ARRAY_1019: '[No]',
                ARRAY_1020: '[NaN]',
                ARRAY_1021: '[Infinity]',
                ARRAY_1022: '[+Infinity]',
                ARRAY_1023: '[-Infinity]',
            }
            const expectedForEnv = {
                ARRAY_1: '[1,2,3]',
                ARRAY_2: '["a","b","c"]',
                ARRAY_3: '["a\'b\'c","a\\"b\\"c"]',

                ARRAY_11: '[-1,2.1,30,4e+123]',
                ARRAY_12: '["a","b","c"]',
                ARRAY_13: '["a\'b\'c","a\\"b\\"c","a b c","[\\"a\\", \\"b\\", \\"c\\"]"]',

                ARRAY_21: '[null,true,false,1,"a",{"b":"c"}]',

                // No conversion
                ARRAY_1001: '1,2,3',
                ARRAY_1002: '[1,2,3',
                ARRAY_1003: '1,2,3]',
                ARRAY_1004: '[1,2],3',
                ARRAY_1005: '1,[2,3]',
                ARRAY_1006: '1,[2],3',
                ARRAY_1007: ' [1,2,3] ',
                ARRAY_1008: '[\'a\',\'b\',\'c\']',
                ARRAY_1011: '[undefined]',
                ARRAY_1012: '[UNDEFINED]',
                ARRAY_1013: '[True]',
                ARRAY_1014: '[TRUE]',
                ARRAY_1015: '[False]',
                ARRAY_1016: '[FALSE]',
                ARRAY_1017: '[no]',
                ARRAY_1018: '[No]',
                ARRAY_1019: '[No]',
                ARRAY_1020: '[NaN]',
                ARRAY_1021: '[Infinity]',
                ARRAY_1022: '[+Infinity]',
                ARRAY_1023: '[-Infinity]',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('auto:json', function (done) {
            // input
            const input = 'auto.json'

            // output
            const expected = {
                JSON_1: {
                    'a': 1,
                    'b': '2',
                    'c': true,
                    'd': false,
                    'e': null,
                    'f': [3, 'g', null, true, false, {'h': 'i'}],
                    'j': {
                        'k': 'l',
                    },
                },
                JSON_2: {
                    '1': 'a\'b\'c',
                    '2': 'a"b"c',
                },

                JSON_11: {
                    'a': -1,
                    'b': 2.1,
                    'c': 3e1,
                    'd': 4e123,
                },
                JSON_12: {
                    '1': 'a\'b\'c',
                    '2': 'a"b"c',
                    '3': 'a b c',
                    '4': '["a", "b", "c"]',
                },

                // No conversion
                JSON_1001: 'a:1,b:2,c:3',
                JSON_1002: '{a:1,b:2,c:3}',
                JSON_1003: '"a":1,"b":2,"c":3',
                JSON_1004: '{"a":1,"b":2,"c":3},',
                JSON_1005: '{"a":1,"b":2,"c":3',
                JSON_1006: '"a":1,"b":2,"c":3}',
                JSON_1007: '{"a":1,"b":2},"c":3',
                JSON_1008: '"a":1,{"b":2,"c":3}',
                JSON_1009: '"a":1,{"b":2},"c":3}',
                JSON_1010: ' {"a":1,"b":2,"c":3} ',
                JSON_1011: '{\'a\':1,\'b\':2,\'c\':3}',
                JSON_1021: '{"a":undefined}',
                JSON_1022: '{"a":UNDEFINED}',
                JSON_1023: '{"a":True}',
                JSON_1024: '{"a":TRUE}',
                JSON_1025: '{"a":False}',
                JSON_1026: '{"a":FALSE}',
                JSON_1027: '{"a":no}',
                JSON_1028: '{"a":No}',
                JSON_1029: '{"a":No}',
                JSON_1030: '{"a":NaN}',
                JSON_1031: '{"a":Infinity}',
                JSON_1032: '{"a":+Infinity}',
                JSON_1033: '{"a":-Infinity}',
            }
            const expectedForEnv = {
                JSON_1: '{"a":1,"b":"2","c":true,"d":false,"e":null,"f":[3,"g",null,true,false,{"h":"i"}],"j":{"k":"l"}}',
                JSON_2: '{"1":"a\'b\'c","2":"a\\"b\\"c"}',

                JSON_11: '{"a":-1,"b":2.1,"c":30,"d":4e+123}',
                JSON_12: '{"1":"a\'b\'c","2":"a\\"b\\"c","3":"a b c","4":"[\\"a\\", \\"b\\", \\"c\\"]"}',

                // No conversion
                JSON_1001: 'a:1,b:2,c:3',
                JSON_1002: '{a:1,b:2,c:3}',
                JSON_1003: '"a":1,"b":2,"c":3',
                JSON_1004: '{"a":1,"b":2,"c":3},',
                JSON_1005: '{"a":1,"b":2,"c":3',
                JSON_1006: '"a":1,"b":2,"c":3}',
                JSON_1007: '{"a":1,"b":2},"c":3',
                JSON_1008: '"a":1,{"b":2,"c":3}',
                JSON_1009: '"a":1,{"b":2},"c":3}',
                JSON_1010: ' {"a":1,"b":2,"c":3} ',
                JSON_1011: '{\'a\':1,\'b\':2,\'c\':3}',
                JSON_1021: '{"a":undefined}',
                JSON_1022: '{"a":UNDEFINED}',
                JSON_1023: '{"a":True}',
                JSON_1024: '{"a":TRUE}',
                JSON_1025: '{"a":False}',
                JSON_1026: '{"a":FALSE}',
                JSON_1027: '{"a":no}',
                JSON_1028: '{"a":No}',
                JSON_1029: '{"a":No}',
                JSON_1030: '{"a":NaN}',
                JSON_1031: '{"a":Infinity}',
                JSON_1032: '{"a":+Infinity}',
                JSON_1033: '{"a":-Infinity}',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('boolean', function (done) {
            // input
            const input = 'boolean'

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
                BOOLEAN_19: false,
                BOOLEAN_20: false,
                BOOLEAN_21: false,

                BOOLEAN_101: false,
                BOOLEAN_102: false,
                BOOLEAN_103: false,
                BOOLEAN_104: false,
                BOOLEAN_105: false,
                BOOLEAN_106: false,
                BOOLEAN_107: false,
                BOOLEAN_108: false,
                BOOLEAN_109: false,
                BOOLEAN_110: false,
                BOOLEAN_111: false,
                BOOLEAN_112: false,
                BOOLEAN_113: false,
                BOOLEAN_114: false,
                BOOLEAN_115: false,

                BOOLEAN_201: false,
                BOOLEAN_202: false,
                BOOLEAN_203: false,
                BOOLEAN_204: false,
                BOOLEAN_205: false,
                BOOLEAN_206: false,
                BOOLEAN_207: false,
                BOOLEAN_208: false,
                BOOLEAN_209: false,

                BOOLEAN_301: true,
                BOOLEAN_302: true,

                BOOLEAN_401: false,
                BOOLEAN_402: true,
                BOOLEAN_403: true,

                // No conversion
                BOOLEAN_1001: ' boolean:any ',
                BOOLEAN_1002: ' bool:any ',
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
                BOOLEAN_19: 'false',
                BOOLEAN_20: 'false',
                BOOLEAN_21: 'false',

                BOOLEAN_101: 'false',
                BOOLEAN_102: 'false',
                BOOLEAN_103: 'false',
                BOOLEAN_104: 'false',
                BOOLEAN_105: 'false',
                BOOLEAN_106: 'false',
                BOOLEAN_107: 'false',
                BOOLEAN_108: 'false',
                BOOLEAN_109: 'false',
                BOOLEAN_110: 'false',
                BOOLEAN_111: 'false',
                BOOLEAN_112: 'false',
                BOOLEAN_113: 'false',
                BOOLEAN_114: 'false',
                BOOLEAN_115: 'false',

                BOOLEAN_201: 'false',
                BOOLEAN_202: 'false',
                BOOLEAN_203: 'false',
                BOOLEAN_204: 'false',
                BOOLEAN_205: 'false',
                BOOLEAN_206: 'false',
                BOOLEAN_207: 'false',
                BOOLEAN_208: 'false',
                BOOLEAN_209: 'false',

                BOOLEAN_301: 'true',
                BOOLEAN_302: 'true',

                BOOLEAN_401: 'false',
                BOOLEAN_402: 'true',
                BOOLEAN_403: 'true',

                // No conversion
                BOOLEAN_1001: ' boolean:any ',
                BOOLEAN_1002: ' bool:any ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('number', function (done) {
            // input
            const input = 'number'

            // output
            const expected = {
                NUMBER_1: 0,
                NUMBER_2: 0,
                NUMBER_3: 1,
                NUMBER_4: 1,
                NUMBER_5: 1,
                NUMBER_6: 1,
                NUMBER_7: 1,
                NUMBER_8: 1,
                NUMBER_9: 0,
                NUMBER_10: 0,
                NUMBER_11: 0,
                NUMBER_12: 0,
                NUMBER_13: 0,
                NUMBER_14: 0,
                NUMBER_15: 0,
                NUMBER_16: 0,
                NUMBER_17: 0,
                NUMBER_18: 0,
                NUMBER_19: 0,
                NUMBER_20: 0,
                NUMBER_21: 0,
                NUMBER_22: 0,
                NUMBER_23: 0,
                NUMBER_24: 0,
                NUMBER_25: 0,
                NUMBER_26: 0,
                NUMBER_27: Infinity,
                NUMBER_28: Infinity,
                NUMBER_29: -Infinity,

                NUMBER_31: 45,
                NUMBER_32: 45,
                NUMBER_33: -0.45,
                NUMBER_34: 4.5e+123,
                NUMBER_35: 4.5e+123,
                NUMBER_36: -4.5e-123,

                NUMBER_41: 0,
                NUMBER_42: 0,
                NUMBER_43: 45,
                NUMBER_44: 45,

                NUMBER_51: 45,
                NUMBER_52: 45,
                NUMBER_53: 0,
                NUMBER_54: 0,
                NUMBER_55: 45,
                NUMBER_56: 45,

                // No conversion
                NUMBER_1001: ' number:any ',
                NUMBER_1002: ' num:any ',
            }
            const expectedForEnv = {
                NUMBER_1: '0',
                NUMBER_2: '0',
                NUMBER_3: '1',
                NUMBER_4: '1',
                NUMBER_5: '1',
                NUMBER_6: '1',
                NUMBER_7: '1',
                NUMBER_8: '1',
                NUMBER_9: '0',
                NUMBER_10: '0',
                NUMBER_11: '0',
                NUMBER_12: '0',
                NUMBER_13: '0',
                NUMBER_14: '0',
                NUMBER_15: '0',
                NUMBER_16: '0',
                NUMBER_17: '0',
                NUMBER_18: '0',
                NUMBER_19: '0',
                NUMBER_20: '0',
                NUMBER_21: '0',
                NUMBER_22: '0',
                NUMBER_23: '0',
                NUMBER_24: '0',
                NUMBER_25: '0',
                NUMBER_26: '0',
                NUMBER_27: 'Infinity',
                NUMBER_28: 'Infinity',
                NUMBER_29: '-Infinity',

                NUMBER_41: '0',
                NUMBER_42: '0',
                NUMBER_43: '45',
                NUMBER_44: '45',

                NUMBER_51: '45',
                NUMBER_52: '45',
                NUMBER_53: '0',
                NUMBER_54: '0',
                NUMBER_55: '45',
                NUMBER_56: '45',

                // No conversion
                NUMBER_1001: ' number:any ',
                NUMBER_1002: ' num:any ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('bigint', function (done) {
            // input
            const input = 'bigint'

            // output
            const expected = {
                BIGINT_1: 0n,
                BIGINT_2: 0n,
                BIGINT_3: 1n,
                BIGINT_4: 1n,
                BIGINT_5: 1n,
                BIGINT_6: 1n,
                BIGINT_7: 1n,
                BIGINT_8: 1n,
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
                BIGINT_25: 0n,

                BIGINT_31: 123n,
                BIGINT_32: 123n,
                BIGINT_33: -123n,
                BIGINT_34: 123n,

                BIGINT_41: 123n,
                BIGINT_42: 123n,
                BIGINT_43: -123n,
                BIGINT_44: 123n,

                BIGINT_51: 0n,
                BIGINT_52: 0n,
                BIGINT_53: 123n,

                BIGINT_61: 123n,
                BIGINT_62: 123n,
                BIGINT_63: 123n,
                BIGINT_64: 0n,
                BIGINT_65: 0n,
                BIGINT_66: 123n,

                // No conversion
                BIGINT_1001: ' bigint:any ',
                BIGINT_1002: ' big:any ',
            }
            const expectedForEnv = {
                BIGINT_1: '0n',
                BIGINT_2: '0n',
                BIGINT_3: '1n',
                BIGINT_4: '1n',
                BIGINT_5: '1n',
                BIGINT_6: '1n',
                BIGINT_7: '1n',
                BIGINT_8: '1n',
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
                BIGINT_25: '0n',

                BIGINT_31: '123n',
                BIGINT_32: '123n',
                BIGINT_33: '-123n',
                BIGINT_34: '123n',

                BIGINT_41: '123n',
                BIGINT_42: '123n',
                BIGINT_43: '-123n',
                BIGINT_44: '123n',

                BIGINT_51: '0n',
                BIGINT_52: '0n',
                BIGINT_53: '123n',

                BIGINT_61: '123n',
                BIGINT_62: '123n',
                BIGINT_63: '123n',
                BIGINT_64: '0n',
                BIGINT_65: '0n',
                BIGINT_66: '123n',

                // No conversion
                BIGINT_1001: ' bigint:any ',
                BIGINT_1002: ' big:any ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('symbol', function (done) {
            // input
            const input = 'symbol'

            // output
            const expected = {
                SYMBOL_1: Symbol(),
                SYMBOL_2: Symbol(),
                SYMBOL_3: Symbol('any'),
                SYMBOL_4: Symbol('any'),

                SYMBOL_11: Symbol('any'),
                SYMBOL_12: Symbol('any'),

                // No conversion
                SYMBOL_1001: ' symbol:any ',
            }
            const expectedForEnv = {
                SYMBOL_1: 'Symbol()',
                SYMBOL_2: 'Symbol()',
                SYMBOL_3: 'Symbol(any)',
                SYMBOL_4: 'Symbol(any)',

                SYMBOL_11: 'Symbol(any)',
                SYMBOL_12: 'Symbol(any)',

                // No conversion
                SYMBOL_1001: ' symbol:any ',
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
            dotenvConversionConfig.parsed.SYMBOL_11.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_11.toString().should.equal(expected.SYMBOL_11.toString())
            dotenvConversionConfig.parsed.SYMBOL_12.should.be.a('symbol')
            dotenvConversionConfig.parsed.SYMBOL_12.toString().should.equal(expected.SYMBOL_12.toString())
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('array', function (done) {
            // input
            const input = 'array'

            // output
            const expected = {
                ARRAY_1: [],
                ARRAY_2: [],
                ARRAY_3: [1, 2, 3],
                ARRAY_4: ['a', 'b', 'c'],
                ARRAY_5: [null, true, false, 1, 'a'],

                ARRAY_11: [],
                ARRAY_12: [],
                ARRAY_13: [1, 2, 3],
                ARRAY_14: ['a', 'b', 'c'],
                ARRAY_15: [null, true, false, 1, 'a'],

                ARRAY_21: [1, 2, 3],
                ARRAY_22: [1, 2, 3],
                ARRAY_23: [1, 2, 3],

                // No conversion
                ARRAY_1001: 'a,b,c',
                ARRAY_1002: ' array:any ',
            }
            const expectedForEnv = {
                ARRAY_1: '[]',
                ARRAY_2: '[]',
                ARRAY_3: '[1,2,3]',
                ARRAY_4: '["a","b","c"]',
                ARRAY_5: '[null,true,false,1,"a"]',

                ARRAY_11: '[]',
                ARRAY_12: '[]',
                ARRAY_13: '[1,2,3]',
                ARRAY_14: '["a","b","c"]',
                ARRAY_15: '[null,true,false,1,"a"]',

                ARRAY_21: '[1,2,3]',
                ARRAY_22: '[1,2,3]',
                ARRAY_23: '[1,2,3]',

                // No conversion
                ARRAY_1001: 'a,b,c',
                ARRAY_1002: ' array:any ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('json', function (done) {
            // input
            const input = 'json'

            // output
            const expected = {
                JSON_1: {},
                JSON_2: {},
                JSON_3: {'a': null, 'b': true, 'c': false, 'd': 1, 'e': 'f'},

                JSON_11: {},
                JSON_12: {},
                JSON_13: {'a': null, 'b': true, 'c': false, 'd': 1, 'e': 'f'},

                JSON_21: {'a': 1, 'b': 2, 'c': 3},
                JSON_22: {'a': 1, 'b': 2, 'c': 3},
                JSON_23: {'a': 1, 'b': 2, 'c': 3},

                // No conversion
                JSON_1001: 'a:1,b:2,c:3',
                JSON_1002: ' array:any ',
            }
            const expectedForEnv = {
                JSON_1: '{}',
                JSON_2: '{}',
                JSON_3: '{"a":null,"b":true,"c":false,"d":1,"e":"f"}',

                JSON_11: '{}',
                JSON_12: '{}',
                JSON_13: '{"a":null,"b":true,"c":false,"d":1,"e":"f"}',

                JSON_21: '{"a":1,"b":2,"c":3}',
                JSON_22: '{"a":1,"b":2,"c":3}',
                JSON_23: '{"a":1,"b":2,"c":3}',

                // No conversion
                JSON_1001: 'a:1,b:2,c:3',
                JSON_1002: ' array:any ',
            }

            const dotenvConfig = useEnv(input)
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.equal(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('method:custom:not-set(default)', function (done) {
            // input
            const input = 'custom'

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
            const input = 'custom'
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
            const input = 'custom'
            const inputConfig = {
                methods: {
                    custom(value) {
                        return this.boolean(value)
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

        it('config:method-aliases:not-set(default)', function (done) {
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

        it('config:method-aliases:set', function (done) {
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

    describe('env-utils:restore', function () {
        function useEnvFromFile(envBasename) {
            fs.copyFileSync(`./test/inputs/env-utils/${envBasename}.env`, './.env')
            return dotenv.config()
        }

        it('restore:from-env-var', function (done) {
            const input = {
                MESSAGE: 'This is a "quote"',
                MESSAGE_JSON: '{"message":"This is a \\"quote\\""}',
            }

            const expectedMessage = 'This is a "quote"'
            const expected = {
                MESSAGE: expectedMessage,
                MESSAGE_JSON: {
                    message: expectedMessage,
                },
            }

            const env = input
            const value = envUtils.restoreValue(env.MESSAGE, false)
            const values = envUtils.restoreValues(env, false)

            value.should.deep.equal(expectedMessage)
            values.should.deep.equal(expected)

            done()
        })

        it('restore:from-env-file', function (done) {
            const input = 'restore'

            const expectedMessage = 'This is a "quote"'
            const expected = {
                MESSAGE: expectedMessage,
                MESSAGE_JSON: {
                    message: expectedMessage,
                },
            }

            const env = useEnvFromFile(input).parsed
            const value = envUtils.restoreValue(env.MESSAGE)
            const values = envUtils.restoreValues(env)

            value.should.deep.equal(expectedMessage)
            values.should.deep.equal(expected)

            done()
        })
    })

    describe('env-utils:flatten', function () {
        it('flatten', function (done) {
            class Quote
            {
                toJSON() {
                    return 'quote'
                }
            }

            const input = {
                QUOTE: new Quote(),
                MESSAGE: 'This is a "quote"',
                MESSAGE_JSON: {
                    message: 'This is a "quote"',
                },
            }

            const expected = {
                QUOTE: 'quote',
                MESSAGE: 'This is a "quote"',
                MESSAGE_JSON: '{"message":"This is a \\"quote\\""}',
            }
            const expectedContent = fs.readFileSync('./test/inputs/env-utils/flatten.env').toString()

            const values = envUtils.flattenValues(input)
            envUtils.flattenTo(input)
            envUtils.flattenTo(input, 'flatten.env')
            const content = fs.readFileSync('.env').toString()
            const contentFlatten = fs.readFileSync('flatten.env').toString()

            values.should.deep.equal(expected)
            content.should.equal(expectedContent)
            contentFlatten.should.equal(expectedContent)

            done()
        })
    })
})
