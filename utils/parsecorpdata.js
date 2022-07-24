var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var dataDictionary = new Map([
    [['temperature', 'temp', 'tmp', 't'], 'temperature'],
    [['humidity', 'hum', 'h'], 'humidity'],
    [['ec', 'e'], 'ec'],
    [['ph', 'p'], 'ph'],
]);
/**
 * Receives String messageBody containing "temp -number-, ph -number-,
 * humidity -number-" etc. in an arbitrary order, and with possible name mutations
 * such as temperature, hum, or uppercased versions of such values.
 *
 * - Values that were not provided will be returned as null.
 * - Values following invalid parameter names will be ignored.
 * - Duplicate values for same data parameter will resolve to last input.
 * @param messageBody String containing user sent crop data
 * @returns temperature, humidity, ph, ec
 */
var parseCropData = function (messageBody) {
    var e_1, _a;
    var parsed = {};
    messageBody = messageBody === null || messageBody === void 0 ? void 0 : messageBody.toLowerCase().replace(/\s+/, ' ');
    dataDictionary.forEach(function (key, options) {
        options.forEach(function (option) {
            var _a;
            var regexp = new RegExp("(?<=(?<=\\b|[0-9])".concat(option, "(?![a-z]))(\\s*|\\s?:\\s?)?(?:-?\\d+\\.?\\d*)"));
            var result = ((_a = messageBody === null || messageBody === void 0 ? void 0 : messageBody.match(regexp)) === null || _a === void 0 ? void 0 : _a[0]) || null;
            if (result)
                parsed[key] = parseFloat(result);
        });
    });
    try {
        for (var _b = __values(dataDictionary.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            if (!parsed[key])
                parsed[key] = null;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return parsed;
};
module.exports = parseCropData;
