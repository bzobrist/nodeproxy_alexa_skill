/* eslint-disable no-use-before-define */
/* eslint-disable global-require */

const Alexa = require('ask-sdk-core');

/* Create URL base */
const http = 'http';
const homeIP = '10.1.1.10';
const homePort = '8888';
const basePath = '/plugins/rnet';

/* Configure password */
const stnpKey = "stnp-auth";
const stnpValue = 'secret';
// For now you need to edit line 210 with the correct stnpValue (password)

const GetRemoteDataHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
      || (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetRemoteDataIntent');
  },
  async handle(handlerInput) {
    let outputSpeech = 'This is the default message.';
    await getRemoteData(`${http}://${homeIP}:${homePort}${basePath}/discover`)
      .then((response) => {
        const data = JSON.parse(response);
        outputSpeech = `There are currently ${data.controllers[0].zones.length} zones. `;
        for (let i = 0; i < data.controllers[0].zones.length; i += 1) {
          if (i === 0) {
            // first record
            outputSpeech = `${outputSpeech}Their zones are: ${data.controllers[0].zones[i].name}, `;
          } else if (i === data.controllers[0].zones.length - 1) {
            // last record
            outputSpeech = `${outputSpeech}and ${data.controllers[0].zones[i].name}.`;
          } else {
            // middle record(s)
            outputSpeech = `${outputSpeech + data.controllers[0].zones[i].name}, `;
          }
        }
      })
      .catch((err) => {
        console.log(`ERROR: ${err.message}`);
        // set an optional error message here
        // outputSpeech = err.message;
      });

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .getResponse();
  },
};

const TurnZoneOnOffHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'TurnZoneOnOffIntent');
  },
  async handle(handlerInput) {
    var zone;
    var action;
    var action_num;
    var outputSpeech;
    zone = handlerInput.requestEnvelope.request.intent.slots.Zone.value;
    action = handlerInput.requestEnvelope.request.intent.slots.Action.value;
    if (action === "on") {
      action_num = 1;
    } else {
      action_num = 0;
    }
    await getRemoteData(`${http}://${homeIP}:${homePort}${basePath}/controllers/0/zones/${zone}/state/${action_num}`)
      .then((response) => {
        const data = JSON.parse(response);
        outputSpeech = `Zone ${zone} is ${action}.`;
      })
      .catch((err) => {
        console.log(`ERROR: ${err.message}`);
        // set an optional error message here
        // outputSpeech = err.message;
      });

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .getResponse()

  },
};

const SetZoneSourceHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'SetZoneSourceIntent');
  },
  async handle(handlerInput) {
    var zone;
    var source;
    var outputSpeech;
    zone = handlerInput.requestEnvelope.request.intent.slots.Zone.value;
    source = handlerInput.requestEnvelope.request.intent.slots.Source.value;
    await getRemoteData(`${http}://${homeIP}:${homePort}${basePath}/controllers/0/zones/${zone}/source/${source}`)
      .then((response) => {
        const data = JSON.parse(response);
        outputSpeech = `Zone ${zone} is set to source ${source}.`;
      })
      .catch((err) => {
        console.log(`ERROR: ${err.message}`);
        // set an optional error message here
        // outputSpeech = err.message;
      });

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .getResponse()

  },
};

const AllOnOffHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AllOnOffIntent');
  },
  async handle(handlerInput) {
    var action;
    var action_num;
    var outputSpeech;
    action = handlerInput.requestEnvelope.request.intent.slots.Action.value;
    if (action === "on") {
      action_num = 1;
    } else {
      action_num = 0;
    }
    await getRemoteData(`${http}://${homeIP}:${homePort}${basePath}/controllers/0/zones/0/all/${action_num}`)
      .then((response) => {
        const data = JSON.parse(response);
        outputSpeech = `All Zones are ${action}.`;
      })
      .catch((err) => {
        console.log(`ERROR: ${err.message}`);
        // set an optional error message here
        // outputSpeech = err.message;
      });

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .getResponse()

  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can introduce yourself by telling me your name';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const getRemoteData = (url) => new Promise((resolve, reject) => {
  const client = url.startsWith('https') ? require('https') : require('http');
  const options = {
    headers: {
        "stnp-auth": "secret" 
    }
  }
  const request = client.get(url, options, (response) => {
    if (response.statusCode < 200 || response.statusCode > 299) {
      reject(new Error(`Failed with status code: ${response.statusCode}`));
    }
    const body = [];
    response.on('data', (chunk) => body.push(chunk));
    response.on('end', () => resolve(body.join('')));
  });
  request.on('error', (err) => reject(err));
});

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetRemoteDataHandler,
    TurnZoneOnOffHandler,
    SetZoneSourceHandler,
    AllOnOffHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
