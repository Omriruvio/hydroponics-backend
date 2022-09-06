const { PROBABILITY, EMOJI } = require('../config');
const LIKELIHOOD = {
  POSITIVE: 'positive',
  LIKELY_POSITIVE: 'likely-positive',
  LIKELY_NEGATIVE: 'likely-negative',
  NEGATIVE: 'negative',
};

/**
 * Receives array of label/probablity objects, returns a structured message.
 * @param {[{ label: 'healthy', prob: number },{ label: 'deficiencies', prob: number },{ label: 'aphids_and_mealybugs', prob: number }]} plantHealth
 * @returns {{
 * responseMessage: string,
 * healthState: {
 *  isHealthy: 'positive'|'likely-positive'|'likely-negative'|'negative',
 *  hasPestPresence: 'positive'|'likely-positive'|'likely-negative'|'negative',
 *  hasDeficiencies: 'positive'|'likely-positive'|'likely-negative'|'negative'
 * }}} Object containing message and health state for the various categories
 */

const getImageResponseMessage = (plantHealth) => {
  let responseMessage = 'Image has been stored.';
  if (plantHealth?.length === 0 || !plantHealth) return responseMessage;
  responseMessage += '\n\n*Crop assessment:*\n';
  const prefix = 'Your crop ';
  const [health, deficiency, pests] = plantHealth;
  const healthState = {};

  if (health.prob >= 0 && health.prob <= 1) {
    responseMessage += prefix;
    switch (true) {
      case health.prob < PROBABILITY.VERY_LOW:
        healthState.isHealthy = LIKELIHOOD.NEGATIVE;
        responseMessage += `seems very unhealthy. ${EMOJI.WARNING}\n`;
        break;
      case health.prob < PROBABILITY.LOW:
        healthState.isHealthy = LIKELIHOOD.LIKELY_NEGATIVE;
        responseMessage += `seems to have some health issues. ${EMOJI.WARNING}\n`;
        break;
      case health.prob < PROBABILITY.HIGH:
        healthState.isHealthy = LIKELIHOOD.LIKELY_POSITIVE;
        responseMessage += `seems mostly healthy, but might have some issues. ${EMOJI.NEUTRAL}\n`;
        break;

      default:
        healthState.isHealthy = LIKELIHOOD.POSITIVE;
        responseMessage += `seems very healthy. ${EMOJI.GOOD}\n`;
        break;
    }
  }

  if (deficiency.prob >= 0 && deficiency.prob <= 1) {
    responseMessage += prefix;
    switch (true) {
      case deficiency.prob < PROBABILITY.VERY_LOW:
        healthState.hasDeficiencies = LIKELIHOOD.NEGATIVE;
        responseMessage += `seems to have no deficiencies. ${EMOJI.GOOD}\n`;
        break;
      case deficiency.prob < PROBABILITY.LOW:
        healthState.hasDeficiencies = LIKELIHOOD.LIKELY_NEGATIVE;
        responseMessage += `seems unlikely to have major deficiencies. ${EMOJI.NEUTRAL}\n`;
        break;
      case deficiency.prob < PROBABILITY.HIGH:
        healthState.hasDeficiencies = LIKELIHOOD.LIKELY_POSITIVE;
        responseMessage += `seems to have some deficiencies. ${EMOJI.WARNING}\n`;
        break;
      default:
        healthState.hasDeficiencies = LIKELIHOOD.POSITIVE;
        responseMessage += `seems to have serious deficiencies. ${EMOJI.WARNING}\n`;
        break;
    }
  }

  if (pests.prob >= 0 && pests.prob <= 1) {
    responseMessage += prefix;
    switch (true) {
      case pests.prob < PROBABILITY.VERY_LOW:
        healthState.hasPestPresence = LIKELIHOOD.NEGATIVE;
        responseMessage += `does not seem to have pests. ${EMOJI.GOOD}\n`;
        break;
      case pests.prob < PROBABILITY.LOW:
        healthState.hasPestPresence = LIKELIHOOD.LIKELY_NEGATIVE;
        responseMessage += `seems unlikely to have pest presence. ${EMOJI.NEUTRAL}\n`;
        break;
      case pests.prob < PROBABILITY.HIGH:
        healthState.hasPestPresence = LIKELIHOOD.LIKELY_POSITIVE;
        responseMessage += `seems to have some pests present. ${EMOJI.WARNING}\n`;
        break;
      default:
        healthState.hasPestPresence = LIKELIHOOD.POSITIVE;
        responseMessage += `seems to suffer from major pest presence. ${EMOJI.WARNING}\n`;
        break;
    }
  }

  return { responseMessage, healthState };
};

module.exports = { getImageResponseMessage };
