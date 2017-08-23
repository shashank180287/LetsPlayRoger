'use strict';

var Alexa = require('alexa-sdk');
var DataHandler = require('./DataHandler.js');

var APP_ID = "amzn1.ask.skill.ab14aaa1-7cf8-4bb2-a9d7-cf1f7aebce11";

var SKILL_NAME = "Lets Play";
var HELP_MESSAGE = "You can aks for tennis coach, or , people looking for tennis parnter, or, you can say exit... What can I help you with?";
var HELP_REPROMPT = "What can I help you with?";
var STOP_MESSAGE = "Goodbye!";


var SPORT_TENNIS="tennis";
const MATCHING_ATTRIBUTE_GIVING_LESSON = "Giving Lesson";
const MATCHING_ATTRIBUTE_LOOKING_PARTNER = "Looking Player";
const MATCHING_ATTRIBUTE_TAKING_LESSON = "Taking Lesson";
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

        var self = this;
        var getDataFunction = function(requests) {
           	var speechOutput = '';
	        if(requests && requests.length>0) {
	        	console.info("Requests found in database. So preparing the options for requests");
	        	speechOutput = prepareSpeechForRequests(requests, MATCHING_ATTRIBUTE_GIVING_LESSON);
	        	self.event.session.attributes.repeatSpeech = speechOutput;
	        } else {
				console.info("There is no requests found in database.");
				speechOutput = 'There is no one I can found you. But if you want to look for anyoone say look . ';
	        }
			self.emit(':tellWithCard', speechOutput, SKILL_NAME, speechOutput);
        }
        DataHandler.fetchRequestFromDB(getDataFunction, this.event, SPORT_TENNIS, MATCHING_ATTRIBUTE_GIVING_LESSON);
    },
    'PartnerLookupIntent': function () {
        console.info("Starting PartnerLookupIntent for user " + JSON.stringify(this.event.context.System.user.userId));
        if(this.event.session.attributes.repeatSpeech) {
        	this.event.session.attributes.repeatSpeech = null;
        }
        this.event.session.attributes.requestType = MATCHING_ATTRIBUTE_LOOKING_PARTNER;
 
     	var self = this;
        var getDataFunction = function(requests) {
           	var speechOutput = '';
	        if(requests && requests.length>0) {
	        	console.info("Requests found in database. So preparing the options for requests");
	        	speechOutput = prepareSpeechForRequests(requests, MATCHING_ATTRIBUTE_LOOKING_PARTNER);
	        	self.event.session.attributes.repeatSpeech = speechOutput;
	        } else {
				console.info("There is no requests found in database.");
				speechOutput = 'There is no one I can found you. But if you want to look for anyoone say look . ';
	        }
			self.emit(':tellWithCard', speechOutput, SKILL_NAME, speechOutput);
        }
        DataHandler.fetchRequestFromDB(getDataFunction, this.event, SPORT_TENNIS, MATCHING_ATTRIBUTE_LOOKING_PARTNER);
    },
    'TennisStudentIntent': function () {
        console.info("Starting TennisStudentIntent for user " + JSON.stringify(this.event.context.System.user.userId));
        if(this.event.session.attributes.repeatSpeech) {
        	this.event.session.attributes.repeatSpeech = null;
        }
        this.event.session.attributes.requestType = MATCHING_ATTRIBUTE_TAKING_LESSON;

        var self = this;
        var getDataFunction = function(requests) {
           	var speechOutput = '';
	        if(requests && requests.length>0) {
	        	console.info("Requests found in database. So preparing the options for requests");
	        	speechOutput = prepareSpeechForRequests(requests, MATCHING_ATTRIBUTE_TAKING_LESSON);
	        	self.event.session.attributes.repeatSpeech = speechOutput;
	        } else {
				console.info("There is no requests found in database.");
				speechOutput = 'There is no one I can found you. But if you want to look for anyoone say look . ';
	        }
			self.emit(':tellWithCard', speechOutput, SKILL_NAME, speechOutput);
        }
        DataHandler.fetchRequestFromDB(getDataFunction, this.event, SPORT_TENNIS, MATCHING_ATTRIBUTE_TAKING_LESSON);
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
        var self = this;
        var getUserInformationFunction = function(userInfo) {
        	var speechOutput = '';
        	if(userInfo){
        		console.info("Processed user as : " +  JSON.stringify(userInfo));
	        	speechOutput = "Do you want to add request for " + userInfo.Name.S + ' at cell <say-as interpret-as="digits"> ' + userInfo.Cell.S + '</say-as> ? '
	        		+ 'If this is correct say yes . otherwise say no . ';
	        } else {
	        	speechOutput = 'We do not have your information. Please tell me your name . ';
	        }
	        self.emit(':tellWithCard', speechOutput, SKILL_NAME, speechOutput);
        }
        DataHandler.fetchUserInformationFromDB(this.event.context.System.user.userId, getUserInformationFunction);        
    },
    'RequestYesIntent': function () {
        console.info("Starting RequestYesIntent for user " + JSON.stringify(this.event.context.System.user.userId));
        if(this.event.session.attributes.repeatSpeech) {
        	this.event.session.attributes.repeatSpeech = null;
        }
        DataHandler.storeRequestIntoDB(this.event, null, null, SPORT_TENNIS, this.event.session.attributes.requestType);
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

        var cell="";
        if(slots.DigitOne.value)
        	cell+= slots.DigitOne.value;
        if(slots.DigitTwo.value)
        	cell+= slots.DigitTwo.value;
        if(slots.DigitThree.value)
        	cell+= slots.DigitThree.value;
        if(slots.DigitFour.value)
        	cell+= slots.DigitFour.value;
        if(slots.DigitFive.value)
        	cell+= slots.DigitFive.value;
        if(slots.DigitSix.value)
        	cell+= slots.DigitSix.value;
        if(slots.DigitSeven.value)
        	cell+= slots.DigitSeven.value ;
        if(slots.DigitEight.value)
        	cell+= slots.DigitEight.value;
        if(slots.DigitNine.value)
        	cell+= slots.DigitNine.value ;
        if(slots.DigitTen.value)
        	cell+= slots.DigitTen.value;

		console.info("User has provided cell no as " + cell);
        DataHandler.storeRequestIntoDB(this.event, name, cell, SPORT_TENNIS, this.event.session.attributes.requestType);
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

var prepareSpeechForRequests = function (requests, matchingAttr) {
	var speechOutput = 'These people are ' + matchingAttr + ' for ' + SPORT_TENNIS + ' . ';
	for(var i = 0, size = requests.length; i < size ; i++) {
		var request = requests[i];
		console.info("Preparing statement for name as " + request.Name.S + " and cell number as " + request.Cell.S);
		speechOutput += 'option ' + (i+1) + ' . ' + request.Name.S + ' can be reached at <say-as interpret-as="digits"> ' + request.Cell.S + '</say-as> . ';
	}
	speechOutput += 'If you want to repeat . Say repeat . Or if you want to look anyone else . Say look. If you want to exit . Say exit. ';
	return speechOutput;	
}