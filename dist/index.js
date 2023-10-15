"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
 */

var NUMBER_REGEX = /^[+-]?(\d+(\.(\d*)?)?|\.\d+)([eE][+-]?\d+)?$/;
var NUM_BOH_REGEX = /^[+-]?0([bB][01]+|[oO][0-8]+|[xX][0-9a-fA-F]+)$/;
var BIGINT_REGEX = /^[+-]?\d+n$/;
var BIG_BOH_REGEX = /^[+-]?0([bB][01]+|[oO][0-8]+|[xX][0-9a-fA-F]+)n$/;
var SYMBOL_REGEX = /^Symbol\(.*\)$/;
var ARRAY_REGEX = /^\[.*]$/;
var ARRAY_EMPTY_REGEX = /^\[\s*]$/;
var OBJECT_REGEX = /^\{.*}$/;
var OBJECT_EMPTY_REGEX = /^\{\s*}$/;
var NULL_VALUES = ['null', 'Null', 'NULL'];
var UNDEFINED_VALUES = ['undefined', 'UNDEFINED'];
var TRUE_VALUES = ['true', 'True', 'TRUE', 'yes', 'Yes', 'YES', 'ok', 'Ok', 'OK'];
var FALSE_VALUES = ['false', 'False', 'FALSE', 'no', 'No', 'NO', 'not', 'Not', 'NOT', 'none', 'None', 'NONE'];
var NAN_VALUES = ['NaN'];
var INFINITY_POSITIVE_VALUES = ['Infinity', '+Infinity'];
var INFINITY_NEGATIVE_VALUES = ['-Infinity'];

/**
 *
 * @param {array} stringValues
 * @param {*} value
 * @param {object} valueTable
 * @returns {object}
 */
function makeValueTable(stringValues, value) {
  var valueTable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  stringValues.forEach(function (stringValue) {
    return valueTable[stringValue] = value;
  });
  return valueTable;
}

/**
 *
 * @param {string} value
 * @returns {string}
 */
function unescapeValue(value) {
  return value.replaceAll('\\"', '"').replaceAll('\\\\', '\\');
}

/**
 *
 * @param {number} number
 * @returns {number}
 */
function safeZero(number) {
  return 0 === number ? 0 : number;
}

/**
 *
 * @param {string} str
 * @returns {number}
 */
function parseNumber(str) {
  return safeZero(Number(str));
}

/**
 *
 * @param {string} str
 * @returns {number}
 */
function parseBohNumber(str) {
  switch (str[0]) {
    case '+':
      return Number(str.substring(1));
    case '-':
      return safeZero(-Number(str.substring(1)));
    default:
      return Number(str);
  }
}

/**
 *
 * @param {string} str
 * @returns {bigint}
 */
function parseBigInt(str) {
  return BigInt(str.slice(0, -1));
}

/**
 *
 * @param {string} str
 * @returns {bigint}
 */
function parseBohBigInt(str) {
  switch (str[0]) {
    case '+':
      return BigInt(str.slice(1, -1));
    case '-':
      return -BigInt(str.slice(1, -1));
    default:
      return BigInt(str.slice(0, -1));
  }
}

/**
 *
 * @param {number} number
 * @returns {bigint}
 */
function numberAsBigInt(number) {
  return BigInt(Math.trunc(number));
}

/**
 *
 * @param {string} str
 * @returns {symbol}
 */
function parseSymbol(str) {
  return Symbol(str.slice(7, -1));
}

/**
 *
 * @param {string} value
 * @param {object} valueTable
 * @param {boolean} fromDotEnv
 * @returns {null|undefined|boolean|number|bigint|string|symbol|array|object}
 */
function restoreValue(value, valueTable, fromDotEnv) {
  if (fromDotEnv) {
    value = unescapeValue(value);
  }
  var trimmed = value.trim();
  if (trimmed in valueTable) {
    return valueTable[trimmed];
  }
  // Number
  if (NUMBER_REGEX.test(trimmed)) {
    return parseNumber(trimmed);
  }
  if (NUM_BOH_REGEX.test(trimmed)) {
    return parseBohNumber(trimmed);
  }
  // BigInt
  if (BIGINT_REGEX.test(trimmed)) {
    return parseBigInt(trimmed);
  }
  if (BIG_BOH_REGEX.test(trimmed)) {
    return parseBohBigInt(trimmed);
  }
  // Symbol
  if (SYMBOL_REGEX.test(trimmed)) {
    return parseSymbol(trimmed);
  }
  // Object
  if (ARRAY_REGEX.test(trimmed) || OBJECT_REGEX.test(trimmed)) {
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      return value;
    }
  }
  // Empty
  if (trimmed === '') {
    return value;
  }
  // Unwrapped Object or String
  try {
    return JSON.parse("[".concat(trimmed, "]"));
  } catch (e) {
    try {
      return JSON.parse("{".concat(trimmed, "}"));
    } catch (e) {
      return value;
    }
  }
}

/**
 *
 * @param {null|undefined|boolean|number|bigint|string|symbol|array|object|function} value
 * @returns {string}
 */
