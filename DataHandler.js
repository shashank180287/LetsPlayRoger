var AlexaLocation = require('./AlexaLocation.js');
if (typeof Promise === 'undefined') {
  AWS.config.setPromisesDependency(require('bluebird'));
}
var AWS = require("aws-sdk");
AWS.config.update({endpoint: "https://dynamodb.us-east-1.amazonaws.com"});

var dynamo = new AWS.DynamoDB();
const table = "Requests";
var selfClass = this;

exports.fetchRequestFromDB = function(callback, event, sport, matchingAttr) {
    var postalCode = AlexaLocation.getPostalCodeForUser(event);
    console.log("Get use postal code as:", postalCode);
    
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
        if (err) {
            console.log ("Error while scanning the table"+err);
            callback(null);
        } else {
            console.log("Found data as " + JSON.stringify(data));
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

exports.fetchUserInformationFromDB = function(userId, callback) {
    var params = {
        TableName: table,
        ProjectionExpression: "#name, Cell",
        FilterExpression: "#userId = :userId",
        ExpressionAttributeNames: {
            "#userId": "UserId",
            "#name": "Name"
        },
        ExpressionAttributeValues: {
            ":userId": { "S" : userId },
        }
    }
    console.log("Fetching data for user with id " + userId);
    dynamo.scan(params, function(err, data) {
        if (err) {
            console.log ("Error while scanning the table"+err);
            callback(null);
        } else {
            console.log("Found data as " + JSON.stringify(data));
            if(data && data.Items && data.Items.length>0) {
                var requests = [];
                callback(data.Items[0]);
            }
            else {
                callback(null);   
            }
        }
    });
}

exports.storeRequestIntoDB = function(event, name, mobileNo, sport, matchingAttr, callback) {
    var selfRef = this;
    var userId = event.context.System.user.userId;
    console.log("Looking user is availbale for user id as " + userId);
    var postalCode = AlexaLocation.getPostalCodeForUser(event);
    console.log("Get use postal code as:", postalCode);

    var insertOrUpdateRequest = function(userData) {
        if(userData) {
            console.log("User data is available. So updating existing entry.");
            var params;
            if (mobileNo && name) {
                params = {
                    TableName : table,
                    Item:{
                        "UserId": { "S": userId },
                        "Cell": { "S": mobileNo },
                        "MatchingAttribute": { "S": matchingAttr },
                        "Name": { "S": name },
                        "PostalCode": { "N": postalCode },
                        "Sport": { "S": sport }
                    }
                };
            } else {
                params = {
                    TableName : table,
                    Item:{
                        "UserId": { "S": userId },
                        "MatchingAttribute": { "S": matchingAttr },
                        "PostalCode": { "N": postalCode },
                        "Sport": { "S": sport }
                    }
                }; 
            }
            console.log("Updating user request.");
            dynamo.updateItem(params, function(err, data) {
                if (err) {
                    console.error("Unable to update request. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("Updated request successfully:", JSON.stringify(data, null, 2));
                    console.log("Self Object is " + JSON.stringify(selfRef));
                    callback(null);
                }
            });
        } else {
            console.log("User data is not available. So creating a new entry.");
            if (mobileNo && name) {
                var params = {
                    TableName : table,
                    Item:{
                        "UserId": { "S": userId },
                        "Cell": { "S": mobileNo },
                        "MatchingAttribute": { "S": matchingAttr },
                        "Name": { "S": name },
                        "PostalCode": { "N": postalCode },
                        "Sport": { "S": sport }
                    }
                };
                console.log("Adding a new user request.");
                dynamo.putItem(params, function(err, data) {
                    if (err) {
                        console.error("Unable to add request. Error JSON:", JSON.stringify(err, null, 2));
                    } else {
                        console.log("Added request successfully:", JSON.stringify(data, null, 2));
                        console.log("Self Object is " + JSON.stringify(selfRef));
                        callback(null);
                    }
                });
            } else {
                console.log("Cell Number and Name is not available. So not creating any user request.");
            }
        }
    }
    selfClass.fetchUserInformationFromDB(userId, insertOrUpdateRequest);
}