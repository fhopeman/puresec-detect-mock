var request = require("request");

var register = function(url, urlMaster) {
    console.log("Registering at '%s' ..", urlMaster);

    request({
        uri: urlMaster + "/alarm/register/detector",
        method: "POST",
        form: {
            name: "Mock Detector 1",
            description: "Mock implementation of detector",
            url: url
        }
    }, function(error, response, registrationId) {
        if (!error) {
            console.log("Response:", response);
            console.log("RegistrationId: ", registrationId);
            return registrationId;
        } else {
            console.log("error during registration", error);
            return undefined;
        }
    });
};

var triggerAlarm = function(registrationId) {
    console.log("triggering alarm ..");

    request({
        uri: urlMaster + "/alarm/notify",
        method: "POST",
        form: {
            detector_id: registrationId
        }
    }, function(error, response, body) {
        if (!error) {
            console.log("Response:", response);
            console.log("Body:", body);
        } else {
            console.log("error during alarm notification", error);
        }
    });
};

var registerAndContinuouslyAlertMaster = function(url, urlMaster, registrationInterval, alertInterval) {
    var registrationId = register(url, urlMaster);
    if (registrationId) {
        setInterval(function() {
            triggerAlarm(registrationId);
        }, alertInterval * 1000);
    } else {
        setTimeout(function() {
            registerAndContinuouslyAlertMaster(url, urlMaster, registrationInterval, alertInterval);
        }, registrationInterval * 1000);
    }
};

module.exports = {
    registerAndContinouslyAlert: registerAndContinuouslyAlertMaster
};
