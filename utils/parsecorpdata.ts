interface ParsedData {
  temperature: number | null;
  humidity: number | null;
  ph: number | null;
  ec: number | null;
}

const dataDictionary = new Map<Array<string>, string>([
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

const parseCropData = (messageBody: string): ParsedData => {
  const parsed: ParsedData = { temperature: null, humidity: null, ph: null, ec: null };
  messageBody = messageBody?.toLowerCase().replace(/\s+/, ' ');
  // for each of possible data strings, look for matches and
  // their corresponding following number value
  dataDictionary.forEach((key, options) => {
    options.forEach((option) => {
      // const regexp = new RegExp(`(?<=(?<=\\b|[0-9])${option}(?![a-z]))(.*?)?-?\\d+\\.?\\d*`);
      const regexp = new RegExp(`(?<=(?<=\\b|[0-9])${option}(?![a-z]))(\\s*|\\s?:\\s?)?(?:-?\\d+\\.?\\d*)`);
      const result = messageBody?.match(regexp)?.[0] || null;
      if (result) parsed[key] = parseFloat(result);
    });
  });
  for (const key of dataDictionary.values()) {
    if (!parsed[key]) parsed[key] = null;
  }
  return parsed;
};

module.exports = parseCropData;
