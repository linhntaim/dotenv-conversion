"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
/* region env-utils */

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
 */

var NUMBER_REGEX = /^[+-]?((\d+(\.(\d*)?)?)|(\.\d+))(e[+-]?\d+)?$/i;
var BIGINT_REGEX = /^[+-]?\d+n$/;
var SYMBOL_REGEX = /^Symbol\(.*\)$/;
var ARRAY_REGEX = /^\[.*\]$/;
var JSON_REGEX = /^\{.*\}$/;
var NULL_VALUES = ['null', 'Null', 'NULL'];
var UNDEFINED_VALUES = ['undefined', 'UNDEFINED'];
var TRUE_VALUES = ['true', 'True', 'TRUE', 'yes', 'Yes', 'YES'];
var FALSE_VALUES = ['false', 'False', 'FALSE', 'no', 'No', 'NO'];
var NAN_VALUES = ['NaN'];
var INFINITY_VALUES = ['Infinity', '-Infinity', '+Infinity'];

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
 * @param {string} value
 * @param {boolean} fromDotEnv
 * @returns {null|undefined|boolean|number|bigint|string|symbol|array|object}
 */
function restoreValue(value, fromDotEnv) {
  if (fromDotEnv) {
    value = unescapeValue(value);
  }
  var trimmed = value.trim();
  switch (true) {
    case NULL_VALUES.includes(trimmed):
      return null;
    case UNDEFINED_VALUES.includes(trimmed):
      return undefined;
    case TRUE_VALUES.includes(trimmed):
      return true;
    case FALSE_VALUES.includes(trimmed):
      return false;
    case [].concat(NAN_VALUES, INFINITY_VALUES).includes(trimmed):
    case NUMBER_REGEX.test(trimmed):
      return Number(trimmed);
    case BIGINT_REGEX.test(trimmed):
      return BigInt(trimmed.slice(0, -1));
    case SYMBOL_REGEX.test(trimmed):
      return Symbol(trimmed.slice(7, -1));
    case ARRAY_REGEX.test(trimmed):
    case JSON_REGEX.test(trimmed):
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        return value;
      }
    default:
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
}

/**
 *
 * @param {null|undefined|boolean|number|bigint|string|symbol|array|object} value
 * @returns {string}
 */
function flattenValue(value) {
  var typeOf = _typeof(value);
  switch (true) {
    case value === null:
    case typeOf === 'function':
      return 'null';
    case typeOf === 'undefined':
      return 'undefined';
    case typeOf === 'string':
      return value;
    case typeOf === 'number':
    case value instanceof Number:
    case typeOf === 'boolean':
    case value instanceof Boolean:
    case typeOf === 'symbol':
    case value instanceof String:
      return value.toString();
    case typeOf === 'bigint':
    case value instanceof BigInt:
      return "".concat(value.toString(), "n");
    default:
      // `JSON.stringify` can wrap value with double quotes.
      // E.g. `JSON.stringify(new Date)` will result a string looks like `'"2023-..."'`.
      // We surely want the string to be without the double quotes. (Don't we?)
      // But currently, the code won't reach that case.
      // So we do not need to handle it now.
      return JSON.stringify(value);
  }
}

/* endregion */

var INTEGER_REGEX = /^[+-]?\d+$/;
var FORCING_FALSE_VALUES = [].concat(FALSE_VALUES, NULL_VALUES, UNDEFINED_VALUES, NAN_VALUES, ['not', 'Not', 'NOT', 'none', 'None', 'NONE']);
function defaultConfig() {
  return {
    parsed: {},
    fromDotEnv: true,
    ignoreProcessEnv: false,
    prevents: [],
    specs: {},
    methods: {
      auto: function auto(value, name, config) {
        value = restoreValue(value, config.fromDotEnv);
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
      "boolean": function boolean(value) {
        value = value.trim();
        if (!value) {
          return false;
        }
        return !FORCING_FALSE_VALUES.includes(value) && function (isNumber, isBigInt) {
          return !isNumber && !isBigInt || isNumber && Number(value) !== 0 || isBigInt && BigInt(value.slice(0, -1)) !== 0n;
        }(NUMBER_REGEX.test(value), BIGINT_REGEX.test(value));
      },
      number: function number(value) {
        value = value.trim();
        if (!value) {
          return 0;
        }
        if (TRUE_VALUES.includes(value)) {
          return 1;
        }
        if (FORCING_FALSE_VALUES.includes(value)) {
          return 0;
        }
        value = Number.parseFloat(value);
        return Number.isNaN(value) ? 0 : value;
      },
      bigint: function bigint(value) {
        value = value.trim();
        if (!value) {
          return 0n;
        }
        if (TRUE_VALUES.includes(value)) {
          return 1n;
        }
        if (FORCING_FALSE_VALUES.includes(value)) {
          return 0n;
        }
        if (INFINITY_VALUES.includes(value)) {
          return 0n;
        }
        if (INTEGER_REGEX.test(value)) {
          return BigInt(value);
        }
        if (BIGINT_REGEX.test(value)) {
          return BigInt(value.slice(0, -1));
        }
        value = Number.parseFloat(value);
        switch (true) {
          case Number.isNaN(value):
            return 0n;
          case Number.isInteger(value):
            return BigInt(value);
          default:
            return BigInt(Number.parseInt(value));
        }
      },
      string: function string(value) {
        return value;
      },
      symbol: function symbol(value) {
        var trimmed = value.trim();
        if (SYMBOL_REGEX.test(trimmed)) {
          return Symbol(trimmed.slice(7, -1));
        }
        return Symbol(value);
      },
      array: function array(value) {
        var trimmed = value.trim();
        if (!trimmed) {
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
        if (!trimmed) {
          return {};
        }
        try {
          return JSON.parse(JSON_REGEX.test(trimmed) ? trimmed : "{".concat(trimmed, "}"));
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
      // not use name of existing methods or aliases
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
  config = mergeConfig(config);
  var environment = config.ignoreProcessEnv ? {} : process.env;
  for (var configKey in config.parsed) {
    var value = Object.prototype.hasOwnProperty.call(environment, configKey) ? environment[configKey] : config.parsed[configKey];
    config.parsed[configKey] = convertValue(value, configKey, config);
  }
  for (var processKey in config.parsed) {
    environment[processKey] = flattenValue(config.parsed[processKey]);
  }
  return config;
}
var _default = exports["default"] = {
  convert: convert
};
module.exports = exports.default;