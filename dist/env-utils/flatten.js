"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.flattenTo=flattenTo;exports.flattenValue=flattenValue;exports.flattenValues=flattenValues;var fs=_interopRequireWildcard(require("fs"));function _getRequireWildcardCache(nodeInterop){if(typeof WeakMap!=="function")return null;var cacheBabelInterop=new WeakMap;var cacheNodeInterop=new WeakMap;return(_getRequireWildcardCache=function _getRequireWildcardCache(nodeInterop){return nodeInterop?cacheNodeInterop:cacheBabelInterop})(nodeInterop)}function _interopRequireWildcard(obj,nodeInterop){if(!nodeInterop&&obj&&obj.__esModule){return obj}if(obj===null||_typeof(obj)!=="object"&&typeof obj!=="function"){return{"default":obj}}var cache=_getRequireWildcardCache(nodeInterop);if(cache&&cache.has(obj)){return cache.get(obj)}var newObj={};var hasPropertyDescriptor=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var key in obj){if(key!=="default"&&Object.prototype.hasOwnProperty.call(obj,key)){var desc=hasPropertyDescriptor?Object.getOwnPropertyDescriptor(obj,key):null;if(desc&&(desc.get||desc.set)){Object.defineProperty(newObj,key,desc)}else{newObj[key]=obj[key]}}}newObj["default"]=obj;if(cache){cache.set(obj,newObj)}return newObj}function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o},_typeof(o)}function flattenValue(value){var typeOf=_typeof(value);switch(true){/**
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
         */case value===null:case typeOf==="function":return"null";case typeOf==="undefined":return"undefined";case typeOf==="string":return value;case typeOf==="number":case value instanceof Number:case typeOf==="boolean":case value instanceof Boolean:case typeOf==="symbol":case value instanceof String:return value.toString();case typeOf==="bigint":case value instanceof BigInt:return"".concat(value.toString(),"n");default:return function(json){return json.match(/^".*"$/)?json.slice(1,-1).replaceAll("\\\"","\""):json}(JSON.stringify(value))}}function flattenValues(values){var flatteningValues={};for(var key in values){flatteningValues[key]=flattenValue(values[key])}return flatteningValues}function escapeValue(value){if(/[\s#]+/.test(value)){return"\"".concat(value.replaceAll("\\","\\\\").replaceAll("\"","\\\""),"\"")}return value}function flatten(values){var content="";for(var key in values){content+="".concat(key,"=").concat(escapeValue(flattenValue(values[key])),"\n")}return content}function flattenTo(values){var file=arguments.length>1&&arguments[1]!==undefined?arguments[1]:".env";fs.writeFileSync(file,flatten(values))}
//# sourceMappingURL=flatten.js.map