const { PROBABILITY, EMOJI } = require('../config');
const LIKELIHOOD = {
  POSITIVE: 'positive',
  LIKELY_POSITIVE: 'likely-positive',
  LIKELY_NEGATIVE: 'likely-negative',
  NEGATIVE: 'negative',
  UNCERTAIN: 'uncertain',
};

/**
 * Receives array of label/probablity objects, returns a structured message.
 * @param {[{ label: 'healthy', prob: number },{ label: 'deficiencies', prob: number },{ label: 'aphids_and_mealybugs', prob: number }]} plantHealth
 * @param {string} systemName
 * @returns {{
 * responseMessage: string,
 * healthState: {
 *  isHealthy: 'positive'|'likely-positive'|'likely-negative'|'negative'|'uncertain',
 *  hasPestPresence: 'positive'|'likely-positive'|'likely-negative'|'negative'|'uncertain',
 *  hasDeficiencies: 'positive'|'likely-positive'|'likely-negative'|'negative'|'uncertain',
 * }}} Object containing message and health state for the various categories
 */

const getImageResponseMessage = (plantHealth, systemName) => {
  const [health, deficiency, pests] = plantHealth;
  const healthState = {};
  const responseSections = {};

  if (systemName) responseSections.imageStored = `*Image has been stored for system - "${systemName}".*`;
  else responseSections.imageStored = '*Image has been stored.*';
  if (plantHealth?.length === 0 || !plantHealth) return responseSections.imageStored;
  responseSections.assesmentTitle = '\n\n*Crop assessment:*\n';
  responseSections.health = `General health - `;
  responseSections.deficiency = `Deficiencies - `;
  responseSections.pests = `Pest presence - `;
  responseSections.seemsHealthyOutput = `seems *healthy*. ${EMOJI.GOOD}\n`;
  responseSections.seemsDeficientOutput = `seems to have *deficiencies*. ${EMOJI.WARNING}\n`;
  responseSections.seemsInfestedOutput = `seems to have *pest presence*. ${EMOJI.WARNING}\n`;
  responseSections.noPredictionOutput = 'could not be clearly predicted.\n';
  responseSections.allUncertainOutput = 'All attempted predictions were uncertain.\nPlease provide an alternative or clearer image.';

  if (health.prob < PROBABILITY.HIGH && deficiency.prob < PROBABILITY.HIGH && pests.prob < PROBABILITY.HIGH) {
    return { responseMessage: `${responseSections.imageStored}\n\n${responseSections.allUncertainOutput}`, healthState, plantHealth };
  }

  let responseMessage = responseSections.imageStored + responseSections.assesmentTitle;
  const sectionArray = [];

  if (deficiency.prob >= 0 && deficiency.prob <= 1) {
    if (deficiency.prob >= PROBABILITY.HIGH) {
      healthState.hasDeficiencies = LIKELIHOOD.POSITIVE;
      sectionArray.unshift(responseSections.deficiency + responseSections.seemsDeficientOutput);
    } else {
      healthState.hasDeficiencies = LIKELIHOOD.UNCERTAIN;
      sectionArray.push(responseSections.deficiency + responseSections.noPredictionOutput);
    }
  }

  if (pests.prob >= 0 && pests.prob <= 1) {
    if (pests.prob >= PROBABILITY.HIGH) {
      healthState.hasPestPresence = LIKELIHOOD.POSITIVE;
      sectionArray.unshift(responseSections.pests + responseSections.seemsInfestedOutput);
    } else {
      healthState.hasPestPresence = LIKELIHOOD.UNCERTAIN;
      sectionArray.push(responseSections.pests + responseSections.noPredictionOutput);
    }
  }

  if (health.prob >= 0 && health.prob <= 1) {
    if (health.prob >= PROBABILITY.HIGH) {
      healthState.isHealthy = LIKELIHOOD.POSITIVE;
      sectionArray.unshift(responseSections.health + responseSections.seemsHealthyOutput);
    } else {
      healthState.isHealthy = LIKELIHOOD.UNCERTAIN;
      sectionArray.push(responseSections.health + responseSections.noPredictionOutput);
    }
  }

  responseMessage += sectionArray.join('');

  return { responseMessage, healthState, plantHealth };
};

module.exports = { getImageResponseMessage };
