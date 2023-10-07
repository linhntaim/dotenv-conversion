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
                'object',

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

                BOOLEAN_11: 'false',
                BOOLEAN_12: 'False',
                BOOLEAN_13: 'FALSE',
                BOOLEAN_14: 'no',
                BOOLEAN_15: 'No',
                BOOLEAN_16: 'NO',

                BOOLEAN_101: ' true ',
                BOOLEAN_102: ' false ',

                // No conversion
                BOOLEAN_1001: 'TruE',
                BOOLEAN_1002: 'YeS',
                BOOLEAN_1003: 'FalsE',
                BOOLEAN_1004: 'nO',
                // These values are supported only in boolean method
                BOOLEAN_1011: 'not',
                BOOLEAN_1012: 'Not',
                BOOLEAN_1013: 'NOT',
                BOOLEAN_1014: 'none',
                BOOLEAN_1015: 'None',
                BOOLEAN_1016: 'NONE',
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

                BOOLEAN_101: true,
                BOOLEAN_102: false,

                // No conversion
                BOOLEAN_1001: 'TruE',
                BOOLEAN_1002: 'YeS',
                BOOLEAN_1003: 'FalsE',
                BOOLEAN_1004: 'nO',
                // These values are supported only in boolean method
                BOOLEAN_1011: 'not',
                BOOLEAN_1012: 'Not',
                BOOLEAN_1013: 'NOT',
                BOOLEAN_1014: 'none',
                BOOLEAN_1015: 'None',
                BOOLEAN_1016: 'NONE',
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

                BOOLEAN_101: 'true',
                BOOLEAN_102: 'false',

                // No conversion
                BOOLEAN_1001: 'TruE',
                BOOLEAN_1002: 'YeS',
                BOOLEAN_1003: 'FalsE',
                BOOLEAN_1004: 'nO',
                // These values are supported only in boolean method
                BOOLEAN_1011: 'not',
                BOOLEAN_1012: 'Not',
                BOOLEAN_1013: 'NOT',
                BOOLEAN_1014: 'none',
                BOOLEAN_1015: 'None',
                BOOLEAN_1016: 'NONE',
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
                BIGINT_1: '5n',
                BIGINT_2: '+5n',
                BIGINT_3: '-5n',

                BIGINT_101: ' 5n ',

                // No conversion
                BIGINT_1001: '5N',
                // These values are supported only in bigint method
                BIGINT_1002: '5nany',
            }

            // output
            const expected = {
                BIGINT_1: 5n,
                BIGINT_2: 5n,
                BIGINT_3: -5n,

                BIGINT_101: 5n,

                // No conversion
                BIGINT_1001: '5N',
                // These values are supported only in bigint method
                BIGINT_1002: '5nany',
            }
            const expectedForEnv = {
                BIGINT_1: '5n',
                BIGINT_2: '5n',
                BIGINT_3: '-5n',

                BIGINT_101: '5n',

                // No conversion
                BIGINT_1001: '5N',
                // These values are supported only in bigint method
                BIGINT_1002: '5nany',
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

                NUMBER_31: 'number:4.5e1',
                NUMBER_32: 'number:+4.5e+1',
                NUMBER_33: 'number:-4.5e-1',
                NUMBER_34: 'number:4.5e123',
                NUMBER_35: 'number:+4.5e+123',
                NUMBER_36: 'number:-4.5e-123',

                NUMBER_41: 'number:',
                NUMBER_42: 'number:4.5e+123any',
                NUMBER_43: 'number:any',
                NUMBER_44: ' number: ',
                NUMBER_45: ' number: true ',
                NUMBER_46: ' number: false ',
                NUMBER_47: ' number: 4.5e+123any ',
                NUMBER_48: ' number: any ',

                NUMBER_51: 'num:',
                NUMBER_52: 'num:4.5e+123any',
                NUMBER_53: 'num:any',
                NUMBER_54: ' num: ',
                NUMBER_55: ' num: true ',
                NUMBER_56: ' num: false ',
                NUMBER_57: ' num: 4.5e+123any ',
                NUMBER_58: ' num: any ',

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
                NUMBER_16: 0,
                NUMBER_17: 0,
                NUMBER_18: 0,
                NUMBER_19: 0,
                NUMBER_20: 0,
                NUMBER_21: 0,
                NUMBER_22: 0,
                NUMBER_23: 0,
                NUMBER_24: 0,
                NUMBER_25: Infinity,
                NUMBER_26: Infinity,
                NUMBER_27: -Infinity,

                NUMBER_31: 45,
                NUMBER_32: 45,
                NUMBER_33: -0.45,
                NUMBER_34: 4.5e+123,
                NUMBER_35: 4.5e+123,
                NUMBER_36: -4.5e-123,

                NUMBER_41: 0,
                NUMBER_42: 4.5e+123,
                NUMBER_43: 0,
                NUMBER_44: 0,
                NUMBER_45: 1,
                NUMBER_46: 0,
                NUMBER_47: 4.5e+123,
                NUMBER_48: 0,

                NUMBER_51: 0,
                NUMBER_52: 4.5e+123,
                NUMBER_53: 0,
                NUMBER_54: 0,
                NUMBER_55: 1,
                NUMBER_56: 0,
                NUMBER_57: 4.5e+123,
                NUMBER_58: 0,

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
                NUMBER_16: '0',
                NUMBER_17: '0',
                NUMBER_18: '0',
                NUMBER_19: '0',
                NUMBER_20: '0',
                NUMBER_21: '0',
                NUMBER_22: '0',
                NUMBER_23: '0',
                NUMBER_24: '0',
                NUMBER_25: 'Infinity',
                NUMBER_26: 'Infinity',
                NUMBER_27: '-Infinity',

                NUMBER_31: '45',
                NUMBER_32: '45',
                NUMBER_33: '-0.45',
                NUMBER_34: '4.5e+123',
                NUMBER_35: '4.5e+123',
                NUMBER_36: '-4.5e-123',

                NUMBER_41: '0',
                NUMBER_42: '4.5e+123',
                NUMBER_43: '0',
                NUMBER_44: '0',
                NUMBER_45: '1',
                NUMBER_46: '0',
                NUMBER_47: '4.5e+123',
                NUMBER_48: '0',

                NUMBER_51: '0',
                NUMBER_52: '4.5e+123',
                NUMBER_53: '0',
                NUMBER_54: '0',
                NUMBER_55: '1',
                NUMBER_56: '0',
                NUMBER_57: '4.5e+123',
                NUMBER_58: '0',

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

                BIGINT_31: 'bigint:5',
                BIGINT_32: 'bigint:+5',
                BIGINT_33: 'bigint:-5',
                BIGINT_34: 'bigint:5n',
                BIGINT_35: 'bigint:+5n',
                BIGINT_36: 'bigint:-5n',

                BIGINT_41: 'bigint:',
                BIGINT_42: 'bigint:5any',
                BIGINT_43: 'bigint:.5any',
                BIGINT_44: 'bigint:4.5e+10any',
                BIGINT_45: 'bigint:any',
                BIGINT_46: ' bigint: ',
                BIGINT_47: ' bigint: true ',
                BIGINT_48: ' bigint: false ',
                BIGINT_49: ' bigint: 5any ',
                BIGINT_50: ' bigint: .5any ',
                BIGINT_51: ' bigint: 4.5e+10any ',
                BIGINT_52: ' bigint: any ',

                BIGINT_61: 'bigint:',
                BIGINT_62: 'bigint:5any',
                BIGINT_63: 'bigint:.5any',
                BIGINT_64: 'bigint:4.5e+10any',
                BIGINT_65: 'bigint:any',
                BIGINT_66: ' bigint: ',
                BIGINT_67: ' bigint: true ',
                BIGINT_68: ' bigint: false ',
                BIGINT_69: ' bigint: 5any ',
                BIGINT_70: ' bigint: .5any ',
                BIGINT_71: ' bigint: 4.5e+10any ',
                BIGINT_72: ' bigint: any ',

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
                BIGINT_25: 0n,
                BIGINT_26: 0n,
                BIGINT_27: 0n,

                BIGINT_31: 5n,
                BIGINT_32: 5n,
                BIGINT_33: -5n,
                BIGINT_34: 5n,
                BIGINT_35: 5n,
                BIGINT_36: -5n,

                BIGINT_41: 0n,
                BIGINT_42: 5n,
                BIGINT_43: 0n,
                BIGINT_44: 45000000000n,
                BIGINT_45: 0n,
                BIGINT_46: 0n,
                BIGINT_47: 1n,
                BIGINT_48: 0n,
                BIGINT_49: 5n,
                BIGINT_50: 0n,
                BIGINT_51: 45000000000n,
                BIGINT_52: 0n,

                BIGINT_61: 0n,
                BIGINT_62: 5n,
                BIGINT_63: 0n,
                BIGINT_64: 45000000000n,
                BIGINT_65: 0n,
                BIGINT_66: 0n,
                BIGINT_67: 1n,
                BIGINT_68: 0n,
                BIGINT_69: 5n,
                BIGINT_70: 0n,
                BIGINT_71: 45000000000n,
                BIGINT_72: 0n,

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
                BIGINT_25: '0n',
                BIGINT_26: '0n',
                BIGINT_27: '0n',

                BIGINT_31: '5n',
                BIGINT_32: '5n',
                BIGINT_33: '-5n',
                BIGINT_34: '5n',
                BIGINT_35: '5n',
                BIGINT_36: '-5n',

                BIGINT_41: '0n',
                BIGINT_42: '5n',
                BIGINT_43: '0n',
                BIGINT_44: '45000000000n',
                BIGINT_45: '0n',
                BIGINT_46: '0n',
                BIGINT_47: '1n',
                BIGINT_48: '0n',
                BIGINT_49: '5n',
                BIGINT_50: '0n',
                BIGINT_51: '45000000000n',
                BIGINT_52: '0n',

                BIGINT_61: '0n',
                BIGINT_62: '5n',
                BIGINT_63: '0n',
                BIGINT_64: '45000000000n',
                BIGINT_65: '0n',
                BIGINT_66: '0n',
                BIGINT_67: '1n',
                BIGINT_68: '0n',
                BIGINT_69: '5n',
                BIGINT_70: '0n',
                BIGINT_71: '45000000000n',
                BIGINT_72: '0n',

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

                BOOLEAN_11: false,
                BOOLEAN_12: false,
                BOOLEAN_13: false,
                BOOLEAN_14: false,
                BOOLEAN_15: false,
                BOOLEAN_16: false,

                BOOLEAN_101: true,
                BOOLEAN_102: false,

                // No conversion
                BOOLEAN_1001: 'TruE',
                BOOLEAN_1002: 'YeS',
                BOOLEAN_1003: 'FalsE',
                BOOLEAN_1004: 'nO',
                // These values are supported only in boolean method
                BOOLEAN_1011: 'not',
                BOOLEAN_1012: 'Not',
                BOOLEAN_1013: 'NOT',
                BOOLEAN_1014: 'none',
                BOOLEAN_1015: 'None',
                BOOLEAN_1016: 'NONE',
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

                BOOLEAN_101: 'true',
                BOOLEAN_102: 'false',

                // No conversion
                BOOLEAN_1001: 'TruE',
                BOOLEAN_1002: 'YeS',
                BOOLEAN_1003: 'FalsE',
                BOOLEAN_1004: 'nO',
                // These values are supported only in boolean method
                BOOLEAN_1011: 'not',
                BOOLEAN_1012: 'Not',
                BOOLEAN_1013: 'NOT',
                BOOLEAN_1014: 'none',
                BOOLEAN_1015: 'None',
                BOOLEAN_1016: 'NONE',
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
                BIGINT_1: 5n,
                BIGINT_2: 5n,
                BIGINT_3: -5n,

                BIGINT_101: 5n,

                // No conversion
                BIGINT_1001: '5N',
                // These values are supported only in bigint method
                BIGINT_1002: '5nany',
            }
            const expectedForEnv = {
                BIGINT_1: '5n',
                BIGINT_2: '5n',
                BIGINT_3: '-5n',

                BIGINT_101: '5n',

                // No conversion
                BIGINT_1001: '5N',
                // These values are supported only in bigint method
                BIGINT_1002: '5nany',
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
                NUMBER_16: 0,
                NUMBER_17: 0,
                NUMBER_18: 0,
                NUMBER_19: 0,
                NUMBER_20: 0,
                NUMBER_21: 0,
                NUMBER_22: 0,
                NUMBER_23: 0,
                NUMBER_24: 0,
                NUMBER_25: Infinity,
                NUMBER_26: Infinity,
                NUMBER_27: -Infinity,

                NUMBER_31: 45,
                NUMBER_32: 45,
                NUMBER_33: -0.45,
                NUMBER_34: 4.5e+123,
                NUMBER_35: 4.5e+123,
                NUMBER_36: -4.5e-123,

                NUMBER_41: 0,
                NUMBER_42: 4.5e+123,
                NUMBER_43: 0,
                NUMBER_44: 0,
                NUMBER_45: 1,
                NUMBER_46: 0,
                NUMBER_47: 4.5e+123,
                NUMBER_48: 0,

                NUMBER_51: 0,
                NUMBER_52: 4.5e+123,
                NUMBER_53: 0,
                NUMBER_54: 0,
                NUMBER_55: 1,
                NUMBER_56: 0,
                NUMBER_57: 4.5e+123,
                NUMBER_58: 0,

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
                NUMBER_16: '0',
                NUMBER_17: '0',
                NUMBER_18: '0',
                NUMBER_19: '0',
                NUMBER_20: '0',
                NUMBER_21: '0',
                NUMBER_22: '0',
                NUMBER_23: '0',
                NUMBER_24: '0',
                NUMBER_25: 'Infinity',
                NUMBER_26: 'Infinity',
                NUMBER_27: '-Infinity',

                NUMBER_31: '45',
                NUMBER_32: '45',
                NUMBER_33: '-0.45',
                NUMBER_34: '4.5e+123',
                NUMBER_35: '4.5e+123',
                NUMBER_36: '-4.5e-123',

                NUMBER_41: '0',
                NUMBER_42: '4.5e+123',
                NUMBER_43: '0',
                NUMBER_44: '0',
                NUMBER_45: '1',
                NUMBER_46: '0',
                NUMBER_47: '4.5e+123',
                NUMBER_48: '0',

                NUMBER_51: '0',
                NUMBER_52: '4.5e+123',
                NUMBER_53: '0',
                NUMBER_54: '0',
                NUMBER_55: '1',
                NUMBER_56: '0',
                NUMBER_57: '4.5e+123',
                NUMBER_58: '0',

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
                BIGINT_25: 0n,
                BIGINT_26: 0n,
                BIGINT_27: 0n,

                BIGINT_31: 5n,
                BIGINT_32: 5n,
                BIGINT_33: -5n,
                BIGINT_34: 5n,
                BIGINT_35: 5n,
                BIGINT_36: -5n,

                BIGINT_41: 0n,
                BIGINT_42: 5n,
                BIGINT_43: 0n,
                BIGINT_44: 45000000000n,
                BIGINT_45: 0n,
                BIGINT_46: 0n,
                BIGINT_47: 1n,
                BIGINT_48: 0n,
                BIGINT_49: 5n,
                BIGINT_50: 0n,
                BIGINT_51: 45000000000n,
                BIGINT_52: 0n,

                BIGINT_61: 0n,
                BIGINT_62: 5n,
                BIGINT_63: 0n,
                BIGINT_64: 45000000000n,
                BIGINT_65: 0n,
                BIGINT_66: 0n,
                BIGINT_67: 1n,
                BIGINT_68: 0n,
                BIGINT_69: 5n,
                BIGINT_70: 0n,
                BIGINT_71: 45000000000n,
                BIGINT_72: 0n,

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
                BIGINT_25: '0n',
                BIGINT_26: '0n',
                BIGINT_27: '0n',

                BIGINT_31: '5n',
                BIGINT_32: '5n',
                BIGINT_33: '-5n',
                BIGINT_34: '5n',
                BIGINT_35: '5n',
                BIGINT_36: '-5n',

                BIGINT_41: '0n',
                BIGINT_42: '5n',
                BIGINT_43: '0n',
                BIGINT_44: '45000000000n',
                BIGINT_45: '0n',
                BIGINT_46: '0n',
                BIGINT_47: '1n',
                BIGINT_48: '0n',
                BIGINT_49: '5n',
                BIGINT_50: '0n',
                BIGINT_51: '45000000000n',
                BIGINT_52: '0n',

                BIGINT_61: '0n',
                BIGINT_62: '5n',
                BIGINT_63: '0n',
                BIGINT_64: '45000000000n',
                BIGINT_65: '0n',
                BIGINT_66: '0n',
                BIGINT_67: '1n',
                BIGINT_68: '0n',
                BIGINT_69: '5n',
                BIGINT_70: '0n',
                BIGINT_71: '45000000000n',
                BIGINT_72: '0n',

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
