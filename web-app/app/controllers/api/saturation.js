const express = require('express'),
  router = express.Router(),
  db = require('./../../models');

module.exports = function (app) {
  app.use('/api', router);
};

/**
 * Return all saturation values for a single plant.
 * @return
 *  object with the object arrays moisture, humidity, and temperature.
 *    moisture: [
 *      { plant_id, moisture, created_at, updated_at }
 *    ], 
 *    humidity: [
 *      { plant_id, humidity, created_at, updated_at }
 *    ], 
 *    temperature: [
 *      { plant_id, temperature, created_at, updated_at }
 *    ]
 */
router.get('/saturation/:plant_id', async function (req, res, next) {
  // TODO: Handle a bad request more robustly
  const moistureResult = await db.Moisture.findAll({
    where: { plantId: req.params.plant_id },
  });

  // TODO: should there be any logic for checking if the plant exists?
  // we are returning that there are no moisture values for this plant
  // but the plant might not exist at all

  let moistureValues = [];
  moistureResult.forEach((obj) => {
    moistureValues.push(obj.toJSON());
  });
  // moisture values are necessary
  if (moistureValues.length === 0) {
    return res
      .status(404)
      .json({ error: 'No moisture values found for this plant' });
  }
  
  const humidityResult = await db.Humidity.findAll({
    where: { plantId: req.params.plant_id },
  });
  let humidityValues = [];
  humidityResult.forEach((obj) => {
    humidityValues.push(obj.toJSON());
  });
  
  const temperatureResult = await db.Temperature.findAll({
    where: { plantId: req.params.plant_id }
  });
  let temperatureValues = [];
  temperatureResult.forEach((obj) => {
    temperatureValues.push(obj.toJSON());
  });
  
  const response = {
    moisture: moistureValues,
    humidity: humidityValues,
    temperature: temperatureResult
  }

  res.json(response);
});

/**
 * Return the most recent recorded saturation
 * @return
 *   Single Object with properties [plant_id, moisture, created_at, updated_at]
 */
router.get('/saturation/:plant_id/last', async function (req, res, next) {
  // TODO: Handle a bad request more robustly
  const moistureValues = await db.Moisture.findOne({
    where: { plantId: req.params.plant_id },
    order: [['createdAt', 'DESC']],
  });

  if (!moistureValues) {
    return res
      .status(404)
      .json({ error: 'No moisture values found for this plant' });
  }

  res.json(moistureValues);
});

/**
 * Create new moisture, humidity, and temperature values for a plant.
 */
router.post('/saturation', async function (req, res, next) {
  
  const macAddress = req.body.macAddress;

  const moistureValue = req.body.sensorVal;
  const humidityPercentValue = req.body.humidityPercentVal;
  const temperatureValue = req.body.temperatureVal;

  console.log('Received Saturation Value:', moistureValue);
  console.log('Received Humidity value: ', humidityPercentValue);
  console.log('Received temperature value: ', temperatureValue);
  console.log('From MAC Address:', macAddress);

  // Humidity and temperature are not required
  if (!moistureValue) {
    return res.status(400).json({ error: 'sensorVal is required' });
  }

  if (!macAddress) {
    return res.status(400).json({ error: 'macAddress is required' });
  }
  if(!temperatureValue) {
    console.log("No temperature value");
  }
  if(!humidityPercentValue) {
    console.log("No humidity value");
  }

  // Get our target plant (based on MAC address of POST request)
  const plant = await db.Plant.findOne({
    where: { MAC: macAddress },
  });

  if (!plant) {
    console.log(`No plant found with MAC address: ${macAddress}`);
    return res
      .status(404)
      .json({
        error: 'No plant found with the given MAC address',
        macAddress: macAddress,
      });
  }

  // Create a new Moisture instance
  const moisture = await db.Moisture.create({
    plantId: plant.id,
    moisture: moistureValue,
  });
  
  const newMoistureInstance = await moisture.save();
  console.log(`New moisture instance with value: ${newMoistureInstance.moisture} from ${newMoistureInstance.createdAt}`);

  // const allMoistureVals = await plant.getMoisture();
  // console.log("List of moisture values from every instance: ");
  // for (let n = 0; n < allMoistureVals.length; n++) {
  //   console.log(`${n}: ${allMoistureVals[n].moisture} from ${allMoistureVals[n].createdAt}`);
  // }

  if(humidityPercentValue) {
    // Create a new Humidity instance
    const humidity = await db.Humidity.create({
      plantId: plant.id,
      humidity: humidityPercentValue,
    })
  
    const newHumidityInstance = await moisture.save();
    console.log(`New humidity instance with value: ${newHumidityInstance.humidity} from ${newHumidityInstance.createdAt}`);

  //   const allHumidityVals = await plant.getHumidity();
  //   console.log("List of humidity values from every instance: ");
  //   for (let n = 0; n < allHumidityVals.length; n++) {
  //     console.log(`${n}: ${allHumidityVals[n].humidity} from ${allHumidityVals[n].createdAt}`);
  //   }
  }
  
  if(temperatureValue) {
    // Create a new Temperature instance
    const temperature = await db.Temperature.create({
      plantId: plant.id,
      temperature: temperatureValue,
    })
  
    const newTemperatureInstance = await moisture.save();
    console.log(`New temperature instance with value: ${newTemperatureInstance.temperature} from ${newTemperatureInstance.createdAt}`);

    // const allTemperatureVals = await plant.getTemperature();
    // console.log("List of temperature values from every instance: ");
    // for (let n = 0; n < allTemperatureVals.length; n++) {
    //   console.log(`${n}: ${allTemperatureVals[n].temperature} from ${allTemperatureVals[n].createdAt}`);
    // }
  }


  res.json({
    message: 'SUCCESS',
    plant: plant.toJSON(),
    macAddress: macAddress,
  });
});
