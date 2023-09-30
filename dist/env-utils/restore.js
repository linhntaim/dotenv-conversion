"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.SYMBOL_REGEX=exports.NUMBER_REGEX=exports.JSON_REGEX=exports.BIGINT_REGEX=exports.ARRAY_REGEX=void 0;exports.restoreValue=restoreValue;exports.restoreValues=restoreValues;var NUMBER_REGEX=exports.NUMBER_REGEX=/^[+-]?(\d*\.)?\d+(e[+-]?\d+)?$/i;var BIGINT_REGEX=exports.BIGINT_REGEX=/^[+-]?\d+n$/;var SYMBOL_REGEX=exports.SYMBOL_REGEX=/^Symbol\(.*\)$/;var ARRAY_REGEX=exports.ARRAY_REGEX=/^\[.*\]$/;var JSON_REGEX=exports.JSON_REGEX=/^\{.*\}$/;function unescapeValue(value){return value.replaceAll("\\\"","\"").replaceAll("\\\\","\\")}function restoreValue(value){switch(true){case["null","Null","NULL"].includes(value):return null;case["undefined","UNDEFINED"].includes(value):return undefined;case["true","True","TRUE","yes","Yes","YES"].includes(value):return true;case["false","False","FALSE","no","No","NO"].includes(value):return false;case["NaN","Infinity","-Infinity","+Infinity"].includes(value):case NUMBER_REGEX.test(value):return Number(value);case BIGINT_REGEX.test(value):return BigInt(value.slice(0,-1));default:value=unescapeValue(value);switch(true){case SYMBOL_REGEX.test(value):try{return Symbol(value.slice(7,-1))}catch(e){return value}case ARRAY_REGEX.test(value):case JSON_REGEX.test(value):try{return JSON.parse(value)}catch(e){return value}default:return value}}}function restoreValues(values){var restoringValues={};for(var key in values){restoringValues[key]=restoreValue(values[key])}return restoringValues}
//# sourceMappingURL=restore.js.map