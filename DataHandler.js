var AlexaLocation = require('./AlexaLocation.js');
if (typeof Promise === 'undefined') {
  AWS.config.setPromisesDependency(require('bluebird'));
}
var AWS = require("aws-sdk");
AWS.config.update({endpoint: "https://dynamodb.us-east-1.amazonaws.com"});

var docClient = new AWS.DynamoDB.DocumentClient();

exports.fetchRequestFromDB = function(event, sport, matchingAttr) {
    var postalCode = AlexaLocation.getPostalCodeForUser(event);
    console.log("Get use postal code as:", postalCode);
    
    var table = "Requests";
    var params = {
        TableName: table,
        Key:{
            "Sport": sport,
            "PostalCode": parseInt(postalCode),
            "MatchingAttribute": matchingAttr
        }
    };
    console.log("Fetching data for postal code as:", postalCode + " sport as " + sport + " matching attribute as " + matchingAttr);
    //var requests = 
    var getObjectPromise = docClient.get(params).promise();
    getObjectPromise.then(function(data) {
        // if (err) {
        //     console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        //     return null;
        // } else {
            console.log("GetItem succeeded:", JSON.stringify(req.data));
            //return JSON.stringify(req.data);
        //}
    }).catch(function(err) {
      console.error(err);
    });
   //console.log("Received output as ", requests);
   //return requests;
}

exports.storeRequestIntoDB = function(event, sport, matchingAttr) {

}

exports.storeUserInfoIntoDB = function(userId, name, mobileNo) {
    
}

exports.fetchRequestFromDump = function(event, sport, matchingAttr) {
    return [{
            "name" : "shashank",
            "cell" : "1234567890"
        }, {
            "name" : "alex",
            "cell" : "2234567890"
        },{
            "name" : "crona",
            "cell" : "3234567890"
        }];
}

exports.fetchUserInformationFromDump = function(event, sport, matchingAttr) {
    return {
            "name" : "Makkhi",
            "cell" : "0987654321"
        };
}