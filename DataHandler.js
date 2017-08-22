var AlexaLocation = require('./AlexaLocation.js');
if (typeof Promise === 'undefined') {
  AWS.config.setPromisesDependency(require('bluebird'));
}
var AWS = require("aws-sdk");
AWS.config.update({endpoint: "https://dynamodb.us-east-1.amazonaws.com"});

var dynamo = new AWS.DynamoDB();

exports.fetchRequestFromDB = function(callback, event, sport, matchingAttr) {
    var postalCode = AlexaLocation.getPostalCodeForUser(event);
    console.log("Get use postal code as:", postalCode);
    
    var table = "Requests";
    var params = {
        TableName: table,
        ProjectionExpression: "#name, Cell",
        FilterExpression: "#sport = :sport AND #postalcode = :postalcode AND #matchingattribute = :matchingattribute AND #userId <> :userId",
        ExpressionAttributeNames: {
            "#userId": "UserId",
            "#sport": "Sport",
            "#postalcode": "PostalCode",
            "#matchingattribute": "MatchingAttribute",
            "#name": "Name"
        },
        ExpressionAttributeValues: {
            ":userId": { "S" : event.context.System.user.userId },
            ":sport": { "S" : sport },
            ":postalcode": { "N" : postalCode },
            ":matchingattribute": { "S" : matchingAttr } 
        }
    }
    console.log("Fetching data for postal code as:", postalCode + " sport as " + sport + " matching attribute as " + matchingAttr);
    dynamo.scan(params, function(err, data) {
        console.log("Found data as " + JSON.stringify(data));
        if (err) {
            console.log ("Error while scanning the table"+err);
            callback(null);
        } else {
            if(data && data.Items && data.Items.length>0) {
                var requests = [];
                callback(data.Items);
            }
            else {
                callback(null);   
            }
        }
    });
}

exports.fetchUserInformationFromDump = function(event, sport, matchingAttr) {
    return {
            "name" : "Makkhi",
            "cell" : "0987654321"
        };
}

exports.storeRequestIntoDB = function(event, sport, matchingAttr) {

}

exports.storeUserInfoIntoDB = function(userId, name, mobileNo) {
    
}