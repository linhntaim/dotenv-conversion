import dotenvConversion from '../index'
import mocha from 'mocha'
import chai from 'chai'

const JsonHandler = JSON
const describe = mocha.describe
const it = mocha.it
chai.should()

describe('dotenv-conversion', function () {
    describe('unit tests', function () {
        it('return object', function (done) {
            const dotenvConfig = {parsed: {}}
            const dotenvConfigParsed = dotenvConversion.make(dotenvConfig).parsed

            dotenvConfigParsed.should.be.a('object')
            done()
        })

        it('return object 2', function (done) {
            const convertedDotenvConfig = dotenvConversion.make()

            convertedDotenvConfig.should.be.a('object')
            done()
        })

        it('set config', function (done) {
            dotenvConversion.setConfig()

            dotenvConversion.config.should.be.a('object')
            done()
        })

        it('conversion: raw', function (done) {
            const input = {
                RAW_1: 'raw',
                RAW_2: 'raw:raw',
            }
            const expected = {
                RAW_1: 'raw',
                RAW_2: 'raw',
            }

            Object.assign(process.env, input)
            const dotenvConfig = {
                parsed: input,
            }

            const dotenvConfigParsed = dotenvConversion.make(dotenvConfig).parsed

            dotenvConfigParsed.should.deep.include(expected)
            dotenvConversion.env.should.deep.include(expected)
            process.env.should.deep.include(expected)
            done()
        })

        it('conversion: null', function (done) {
            const input = {
                NULL: 'null',
            }
            const expected = {
                NULL: '',
            }

            Object.assign(process.env, input)
            const dotenvConfig = {
                parsed: input,
            }

            const dotenvConfigParsed = dotenvConversion.make(dotenvConfig).parsed

            dotenvConfigParsed.should.deep.include(expected)
            dotenvConversion.env.should.deep.include(expected)
            process.env.should.deep.include(expected)
            done()
        })

        it('conversion: bool', function (done) {
            const input = {
                BOOL_1: 'true',
                BOOL_2: 'false',
                BOOL_3: 'yes',
                BOOL_4: 'no',
                BOOL_5: 'bool:any',
                BOOL_6: 'bool:',
                BOOL_7: 'bool:false',
                BOOL_8: 'bool:NaN',
                BOOL_9: 'bool:no',
                BOOL_10: 'bool:not',
                BOOL_11: 'bool:none',
                BOOL_12: 'bool:null',
                BOOL_13: 'bool:undefined',
                BOOL_14: 'bool:0',
                BOOL_15: 'bool:00',
            }
            const expected = {
                BOOL_1: true,
                BOOL_2: false,
                BOOL_3: true,
                BOOL_4: false,
                BOOL_5: true,
                BOOL_6: false,
                BOOL_7: false,
                BOOL_8: false,
                BOOL_9: false,
                BOOL_10: false,
                BOOL_11: false,
                BOOL_12: false,
                BOOL_13: false,
                BOOL_14: false,
                BOOL_15: false,
            }
            const expectedForEnv = {
                BOOL_1: 'true',
                BOOL_2: 'false',
                BOOL_3: 'true',
                BOOL_4: 'false',
                BOOL_5: 'true',
                BOOL_6: 'false',
                BOOL_7: 'false',
                BOOL_8: 'false',
                BOOL_9: 'false',
                BOOL_10: 'false',
                BOOL_11: 'false',
                BOOL_12: 'false',
                BOOL_13: 'false',
                BOOL_14: 'false',
                BOOL_15: 'false',
            }

            Object.assign(process.env, input)
            const dotenvConfig = {
                parsed: input,
            }

            const dotenvConfigParsed = dotenvConversion.make(dotenvConfig).parsed

            dotenvConfigParsed.should.deep.include(expected)
            dotenvConversion.env.should.deep.include(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('conversion: number', function (done) {
            const input = {
                NUMBER_1: '02',
                NUMBER_2: '+02',
                NUMBER_3: '-02',
                NUMBER_4: '02.2',
                NUMBER_5: '+02.2',
                NUMBER_6: '-02.2',
                NUMBER_7: '02.2e123',
                NUMBER_8: '02.2e+123',
                NUMBER_9: '02.2e-123',
                NUMBER_10: '+02.2e123',
                NUMBER_11: '+02.2e+123',
                NUMBER_12: '+02.2e-123',
                NUMBER_13: '-02.2e123',
                NUMBER_14: '-02.2e+123',
                NUMBER_15: '-02.2e-123',
                NUMBER_101: 'number:02',
                NUMBER_102: 'number:+02',
                NUMBER_103: 'number:-02',
                NUMBER_104: 'number:02.2',
                NUMBER_105: 'number:+02.2',
                NUMBER_106: 'number:-02.2',
                NUMBER_107: 'number:02.2e123',
                NUMBER_108: 'number:02.2e+123',
                NUMBER_109: 'number:02.2e-123',
                NUMBER_110: 'number:+02.2e123',
                NUMBER_111: 'number:+02.2e+123',
                NUMBER_112: 'number:+02.2e-123',
                NUMBER_113: 'number:-02.2e123',
                NUMBER_114: 'number:-02.2e+123',
                NUMBER_115: 'number:-02.2e-123',
                NUMBER_1001: 'number:any',
                NUMBER_1002: 'number:',
            }
            const expected = {
                NUMBER_1: 2,
                NUMBER_2: 2,
                NUMBER_3: -2,
                NUMBER_4: 2.2,
                NUMBER_5: 2.2,
                NUMBER_6: -2.2,
                NUMBER_7: 2.2e+123,
                NUMBER_8: 2.2e+123,
                NUMBER_9: 2.2e-123,
                NUMBER_10: 2.2e+123,
                NUMBER_11: 2.2e+123,
                NUMBER_12: 2.2e-123,
                NUMBER_13: -2.2e+123,
                NUMBER_14: -2.2e+123,
                NUMBER_15: -2.2e-123,
                NUMBER_101: 2,
                NUMBER_102: 2,
                NUMBER_103: -2,
                NUMBER_104: 2.2,
                NUMBER_105: 2.2,
                NUMBER_106: -2.2,
                NUMBER_107: 2.2e+123,
                NUMBER_108: 2.2e+123,
                NUMBER_109: 2.2e-123,
                NUMBER_110: 2.2e+123,
                NUMBER_111: 2.2e+123,
                NUMBER_112: 2.2e-123,
                NUMBER_113: -2.2e+123,
                NUMBER_114: -2.2e+123,
                NUMBER_115: -2.2e-123,
                NUMBER_1001: 0,
                NUMBER_1002: 0,
            }
            const expectedForEnv = {
                NUMBER_1: '2',
                NUMBER_2: '2',
                NUMBER_3: '-2',
                NUMBER_4: '2.2',
                NUMBER_5: '2.2',
                NUMBER_6: '-2.2',
                NUMBER_7: '2.2e+123',
                NUMBER_8: '2.2e+123',
                NUMBER_9: '2.2e-123',
                NUMBER_10: '2.2e+123',
                NUMBER_11: '2.2e+123',
                NUMBER_12: '2.2e-123',
                NUMBER_13: '-2.2e+123',
                NUMBER_14: '-2.2e+123',
                NUMBER_15: '-2.2e-123',
                NUMBER_101: '2',
                NUMBER_102: '2',
                NUMBER_103: '-2',
                NUMBER_104: '2.2',
                NUMBER_105: '2.2',
                NUMBER_106: '-2.2',
                NUMBER_107: '2.2e+123',
                NUMBER_108: '2.2e+123',
                NUMBER_109: '2.2e-123',
                NUMBER_110: '2.2e+123',
                NUMBER_111: '2.2e+123',
                NUMBER_112: '2.2e-123',
                NUMBER_113: '-2.2e+123',
                NUMBER_114: '-2.2e+123',
                NUMBER_115: '-2.2e-123',
                NUMBER_1001: '0',
                NUMBER_1002: '0',
            }

            Object.assign(process.env, input)
            const dotenvConfig = {
                parsed: input,
            }

            const dotenvConfigParsed = dotenvConversion.make(dotenvConfig).parsed

            dotenvConfigParsed.should.deep.include(expected)
            dotenvConversion.env.should.deep.include(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('conversion: array', function (done) {
            const input = {
                ARRAY_1: '[1,"2,3","4,5",6]',
                ARRAY_2: 'array:1,2\\,3,4\\,5,6',
                ARRAY_3: 'array:',
            }
            const expected = {
                ARRAY_1: [1, '2,3', '4,5', 6],
                ARRAY_2: ['1', '2,3', '4,5', '6'],
                ARRAY_3: [],
            }
            const expectedForEnv = {
                ARRAY_1: '[1,"2,3","4,5",6]',
                ARRAY_2: '["1","2,3","4,5","6"]',
                ARRAY_3: '[]',
            }

            Object.assign(process.env, input)
            const dotenvConfig = {
                parsed: input,
            }

            const dotenvConfigParsed = dotenvConversion.make(dotenvConfig).parsed

            dotenvConfigParsed.should.deep.include(expected)
            dotenvConversion.env.should.deep.include(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('conversion: json', function (done) {
            const input = {
                JSON_1: '{"foo":"bar"}',
                JSON_2: 'json:{"foo":"bar"}',
                JSON_3: 'json:',
            }
            const expected = {
                JSON_1: {foo: 'bar'},
                JSON_2: {foo: 'bar'},
                JSON_3: {},
            }
            const expectedForEnv = {
                JSON_1: '{"foo":"bar"}',
                JSON_2: '{"foo":"bar"}',
                JSON_3: '{}',
            }

            Object.assign(process.env, input)
            const dotenvConfig = {
                parsed: input,
            }

            const dotenvConfigParsed = dotenvConversion.make(dotenvConfig).parsed

            dotenvConfigParsed.should.deep.include(expected)
            dotenvConversion.env.should.deep.include(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('conversion: custom (native supported => native supported : number => bool)', function (done) {
            const input = {
                NUMBER: '1',
            }
            const expected = {
                NUMBER: true,
            }
            const expectedForEnv = {
                NUMBER: 'true',
            }

            Object.assign(process.env, input)
            const dotenvConfig = {
                parsed: input,
            }

            const dotenvConfigParsed = dotenvConversion.make(dotenvConfig, {
                specs: {
                    NUMBER: 'bool',
                },
            }).parsed

            dotenvConfigParsed.should.deep.include(expected)
            dotenvConversion.env.should.deep.include(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('conversion: custom (native supported => not-existed conversion : number => object)', function (done) {
            const input = {
                NUMBER: '1',
            }
            const expected = {
                NUMBER: '1',
            }
            const expectedForEnv = {
                NUMBER: '1',
            }

            Object.assign(process.env, input)
            const dotenvConfig = {
                parsed: input,
            }

            const dotenvConfigParsed = dotenvConversion.make(dotenvConfig, {
                specs: {
                    NUMBER: 'object',
                },
            }).parsed

            dotenvConfigParsed.should.deep.include(expected)
            dotenvConversion.env.should.deep.include(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('conversion: custom (native supported => not-allowed format : number => defined object)', function (done) {
            const input = {
                NUMBER: '1',
            }
            const expected = {
                NUMBER: '1',
            }
            const expectedForEnv = {
                NUMBER: '1',
            }

            Object.assign(process.env, input)
            const dotenvConfig = {
                parsed: input,
            }

            const dotenvConfigParsed = dotenvConversion.make(dotenvConfig, {
                specs: {
                    NUMBER: {method: 'bool'},
                },
            }).parsed

            dotenvConfigParsed.should.deep.include(expected)
            dotenvConversion.env.should.deep.include(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('conversion: custom (native supported => custom conversion : json => custom json)', function (done) {
            const input = {
                JSON: '{"foo":"bar"}',
            }
            const expected = {
                JSON: {
                    original: '{"foo":"bar"}',
                    parsed: {
                        foo: 'bar',
                    },
                },
            }
            const expectedForEnv = {
                JSON: '{"original":"{\\"foo\\":\\"bar\\"}","parsed":{"foo":"bar"}}',
            }

            Object.assign(process.env, input)
            const dotenvConfig = {
                parsed: input,
            }

            const dotenvConfigParsed = dotenvConversion.make(dotenvConfig, {
                specs: {
                    JSON(value) {
                        return {
                            original: value,
                            parsed: JsonHandler.parse(value),
                        }
                    },
                },
            }).parsed

            dotenvConfigParsed.should.deep.include(expected)
            dotenvConversion.env.should.deep.include(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('conversion: custom (override native supported : override json)', function (done) {
            const input = {
                JSON_1: '{"foo":"bar"}',
                JSON_2: '{"a":"b"}',
            }
            const expected = {
                JSON_1: {
                    original: '{"foo":"bar"}',
                    parsed: {
                        foo: 'bar',
                    },
                },
                JSON_2: {
                    original: '{"a":"b"}',
                    parsed: {
                        a: 'b',
                    },
                },
            }
            const expectedForEnv = {
                JSON_1: '{"original":"{\\"foo\\":\\"bar\\"}","parsed":{"foo":"bar"}}',
                JSON_2: '{"original":"{\\"a\\":\\"b\\"}","parsed":{"a":"b"}}',
            }

            Object.assign(process.env, input)
            const dotenvConfig = {
                parsed: input,
            }

            const dotenvConfigParsed = dotenvConversion.make(dotenvConfig, {
                override: {
                    json(value) {
                        try {
                            return {
                                original: value,
                                parsed: JsonHandler.parse(value),
                            }
                        } catch (e) {
                            return value
                        }
                    },
                },
            }).parsed

            dotenvConfigParsed.should.deep.include(expected)
            dotenvConversion.env.should.deep.include(expected)
            process.env.should.deep.include(expectedForEnv)
            done()
        })

        it('prevent from conversion', function (done) {
            const input = {
                BOOL: 'bool:true',
            }
            const expected = {
                BOOL: 'bool:true',
            }

            Object.assign(process.env, input)
            const dotenvConfig = {
                parsed: input,
            }

            const dotenvConfigParsed = dotenvConversion.make(dotenvConfig, {
                prevents: ['BOOL'],
            }).parsed

            dotenvConfigParsed.should.deep.include(expected)
            dotenvConversion.env.should.deep.include(expected)
            process.env.should.deep.include(expected)
            done()
        })

        it('getenv', function (done) {
            const input = {
                RAW: 'raw',
                BOOL: 'yes',
            }
            const expected = {
                RAW: 'raw',
                BOOL: true,
            }
            const expectedEnv = {
                RAW: 'raw',
                BOOL: 'true',
            }

            Object.assign(process.env, input)
            const dotenvConfig = {parsed: input}
            dotenvConversion.make(dotenvConfig)

            dotenvConversion.getenv('RAW').should.deep.equal('raw')
            dotenvConversion.getenv('BOOL').should.deep.equal(true)
            dotenvConversion.getenv('UNKNOWN').should.deep.equal('')
            dotenvConversion.getenv().should.deep.include(expected)
            process.env.should.deep.include(expectedEnv)
            done()
        })

        it('getenv and ignore process.env', function (done) {
            const input = {
                RAW: 'raw',
                BOOL: 'yes',
            }
            const expected = {
                RAW: 'raw',
                BOOL: true,
            }
            const expectedEnv = {
                RAW: 'raw',
                BOOL: 'yes',
            }

            Object.assign(process.env, input)
            const dotenvConfig = {
                ignoreProcessEnv: true,
                parsed: input,
            }
            dotenvConversion.make(dotenvConfig)

            dotenvConversion.getenv('RAW').should.deep.equal('raw')
            dotenvConversion.getenv('BOOL').should.deep.equal(true)
            dotenvConversion.getenv('UNKNOWN').should.deep.equal('')
            dotenvConversion.getenv().should.deep.include(expected)
            process.env.should.deep.include(expectedEnv)
            done()
        })
    })
})