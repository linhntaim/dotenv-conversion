import chai from 'chai'
import dotenv from 'dotenv'
import dotenvConversion from '../src'
import mocha from 'mocha'
import fs from 'fs'

const describe = mocha.describe
const it = mocha.it
const expect = chai.expect
chai.should()

describe('dotenv-conversion', function () {
    describe('convert', function () {
        it('empty+trim', function (done) {
            // input
            fs.copyFileSync('./test/inputs/convert/empty+trim.env', './.env')

            // output
            const expected = {
                EMPTY: '',

                TRIM_1: '',
                TRIM_2: 'a',
                TRIM_3: ' ',
                TRIM_4: ' a ',
            }
            const expectedForEnv = {
                EMPTY: '',

                TRIM_1: '',
                TRIM_2: 'a',
                TRIM_3: ' ',
                TRIM_4: ' a ',
            }

            const dotenvConfig = dotenv.config()
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.include(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('null', function (done) {
            // input
            fs.copyFileSync('./test/inputs/convert/null.env', './.env')

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

            const dotenvConfig = dotenv.config()
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.include(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('undefined', function (done) {
            // input
            fs.copyFileSync('./test/inputs/convert/undefined.env', './.env')

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

            const dotenvConfig = dotenv.config()
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.include(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('bool', function (done) {
            // input
            fs.copyFileSync('./test/inputs/convert/bool.env', './.env')

            // output
            const expected = {
                BOOL_1: true,
                BOOL_2: true,
                BOOL_3: true,
                BOOL_4: true,
                BOOL_5: true,
                BOOL_6: true,

                BOOL_11: false,
                BOOL_12: false,
                BOOL_13: false,
                BOOL_14: false,
                BOOL_15: false,
                BOOL_16: false,

                BOOL_101: false,
                BOOL_102: false,
                BOOL_103: false,
                BOOL_104: false,
                BOOL_105: false,
                BOOL_106: false,
                BOOL_107: false,
                BOOL_108: false,
                BOOL_109: false,
                BOOL_110: false,
                BOOL_111: false,
                BOOL_112: false,
                BOOL_113: false,
                BOOL_114: false,
                BOOL_115: false,
                BOOL_116: false,
                BOOL_117: false,
                BOOL_118: false,
                BOOL_119: false,
                BOOL_120: false,
                BOOL_121: false,

                BOOL_201: false,
                BOOL_202: false,
                BOOL_203: false,
                BOOL_204: false,
                BOOL_205: false,
                BOOL_206: false,
                BOOL_207: false,
                BOOL_208: false,
                BOOL_209: false,
                BOOL_210: false,
                BOOL_211: false,
                BOOL_212: false,
                BOOL_213: false,
                BOOL_214: false,
                BOOL_215: false,

                BOOL_301: false,
                BOOL_302: false,
                BOOL_303: false,
                BOOL_304: false,
                BOOL_305: false,
                BOOL_306: false,
                BOOL_307: false,
                BOOL_308: false,
                BOOL_309: false,

                BOOL_401: true,
                BOOL_402: true,

                // No conversion
                BOOL_1001: 'TruE',
                BOOL_1002: 'YeS',
                BOOL_1003: 'FalsE',
                BOOL_1004: 'nO',
                BOOL_1005: ' bool:any ',
            }
            const expectedForEnv = {
                BOOL_1: 'true',
                BOOL_2: 'true',
                BOOL_3: 'true',
                BOOL_4: 'true',
                BOOL_5: 'true',
                BOOL_6: 'true',

                BOOL_11: 'false',
                BOOL_12: 'false',
                BOOL_13: 'false',
                BOOL_14: 'false',
                BOOL_15: 'false',
                BOOL_16: 'false',

                BOOL_101: 'false',
                BOOL_102: 'false',
                BOOL_103: 'false',
                BOOL_104: 'false',
                BOOL_105: 'false',
                BOOL_106: 'false',
                BOOL_107: 'false',
                BOOL_108: 'false',
                BOOL_109: 'false',
                BOOL_110: 'false',
                BOOL_111: 'false',
                BOOL_112: 'false',
                BOOL_113: 'false',
                BOOL_114: 'false',
                BOOL_115: 'false',
                BOOL_116: 'false',
                BOOL_117: 'false',
                BOOL_118: 'false',
                BOOL_119: 'false',
                BOOL_120: 'false',
                BOOL_121: 'false',

                BOOL_201: 'false',
                BOOL_202: 'false',
                BOOL_203: 'false',
                BOOL_204: 'false',
                BOOL_205: 'false',
                BOOL_206: 'false',
                BOOL_207: 'false',
                BOOL_208: 'false',
                BOOL_209: 'false',
                BOOL_210: 'false',
                BOOL_211: 'false',
                BOOL_212: 'false',
                BOOL_213: 'false',
                BOOL_214: 'false',
                BOOL_215: 'false',

                BOOL_301: 'false',
                BOOL_302: 'false',
                BOOL_303: 'false',
                BOOL_304: 'false',
                BOOL_305: 'false',
                BOOL_306: 'false',
                BOOL_307: 'false',
                BOOL_308: 'false',
                BOOL_309: 'false',

                BOOL_401: 'true',
                BOOL_402: 'true',

                // No conversion
                BOOL_1001: 'TruE',
                BOOL_1002: 'YeS',
                BOOL_1003: 'FalsE',
                BOOL_1004: 'nO',
                BOOL_1005: ' bool:any ',
            }

            const dotenvConfig = dotenv.config()
            const dotenvConversionConfig = dotenvConversion.convert(dotenvConfig)

            dotenvConversionConfig.parsed.should.deep.include(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        // it('conversion: number', function (done) {
        //     const input = {
        //         NUMBER_1: '02',
        //         NUMBER_2: '+02',
        //         NUMBER_3: '-02',
        //         NUMBER_4: '02.2',
        //         NUMBER_5: '+02.2',
        //         NUMBER_6: '-02.2',
        //         NUMBER_7: '02.2e123',
        //         NUMBER_8: '02.2e+123',
        //         NUMBER_9: '02.2e-123',
        //         NUMBER_10: '+02.2e123',
        //         NUMBER_11: '+02.2e+123',
        //         NUMBER_12: '+02.2e-123',
        //         NUMBER_13: '-02.2e123',
        //         NUMBER_14: '-02.2e+123',
        //         NUMBER_15: '-02.2e-123',
        //
        //         NUMBER_101: 'number:02',
        //         NUMBER_102: 'number:+02',
        //         NUMBER_103: 'number:-02',
        //         NUMBER_104: 'number:02.2',
        //         NUMBER_105: 'number:+02.2',
        //         NUMBER_106: 'number:-02.2',
        //         NUMBER_107: 'number:02.2e123',
        //         NUMBER_108: 'number:02.2e+123',
        //         NUMBER_109: 'number:02.2e-123',
        //         NUMBER_110: 'number:+02.2e123',
        //         NUMBER_111: 'number:+02.2e+123',
        //         NUMBER_112: 'number:+02.2e-123',
        //         NUMBER_113: 'number:-02.2e123',
        //         NUMBER_114: 'number:-02.2e+123',
        //         NUMBER_115: 'number:-02.2e-123',
        //
        //         NUMBER_201: 'number:02any',
        //         NUMBER_202: 'number:+02any',
        //         NUMBER_203: 'number:-02any',
        //         NUMBER_204: 'number:02.2any',
        //         NUMBER_205: 'number:+02.2any',
        //         NUMBER_206: 'number:-02.2any',
        //         NUMBER_207: 'number:02.2e123any',
        //         NUMBER_208: 'number:02.2e+123any',
        //         NUMBER_209: 'number:02.2e-123any',
        //         NUMBER_210: 'number:+02.2e123any',
        //         NUMBER_211: 'number:+02.2e+123any',
        //         NUMBER_212: 'number:+02.2e-123any',
        //         NUMBER_213: 'number:-02.2e123any',
        //         NUMBER_214: 'number:-02.2e+123any',
        //         NUMBER_215: 'number:-02.2e-123any',
        //
        //         NUMBER_1001: 'number:any',
        //         NUMBER_1002: 'number:',
        //         NUMBER_1003: 'num:123any',
        //     }
        //     const expected = {
        //         NUMBER_1: 2,
        //         NUMBER_2: 2,
        //         NUMBER_3: -2,
        //         NUMBER_4: 2.2,
        //         NUMBER_5: 2.2,
        //         NUMBER_6: -2.2,
        //         NUMBER_7: 2.2e+123,
        //         NUMBER_8: 2.2e+123,
        //         NUMBER_9: 2.2e-123,
        //         NUMBER_10: 2.2e+123,
        //         NUMBER_11: 2.2e+123,
        //         NUMBER_12: 2.2e-123,
        //         NUMBER_13: -2.2e+123,
        //         NUMBER_14: -2.2e+123,
        //         NUMBER_15: -2.2e-123,
        //
        //         NUMBER_101: 2,
        //         NUMBER_102: 2,
        //         NUMBER_103: -2,
        //         NUMBER_104: 2.2,
        //         NUMBER_105: 2.2,
        //         NUMBER_106: -2.2,
        //         NUMBER_107: 2.2e+123,
        //         NUMBER_108: 2.2e+123,
        //         NUMBER_109: 2.2e-123,
        //         NUMBER_110: 2.2e+123,
        //         NUMBER_111: 2.2e+123,
        //         NUMBER_112: 2.2e-123,
        //         NUMBER_113: -2.2e+123,
        //         NUMBER_114: -2.2e+123,
        //         NUMBER_115: -2.2e-123,
        //
        //         NUMBER_201: 2,
        //         NUMBER_202: 2,
        //         NUMBER_203: -2,
        //         NUMBER_204: 2.2,
        //         NUMBER_205: 2.2,
        //         NUMBER_206: -2.2,
        //         NUMBER_207: 2.2e+123,
        //         NUMBER_208: 2.2e+123,
        //         NUMBER_209: 2.2e-123,
        //         NUMBER_210: 2.2e+123,
        //         NUMBER_211: 2.2e+123,
        //         NUMBER_212: 2.2e-123,
        //         NUMBER_213: -2.2e+123,
        //         NUMBER_214: -2.2e+123,
        //         NUMBER_215: -2.2e-123,
        //
        //         NUMBER_1001: 0,
        //         NUMBER_1002: 0,
        //         NUMBER_1003: 123,
        //     }
        //     const expectedForEnv = {
        //         NUMBER_1: '2',
        //         NUMBER_2: '2',
        //         NUMBER_3: '-2',
        //         NUMBER_4: '2.2',
        //         NUMBER_5: '2.2',
        //         NUMBER_6: '-2.2',
        //         NUMBER_7: '2.2e+123',
        //         NUMBER_8: '2.2e+123',
        //         NUMBER_9: '2.2e-123',
        //         NUMBER_10: '2.2e+123',
        //         NUMBER_11: '2.2e+123',
        //         NUMBER_12: '2.2e-123',
        //         NUMBER_13: '-2.2e+123',
        //         NUMBER_14: '-2.2e+123',
        //         NUMBER_15: '-2.2e-123',
        //
        //         NUMBER_101: '2',
        //         NUMBER_102: '2',
        //         NUMBER_103: '-2',
        //         NUMBER_104: '2.2',
        //         NUMBER_105: '2.2',
        //         NUMBER_106: '-2.2',
        //         NUMBER_107: '2.2e+123',
        //         NUMBER_108: '2.2e+123',
        //         NUMBER_109: '2.2e-123',
        //         NUMBER_110: '2.2e+123',
        //         NUMBER_111: '2.2e+123',
        //         NUMBER_112: '2.2e-123',
        //         NUMBER_113: '-2.2e+123',
        //         NUMBER_114: '-2.2e+123',
        //         NUMBER_115: '-2.2e-123',
        //
        //         NUMBER_201: '2',
        //         NUMBER_202: '2',
        //         NUMBER_203: '-2',
        //         NUMBER_204: '2.2',
        //         NUMBER_205: '2.2',
        //         NUMBER_206: '-2.2',
        //         NUMBER_207: '2.2e+123',
        //         NUMBER_208: '2.2e+123',
        //         NUMBER_209: '2.2e-123',
        //         NUMBER_210: '2.2e+123',
        //         NUMBER_211: '2.2e+123',
        //         NUMBER_212: '2.2e-123',
        //         NUMBER_213: '-2.2e+123',
        //         NUMBER_214: '-2.2e+123',
        //         NUMBER_215: '-2.2e-123',
        //
        //         NUMBER_1001: '0',
        //         NUMBER_1002: '0',
        //         NUMBER_1003: '123',
        //     }
        //
        //     Object.assign(process.env, input)
        //     const dotenvConfig = {
        //         parsed: input,
        //     }
        //
        //     const dotenvConfigParsed = dotenvConversion.make(dotenvConfig).parsed
        //
        //     dotenvConfigParsed.should.deep.include(expected)
        //     dotenvConversion.env.should.deep.include(expected)
        //     process.env.should.deep.include(expectedForEnv)
        //     done()
        // })
        //
        // it('conversion: bigint', function (done) {
        //     const input = {
        //         BIGINT_1: '02n',
        //         BIGINT_2: '+02n',
        //         BIGINT_3: '-02n',
        //
        //         BIGINT_101: 'bigint:02',
        //         BIGINT_102: 'bigint:+02',
        //         BIGINT_103: 'bigint:-02',
        //
        //         BIGINT_104: 'bigint:02n',
        //         BIGINT_105: 'bigint:+02n',
        //         BIGINT_106: 'bigint:-02n',
        //
        //         BIGINT_107: 'bigint:02.2',
        //         BIGINT_108: 'bigint:+02.2',
        //         BIGINT_109: 'bigint:-02.2',
        //
        //         BIGINT_110: 'bigint:02.0',
        //         BIGINT_111: 'bigint:+02.0',
        //         BIGINT_112: 'bigint:-02.0',
        //
        //         BIGINT_113: 'bigint:02.2any',
        //         BIGINT_114: 'bigint:+02.2any',
        //         BIGINT_115: 'bigint:-02.2any',
        //
        //         BIGINT_116: 'bigint:02.0any',
        //         BIGINT_117: 'bigint:+02.0any',
        //         BIGINT_118: 'bigint:-02.0any',
        //
        //         BIGINT_1001: 'bigint:any',
        //         BIGINT_1002: 'bigint:',
        //         BIGINT_1003: 'big:123n',
        //     }
        //     const expected = {
        //         BIGINT_1: 2n,
        //         BIGINT_2: 2n,
        //         BIGINT_3: -2n,
        //
        //         BIGINT_101: 2n,
        //         BIGINT_102: 2n,
        //         BIGINT_103: -2n,
        //
        //         BIGINT_104: 2n,
        //         BIGINT_105: 2n,
        //         BIGINT_106: -2n,
        //
        //         BIGINT_107: 2n,
        //         BIGINT_108: 2n,
        //         BIGINT_109: -2n,
        //
        //         BIGINT_110: 2n,
        //         BIGINT_111: 2n,
        //         BIGINT_112: -2n,
        //
        //         BIGINT_113: 2n,
        //         BIGINT_114: 2n,
        //         BIGINT_115: -2n,
        //
        //         BIGINT_116: 2n,
        //         BIGINT_117: 2n,
        //         BIGINT_118: -2n,
        //
        //         BIGINT_1001: 0n,
        //         BIGINT_1002: 0n,
        //         BIGINT_1003: 123n,
        //     }
        //     const expectedForEnv = {
        //         BIGINT_1: '2n',
        //         BIGINT_2: '2n',
        //         BIGINT_3: '-2n',
        //
        //         BIGINT_101: '2n',
        //         BIGINT_102: '2n',
        //         BIGINT_103: '-2n',
        //
        //         BIGINT_104: '2n',
        //         BIGINT_105: '2n',
        //         BIGINT_106: '-2n',
        //
        //         BIGINT_107: '2n',
        //         BIGINT_108: '2n',
        //         BIGINT_109: '-2n',
        //
        //         BIGINT_110: '2n',
        //         BIGINT_111: '2n',
        //         BIGINT_112: '-2n',
        //
        //         BIGINT_113: '2n',
        //         BIGINT_114: '2n',
        //         BIGINT_115: '-2n',
        //
        //         BIGINT_116: '2n',
        //         BIGINT_117: '2n',
        //         BIGINT_118: '-2n',
        //
        //         BIGINT_1001: '0n',
        //         BIGINT_1002: '0n',
        //         BIGINT_1003: '123n',
        //     }
        //
        //     Object.assign(process.env, input)
        //     const dotenvConfig = {
        //         parsed: input,
        //     }
        //
        //     const dotenvConfigParsed = dotenvConversion.make(dotenvConfig).parsed
        //
        //     dotenvConfigParsed.should.deep.include(expected)
        //     dotenvConversion.env.should.deep.include(expected)
        //     process.env.should.deep.include(expectedForEnv)
        //     done()
        // })
        //
        // it('conversion: array', function (done) {
        //     const input = {
        //         ARRAY_0: '[]',
        //         ARRAY_1: '[1,"2,3","4,5",6]',
        //         ARRAY_2: '[1,"2,3"7,"4,5",6]',
        //         ARRAY_3: '[1,"2 \\\"and\\\" 3",4]',
        //         ARRAY_4: '[1,\'2,3\',\'4,5\',6]',
        //
        //         ARRAY_10: 'array:',
        //         ARRAY_11: '[1,"2,3","4,5",6]',
        //         ARRAY_12: '[1,"2,3"7,"4,5",6]',
        //         ARRAY_13: '[1,"2 \\\"and\\\" 3",4]',
        //         ARRAY_14: '[1,\'2,3\',\'4,5\',6]',
        //
        //         ARRAY_100: 'arr:1,"2,3","4,5",6',
        //     }
        //     const expected = {
        //         ARRAY_0: [],
        //         ARRAY_1: [1, '2,3', '4,5', 6],
        //         ARRAY_2: ['1,"2,3"7,"4,5",6'],
        //         ARRAY_3: [1, '2 "and" 3', 4],
        //         ARRAY_4: ['1,\'2,3\',\'4,5\',6'],
        //
        //         ARRAY_10: [],
        //         ARRAY_11: [1, '2,3', '4,5', 6],
        //         ARRAY_12: ['1,"2,3"7,"4,5",6'],
        //         ARRAY_13: [1, '2 "and" 3', 4],
        //         ARRAY_14: ['1,\'2,3\',\'4,5\',6'],
        //
        //         ARRAY_100: [1, '2,3', '4,5', 6],
        //     }
        //     const expectedForEnv = {
        //         ARRAY_0: '[]',
        //         ARRAY_1: '[1,"2,3","4,5",6]',
        //         ARRAY_2: '["1,\\"2,3\\"7,\\"4,5\\",6"]',
        //         ARRAY_3: '[1,"2 \\\"and\\\" 3",4]',
        //         ARRAY_4: '["1,\'2,3\',\'4,5\',6"]',
        //
        //         ARRAY_10: '[]',
        //         ARRAY_11: '[1,"2,3","4,5",6]',
        //         ARRAY_12: '["1,\\"2,3\\"7,\\"4,5\\",6"]',
        //         ARRAY_13: '[1,"2 \\\"and\\\" 3",4]',
        //         ARRAY_14: '["1,\'2,3\',\'4,5\',6"]',
        //
        //         ARRAY_100: '[1,"2,3","4,5",6]',
        //     }
        //
        //     Object.assign(process.env, input)
        //     const dotenvConfig = {
        //         parsed: input,
        //     }
        //
        //     const dotenvConfigParsed = dotenvConversion.make(dotenvConfig).parsed
        //
        //     dotenvConfigParsed.should.deep.include(expected)
        //     dotenvConversion.env.should.deep.include(expected)
        //     process.env.should.deep.include(expectedForEnv)
        //     done()
        // })
        //
        // it('conversion: json', function (done) {
        //     const input = {
        //         JSON_0: '{}',
        //         JSON_1: '{"foo":"bar"}',
        //         JSON_2: '{"foo"baz:"bar"}',
        //
        //         JSON_10: 'json:',
        //         JSON_11: 'json:{"foo":"bar"}',
        //         JSON_12: 'json:{"foo"baz:"bar"}',
        //
        //         JSON_100: 'obj:{"foo":"bar"}',
        //     }
        //     const expected = {
        //         JSON_0: {},
        //         JSON_1: {foo: 'bar'},
        //         JSON_2: '{"foo"baz:"bar"}',
        //
        //         JSON_10: {},
        //         JSON_11: {foo: 'bar'},
        //         JSON_12: '{"foo"baz:"bar"}',
        //
        //         JSON_100: {foo: 'bar'},
        //     }
        //     const expectedForEnv = {
        //         JSON_0: '{}',
        //         JSON_1: '{"foo":"bar"}',
        //         JSON_2: '{"foo"baz:"bar"}',
        //
        //         JSON_10: '{}',
        //         JSON_11: '{"foo":"bar"}',
        //         JSON_12: '{"foo"baz:"bar"}',
        //
        //         JSON_100: '{"foo":"bar"}',
        //     }
        //
        //     Object.assign(process.env, input)
        //     const dotenvConfig = {
        //         parsed: input,
        //     }
        //
        //     const dotenvConfigParsed = dotenvConversion.make(dotenvConfig).parsed
        //
        //     dotenvConfigParsed.should.deep.include(expected)
        //     dotenvConversion.env.should.deep.include(expected)
        //     process.env.should.deep.include(expectedForEnv)
        //     done()
        // })
        //
        // it('conversion: custom (native supported => native supported : number => bool)', function (done) {
        //     const input = {
        //         NUMBER: '1',
        //     }
        //     const expected = {
        //         NUMBER: true,
        //     }
        //     const expectedForEnv = {
        //         NUMBER: 'true',
        //     }
        //
        //     Object.assign(process.env, input)
        //     const dotenvConfig = {
        //         parsed: input,
        //     }
        //
        //     const dotenvConfigParsed = dotenvConversion.make(dotenvConfig, {
        //         specs: {
        //             NUMBER: 'bool',
        //         },
        //     }).parsed
        //
        //     dotenvConfigParsed.should.deep.include(expected)
        //     dotenvConversion.env.should.deep.include(expected)
        //     process.env.should.deep.include(expectedForEnv)
        //     done()
        // })
        //
        // it('conversion: custom (native supported => not-existed conversion : number => object)', function (done) {
        //     const input = {
        //         NUMBER: '1',
        //     }
        //     const expected = {
        //         NUMBER: '1',
        //     }
        //     const expectedForEnv = {
        //         NUMBER: '1',
        //     }
        //
        //     Object.assign(process.env, input)
        //     const dotenvConfig = {
        //         parsed: input,
        //     }
        //
        //     const dotenvConfigParsed = dotenvConversion.make(dotenvConfig, {
        //         specs: {
        //             NUMBER: 'object',
        //         },
        //     }).parsed
        //
        //     dotenvConfigParsed.should.deep.include(expected)
        //     dotenvConversion.env.should.deep.include(expected)
        //     process.env.should.deep.include(expectedForEnv)
        //     done()
        // })
        //
        // it('conversion: custom (native supported => not-allowed format : number => defined object)', function (done) {
        //     const input = {
        //         NUMBER: '1',
        //     }
        //     const expected = {
        //         NUMBER: '1',
        //     }
        //     const expectedForEnv = {
        //         NUMBER: '1',
        //     }
        //
        //     Object.assign(process.env, input)
        //     const dotenvConfig = {
        //         parsed: input,
        //     }
        //
        //     const dotenvConfigParsed = dotenvConversion.make(dotenvConfig, {
        //         specs: {
        //             NUMBER: {method: 'bool'},
        //         },
        //     }).parsed
        //
        //     dotenvConfigParsed.should.deep.include(expected)
        //     dotenvConversion.env.should.deep.include(expected)
        //     process.env.should.deep.include(expectedForEnv)
        //     done()
        // })
        //
        // it('conversion: custom (native supported => custom conversion)', function (done) {
        //     const input = {
        //         JSON: '{"foo":"bar"}',
        //     }
        //     const expected = {
        //         JSON: {
        //             original: '{"foo":"bar"}',
        //             parsed: {
        //                 foo: 'bar',
        //             },
        //         },
        //     }
        //     const expectedForEnv = {
        //         JSON: '{"original":"{\\"foo\\":\\"bar\\"}","parsed":{"foo":"bar"}}',
        //     }
        //
        //     Object.assign(process.env, input)
        //     const dotenvConfig = {
        //         parsed: input,
        //     }
        //
        //     const dotenvConfigParsed = dotenvConversion.make(dotenvConfig, {
        //         specs: {
        //             JSON(value) {
        //                 return {
        //                     original: value,
        //                     parsed: JsonHandler.parse(value),
        //                 }
        //             },
        //         },
        //     }).parsed
        //
        //     dotenvConfigParsed.should.deep.include(expected)
        //     dotenvConversion.env.should.deep.include(expected)
        //     process.env.should.deep.include(expectedForEnv)
        //     done()
        // })
        //
        // it('conversion: custom (override native supported : override json)', function (done) {
        //     const input = {
        //         JSON_1: '{"foo":"bar"}',
        //         JSON_2: '{"a":"b"}',
        //     }
        //     const expected = {
        //         JSON_1: {
        //             original: '{"foo":"bar"}',
        //             parsed: {
        //                 foo: 'bar',
        //             },
        //         },
        //         JSON_2: {
        //             original: '{"a":"b"}',
        //             parsed: {
        //                 a: 'b',
        //             },
        //         },
        //     }
        //     const expectedForEnv = {
        //         JSON_1: '{"original":"{\\"foo\\":\\"bar\\"}","parsed":{"foo":"bar"}}',
        //         JSON_2: '{"original":"{\\"a\\":\\"b\\"}","parsed":{"a":"b"}}',
        //     }
        //
        //     Object.assign(process.env, input)
        //     const dotenvConfig = {
        //         parsed: input,
        //     }
        //
        //     const dotenvConfigParsed = dotenvConversion.make(dotenvConfig, {
        //         override: {
        //             json(value) {
        //                 try {
        //                     return {
        //                         original: value,
        //                         parsed: JsonHandler.parse(value),
        //                     }
        //                 }
        //                 catch (e) {
        //                     return value
        //                 }
        //             },
        //         },
        //     }).parsed
        //
        //     dotenvConfigParsed.should.deep.include(expected)
        //     dotenvConversion.env.should.deep.include(expected)
        //     process.env.should.deep.include(expectedForEnv)
        //     done()
        // })
        //
        // it('prevent from conversion', function (done) {
        //     const input = {
        //         BOOL: 'bool:true',
        //     }
        //     const expected = {
        //         BOOL: 'bool:true',
        //     }
        //
        //     Object.assign(process.env, input)
        //     const dotenvConfig = {
        //         parsed: input,
        //     }
        //
        //     const dotenvConfigParsed = dotenvConversion.make(dotenvConfig, {
        //         prevents: ['BOOL'],
        //     }).parsed
        //
        //     dotenvConfigParsed.should.deep.include(expected)
        //     dotenvConversion.env.should.deep.include(expected)
        //     process.env.should.deep.include(expected)
        //     done()
        // })
        //
        // it('getenv', function (done) {
        //     const input = {
        //         RAW: 'raw',
        //         BOOL: 'yes',
        //     }
        //     const expected = {
        //         RAW: 'raw',
        //         BOOL: true,
        //     }
        //     const expectedEnv = {
        //         RAW: 'raw',
        //         BOOL: 'true',
        //     }
        //
        //     Object.assign(process.env, input)
        //     const dotenvConfig = {parsed: input}
        //     dotenvConversion.make(dotenvConfig)
        //
        //     dotenvConversion.getenv('RAW').should.deep.equal('raw')
        //     dotenvConversion.getenv('BOOL').should.deep.equal(true)
        //     expect(dotenvConversion.getenv('UNKNOWN')).to.be.a('null')
        //     dotenvConversion.getenv('UNKNOWN', '').should.deep.equal('')
        //     dotenvConversion.getenv().should.deep.include(expected)
        //     process.env.should.deep.include(expectedEnv)
        //     done()
        // })
        //
        // it('getenv and ignore process.env', function (done) {
        //     const input = {
        //         RAW: 'raw',
        //         BOOL: 'yes',
        //     }
        //     const expected = {
        //         RAW: 'raw',
        //         BOOL: true,
        //     }
        //     const expectedEnv = {
        //         RAW: 'raw',
        //         BOOL: 'yes',
        //     }
        //
        //     Object.assign(process.env, input)
        //     const dotenvConfig = {
        //         ignoreProcessEnv: true,
        //         parsed: input,
        //     }
        //     dotenvConversion.make(dotenvConfig)
        //
        //     dotenvConversion.getenv('RAW').should.deep.equal('raw')
        //     dotenvConversion.getenv('BOOL').should.deep.equal(true)
        //     expect(dotenvConversion.getenv('UNKNOWN')).to.be.a('null')
        //     dotenvConversion.getenv('UNKNOWN', '').should.deep.equal('')
        //     dotenvConversion.getenv().should.deep.include(expected)
        //     process.env.should.deep.include(expectedEnv)
        //     done()
        // })
    })
})
