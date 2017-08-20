'use strict';

var Alexa = require('alexa-sdk');
var DataHandler = require('./DataHandler.js');

var APP_ID = "amzn1.ask.skill.ab14aaa1-7cf8-4bb2-a9d7-cf1f7aebce11";

var SKILL_NAME = "Lets Play";
var HELP_MESSAGE = "You can aks for tennis coach, or , people looking for tennis parnter, or, you can say exit... What can I help you with?";
var HELP_REPROMPT = "What can I help you with?";
var STOP_MESSAGE = "Goodbye!";


var SPORT_TENNIS="tennis";
var MATCHING_ATTRIBUTE_GIVING_LESSON = "Giving Lesson";
//=========================================================================================================================================
//Editing anything below this line might break your skill.  
//=========================================================================================================================================
exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('TennisCoachIntent');
    },
    'TennisCoachIntent': function () {
        console.info("Starting TennisCoachIntent for user " + JSON.stringify(this.event.context.System.user.userId));
        if(this.event.session.attributes.repeatSpeech) {
        	this.event.session.attributes.repeatSpeech = null;
        }
        this.event.session.attributes.requestType = MATCHING_ATTRIBUTE_GIVING_LESSON;

        //var requests = DataHandler.fetchRequestFromDB(this.event, SPORT_TENNIS, MATCHING_ATTRIBUTE_GIVING_LESSON);
        var requests = DataHandler.fetchRequestFromDump(this.event, SPORT_TENNIS, MATCHING_ATTRIBUTE_GIVING_LESSON);
        var speechOutput = '';
        if(requests && requests.length>0) {
        	console.info("Requests found in database. So preparing the options for requests");
        	speechOutput = prepareSpeechForRequests(requests);
        	this.event.session.attributes.repeatSpeech = speechOutput;
        } else {
			console.info("There is no requests found in database.");
			//TODO
        }
        //var speechOutput = 'You are looking for coach. we will help you soon @ <say-as interpret-as="digits">' + requests + '</say-as>';
        this.emit(':tellWithCard', speechOutput, SKILL_NAME, speechOutput);
    },
    'RepeatSpeechIntent': function () {
        console.info("Starting RepeatSpeechIntent for user " + JSON.stringify(this.event.context.System.user.userId));
        var speechOutput = '';
        if(this.event.session.attributes.repeatSpeech) {
        	speechOutput = this.event.session.attributes.repeatSpeech;
        } else {
        	speechOutput = "I am not able to help you right now. Please try after some time. ";
        }
        this.emit(':tellWithCard', speechOutput, SKILL_NAME, speechOutput);
    },
    'NewRequestIntent': function () {
        console.info("Starting NewRequestIntent for user " + JSON.stringify(this.event.context.System.user.userId));
        if(this.event.session.attributes.repeatSpeech) {
        	this.event.session.attributes.repeatSpeech = null;
        }
        var speechOutput = '';
        var userInfo = DataHandler.fetchUserInformationFromDump(this.event.context.System.user.userId);
        if(userInfo){
        	speechOutput = "Do you want to add request for " + userInfo.name + ' at cell <say-as interpret-as="digits"> ' + userInfo.cell + '</say-as> ? '
        		+ 'If this is correct say yes . otherwise say no . ';
        } else {
        	speechOutput = 'We do not have your information. Please tell me your name . ';
        }
        this.emit(':tellWithCard', speechOutput, SKILL_NAME, speechOutput);
    },
    'RequestYesIntent': function () {
        console.info("Starting RequestYesIntent for user " + JSON.stringify(this.event.context.System.user.userId));
        if(this.event.session.attributes.repeatSpeech) {
        	this.event.session.attributes.repeatSpeech = null;
        }
        DataHandler.storeRequestIntoDB(this.event, SPORT_TENNIS, this.event.session.attributes.requestType);
        var speechOutput = "Thank you for using Roger. Please come back to us again.";
        this.event.session.attributes = {};
        this.emit(':tellWithCard', speechOutput, SKILL_NAME, speechOutput);
    },
    'RequestNoIntent': function () {
        console.info("Starting RequestNoIntent for user " + JSON.stringify(this.event.context.System.user.userId));
        if(this.event.session.attributes.repeatSpeech) {
        	this.event.session.attributes.repeatSpeech = null;
        }
        var speechOutput = 'Please tell me your name . ';
        this.emit(':tellWithCard', speechOutput, SKILL_NAME, speechOutput);
    },
    'ReadNameIntent': function () {
        console.info("Starting ReadNameIntent for user " + JSON.stringify(this.event.context.System.user.userId));
        if(this.event.session.attributes.repeatSpeech) {
        	this.event.session.attributes.repeatSpeech = null;
        }
        this.event.session.attributes.requesterName = this.event.request.intent.slots.name.value;
        console.info("User has provided name as " + this.event.request.intent.slots.name.value);
        var speechOutput = 'Please tell me your cell number . ';
        this.emit(':tellWithCard', speechOutput, SKILL_NAME, speechOutput);
    },
    'ReadMobileNumberIntent': function () {
        console.info("Starting ReadMobileNumberIntent for user " + JSON.stringify(this.event.context.System.user.userId));
        if(this.event.session.attributes.repeatSpeech) {
        	this.event.session.attributes.repeatSpeech = null;
        }
        var name = this.event.session.attributes.requesterName;
        var slots = this.event.request.intent.slots; 
        console.info("User has provided cell no as " + slots.DigitOne.value + slots.DigitTwo.value + slots.DigitThree.value + slots.DigitFour.value + slots.DigitFive.value 
        		+ slots.DigitSix.value + slots.DigitSeven.value + slots.DigitEight.value + slots.DigitNine.value + slots.DigitTen.value);
        var cell = slots.DigitOne.value + slots.DigitTwo.value + slots.DigitThree.value + slots.DigitFour.value + slots.DigitFive.value + slots.DigitSix.value +
        		slots.DigitSeven.value + slots.DigitEight.value + slots.DigitNine.value + slots.DigitTen.value;
		DataHandler.storeUserInfoIntoDB(this.event.context.System.user.userId, name, cell);
        DataHandler.storeRequestIntoDB(this.event, SPORT_TENNIS, this.event.session.attributes.requestType);
        var speechOutput = 'Thank you for using Roger . Please come back to us again. ';
        this.emit(':tellWithCard', speechOutput, SKILL_NAME, speechOutput);
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = HELP_MESSAGE;
        var reprompt = HELP_REPROMPT;
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    }
};

var prepareSpeechForRequests = function (requests) {
	var speechOutput = 'These people are ' + MATCHING_ATTRIBUTE_GIVING_LESSON + ' for ' + SPORT_TENNIS + ' . ';
	for(var i = 0, size = requests.length; i < size ; i++) {
		var request = requests[i];
		speechOutput += 'option ' + (i+1) + ' . ' + request.name + ' can be reached at <say-as interpret-as="digits"> ' + request.cell + '</say-as> . ';
	}
	speechOutput += 'If you want to repeat . Say repeat . Or if you want to look anyone else . Say look. If you want to exit . Say exit. ';
	return speechOutput;	
}