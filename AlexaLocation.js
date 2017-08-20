var AWS = require("aws-sdk");

exports.getPostalCodeForUser = function(event) {
    const defaultPostalCode = '20171';
    
    if(!event.context.System.user.permissions) {
        console.log("User did not give us permissions to access their address.");
        return defaultPostalCode;
    }
    
    const consentToken = event.context.System.user.permissions.consentToken;
    
    if(!consentToken) {
        console.log("User did not give us permissions to access their address.");
        return defaultPostalCode;
    }

    const deviceId = event.context.System.device.deviceId;
    const apiEndpoint = event.context.System.apiEndpoint;
    const alexaDeviceAddressClient = new AlexaDeviceAddressClient(apiEndpoint, deviceId, consentToken);
    let deviceAddressRequest = alexaDeviceAddressClient.getFullAddress();
    deviceAddressRequest.then((addressResponse) => {
        switch(addressResponse.statusCode) {
            case 200:
                console.log("Address successfully retrieved..");
                const address = addressResponse.address;
                return "${address['postalCode']}";
            case 204:
                // This likely means that the user didn't have their address set via the companion app.
                console.log("Successfully requested from the device address API, but no address was returned.");
                return defaultPostalCode;
            case 403:
                console.log("The consent token we had wasn't authorized to access the user's address.");
                return defaultPostalCode;
            default:
                return defaultPostalCode;        
            }
    });

    deviceAddressRequest.catch((error) => {
        console.error(error);
        console.info("Ending getAddressHandler()");
        return defaultPostalCode;        
    });
};