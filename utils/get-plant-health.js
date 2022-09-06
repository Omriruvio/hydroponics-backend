const tf = require('@tensorflow/tfjs-node');
const automl = require('@tensorflow/tfjs-automl');
const fs = require('fs');
const path = require('path');

const loadDictionary = (modelUrl) => {
  modelUrl = path.resolve(modelUrl);
  const lastIndexOfSlash = modelUrl.lastIndexOf(path.normalize('/'));
  const prefixUrl = lastIndexOfSlash >= 0 ? modelUrl.slice(0, lastIndexOfSlash + 1) : '';
  const dictUrl = `${prefixUrl}dict.txt`;
  const text = fs.readFileSync(dictUrl, { encoding: 'utf-8' });
  return text.trim().split('\n');
};

const loadImageClassification = async (modelUrl) => {
  const [model, dict] = await Promise.all([tf.loadGraphModel(`file://${modelUrl}`), loadDictionary(modelUrl)]);
  return new automl.ImageClassificationModel(model, dict);
};

const decodeImage = (image) => {
  const arrByte = Uint8Array.from(Buffer.from(image));
  return tf.node.decodeImage(arrByte);
};

/**
 * Middleware to predict plant health via ML model.
 * Adds request.body.plantHealth as an array:
 * [
 *  {label: 'healthy', prob: float[0-1]}
 *  {label: 'deficiencies', prob: float[0-1]}
 *  {label: 'aphids_and_mealybugs', prob: float[0-1]}
 * ]
 */

const getPlantHealth = async (req, res, next) => {
  if (req.body.imageUrl) {
    try {
      const modelURL = path.join(__dirname, '/plant-health-ml-model/model.json');
      const model = await loadImageClassification(modelURL);
      const image = await fetch(req.body.imageUrl).then((res) => res.arrayBuffer());
      const decodedImage = decodeImage(image);
      const result = await model.classify(decodedImage);
      req.body.plantHealth = result;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
};

module.exports = { getPlantHealth };