function flattenValue(value) {
  var typeOf = _typeof(value);
  if (value === null) {
    return 'null';
  }
  if (typeOf === 'string') {
    return value;
  }
  if (typeOf === 'number' || typeOf === 'boolean' || typeOf === 'symbol' || value instanceof Number || value instanceof Boolean || value instanceof String || value instanceof Symbol) {
    return value.toString();
  }
  if (typeOf === 'bigint' || value instanceof BigInt) {
    return "".concat(value.toString(), "n");
  }
  if (typeOf === 'undefined' || typeOf === 'function' || value instanceof Function) {
    return 'undefined';
  }
  try {
    return function (str) {
      return str === undefined ? 'undefined' : /^".*"$/.test(str) ? str.slice(1, -1) : str;
    }(JSON.stringify(value));
  } catch (e) {
    return 'undefined';
  }
}
function defaultConfig() {
  return {
    parsed: {},
    fromDotEnv: true,
    ignoreProcessEnv: false,
    prevents: [],
    specs: {},
    methods: {
      auto: function auto(value, name, config) {
        value = restoreValue(value, config._cache.valueTables.forAutoForced, config.fromDotEnv);
        if (typeof value === 'string') {
          var lTrimmed = value.replace(/^\s+/, '');
          var findPossibleMethod = function findPossibleMethod(methods) {
            return methods.find(function (method) {
              return lTrimmed.startsWith("".concat(method, ":"));
            });
          };
          var possibleMethod;
          // find in methods
          possibleMethod = findPossibleMethod(Object.keys(this));
          if (possibleMethod) {
            return this[possibleMethod](lTrimmed.substring(possibleMethod.length + 1), name, config);
          }
          // find in aliases
          possibleMethod = findPossibleMethod(Object.keys(config.methodAliases));
          if (possibleMethod) {
            return this[config.methodAliases[possibleMethod]](lTrimmed.substring(possibleMethod.length + 1), name, config);
          }
          return this.string(value);
        }
        return value;
      },
      "boolean": function boolean(value, name, config) {
        value = value.trim();
        var valueTable = config._cache.valueTables.forBooleanForced;
        if (value in valueTable) {
          return valueTable[value];
        }
        if (ARRAY_EMPTY_REGEX.test(value) || OBJECT_EMPTY_REGEX.test(value)) {
          return false;
        }
        if (NUMBER_REGEX.test(value)) {
          return parseNumber(value) !== 0;
        }
        if (NUM_BOH_REGEX.test(value)) {
          return parseBohNumber(value) !== 0;
        }
        if (BIGINT_REGEX.test(value)) {
          return parseBigInt(value) !== 0n;
        }
        if (BIG_BOH_REGEX.test(value)) {
          return parseBohBigInt(value) !== 0n;
        }
        return true;
      },
      number: function number(value, name, config) {
        value = value.trim();
        var valueTable = config._cache.valueTables.forNumberForced;
        if (value in valueTable) {
          return valueTable[value];
        }
        if (ARRAY_EMPTY_REGEX.test(value) || OBJECT_EMPTY_REGEX.test(value)) {
          return 0;
        }
        if (NUMBER_REGEX.test(value)) {
          return parseNumber(value);
        }
        if (NUM_BOH_REGEX.test(value)) {
          return parseBohNumber(value);
        }
        if (BIGINT_REGEX.test(value)) {
          return parseNumber(value.slice(0, -1));
        }
        if (BIG_BOH_REGEX.test(value)) {
          return parseBohNumber(value.slice(0, -1));
        }
        return function (number) {
          return Number.isNaN(number) ? 0 : safeZero(number);
        }(Number.parseFloat(value));
      },
      bigint: function bigint(value, name, config) {
        value = value.trim();
        var valueTable = config._cache.valueTables.forBigIntForced;
        if (value in valueTable) {
          return valueTable[value];
        }
        if (ARRAY_EMPTY_REGEX.test(value) || OBJECT_EMPTY_REGEX.test(value)) {
          return 0n;
        }
        if (NUMBER_REGEX.test(value)) {
          return numberAsBigInt(parseNumber(value));
        }
        if (NUM_BOH_REGEX.test(value)) {
          return numberAsBigInt(parseBohNumber(value));
        }
        if (BIGINT_REGEX.test(value)) {
          return parseBigInt(value);
        }
        if (BIG_BOH_REGEX.test(value)) {
          return parseBohBigInt(value);
        }
        return function (number) {
          return Number.isNaN(number) ? 0n : numberAsBigInt(safeZero(number));
        }(Number.parseFloat(value));
      },
      string: function string(value) {
        return value;
      },
      symbol: function symbol(value) {
        var trimmed = value.trim();
        if (SYMBOL_REGEX.test(trimmed)) {
          return parseSymbol(trimmed);
        }
        return Symbol(value);
      },
      array: function array(value) {
        var trimmed = value.trim();
        if (trimmed === '') {
          return [];
        }
        try {
          return JSON.parse(ARRAY_REGEX.test(trimmed) ? trimmed : "[".concat(trimmed, "]"));
        } catch (e) {
          return this.string(value);
        }
      },
      object: function object(value) {
        var trimmed = value.trim();
        if (trimmed === '') {
          return {};
        }
        try {
          return JSON.parse(OBJECT_REGEX.test(trimmed) ? trimmed : "{".concat(trimmed, "}"));
        } catch (e) {
          return this.string(value);
        }
      }
    },
    methodAliases: {
      bool: 'boolean',
      num: 'number',
      big: 'bigint',
      str: 'string',
      arr: 'array',
      obj: 'object'
    }
  };
}
function mergeConfig(config) {
  var mergingConfig = defaultConfig();
  if ('parsed' in config) {
    mergingConfig.parsed = config.parsed;
  }
  if ('fromDotEnv' in config) {
    mergingConfig.fromDotEnv = config.fromDotEnv;
  }
  if ('ignoreProcessEnv' in config) {
    mergingConfig.ignoreProcessEnv = config.ignoreProcessEnv;
  }
  if ('prevents' in config) {
    mergingConfig.prevents = config.prevents;
  }
  if ('specs' in config) {
    mergingConfig.specs = config.specs;
  }
  if ('methods' in config) {
    Object.keys(config.methods).forEach(function (method) {
      if (!/^[\w.]+$/.test(method)) {
        throw 'Method: Invalid format';
      }
    });
    Object.assign(mergingConfig.methods, config.methods);
  }
  if ('methodAliases' in config) {
    for (var alias in config.methodAliases) {
      // not override existing alias
      if (alias in mergingConfig.methodAliases) {
        continue;
      }
      // not use name of existing methods
      if (alias in mergingConfig.methods) {
        continue;
      }
      // only add alias to existing methods
      var method = config.methodAliases[alias];
      if (method in mergingConfig.methods) {
        if (!/^[\w.]+$/.test(alias)) {
          throw 'Alias: Invalid format';
        }
        mergingConfig.methodAliases[alias] = method;
      }
    }
  }
  return mergingConfig;
}
function beforeConfig(config) {
  config._cache = {
    valueTables: {
      forAutoForced: makeValueTable(INFINITY_NEGATIVE_VALUES, Number.NEGATIVE_INFINITY, makeValueTable(INFINITY_POSITIVE_VALUES, Number.POSITIVE_INFINITY, makeValueTable(NAN_VALUES, Number.NaN, makeValueTable(FALSE_VALUES, false, makeValueTable(TRUE_VALUES, true, makeValueTable(UNDEFINED_VALUES, undefined, makeValueTable(NULL_VALUES, null))))))),
      forBooleanForced: makeValueTable(INFINITY_NEGATIVE_VALUES, true, makeValueTable(INFINITY_POSITIVE_VALUES, true, makeValueTable(NAN_VALUES, false, makeValueTable(FALSE_VALUES, false, makeValueTable(TRUE_VALUES, true, makeValueTable(UNDEFINED_VALUES, false, makeValueTable([''].concat(NULL_VALUES), false))))))),
      forNumberForced: makeValueTable(INFINITY_NEGATIVE_VALUES, Number.NEGATIVE_INFINITY, makeValueTable(INFINITY_POSITIVE_VALUES, Number.POSITIVE_INFINITY, makeValueTable(NAN_VALUES, Number.NaN, makeValueTable(FALSE_VALUES, 0, makeValueTable(TRUE_VALUES, 1, makeValueTable(UNDEFINED_VALUES, Number.NaN, makeValueTable([''].concat(NULL_VALUES), 0))))))),
      forBigIntForced: makeValueTable(INFINITY_NEGATIVE_VALUES, -1n, makeValueTable(INFINITY_POSITIVE_VALUES, 1n, makeValueTable(NAN_VALUES, 0n, makeValueTable(FALSE_VALUES, 0n, makeValueTable(TRUE_VALUES, 1n, makeValueTable(UNDEFINED_VALUES, 0n, makeValueTable([''].concat(NULL_VALUES), 0n)))))))
    }
  };
  return config;
}
function afterConfig(config) {
  delete config._cache;
  return config;
}
function convertValue(value, name, config) {
  if (config.prevents.includes(name)) {
    return value;
  }
  if (name in config.specs) {
    var method = config.specs[name];
    switch (_typeof(method)) {
      case 'string':
        if (method in config.methods) {
          return config.methods[method](value, name, config);
        }
        if (method in config.methodAliases) {
          return config.methods[config.methodAliases[method]](value, name, config);
        }
        return config.methods.string(value, name, config);
      case 'function':
        return method(value, name, config);
      default:
        return config.methods.string(value, name, config);
    }
  }
  return config.methods.auto(value, name, config);
}
function convert() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  config = beforeConfig(mergeConfig(config));
  var environment = config.ignoreProcessEnv ? {} : process.env;
  for (var configKey in config.parsed) {
    var value = Object.prototype.hasOwnProperty.call(environment, configKey) ? environment[configKey] : config.parsed[configKey];
    config.parsed[configKey] = convertValue(value, configKey, config);
  }
  for (var processKey in config.parsed) {
    environment[processKey] = flattenValue(config.parsed[processKey]);
  }
  return afterConfig(config);
}
var _default = exports["default"] = {
  convert: convert
};
module.exports = exports.default;