var request = require("request");

var triggerAlarm = function(urlMaster, registrationId) {
    console.log("\ntriggering alarm ..");

    request({
        uri: urlMaster + "/alarm/notify",
        method: "POST",
        form: {
            detector_id: registrationId
        }
    }, function(error, _, body) {
        if (!error) {
            console.log("result:", body);
        } else {
            console.log("error during alarm notification", error);
        }
    });
};

var register = function(url, urlMaster, registrationInterval, alertInterval, startAlertLoop) {
    console.log("\nregistering at '%s' ..", urlMaster);

    request({
        uri: urlMaster + "/alarm/register/detector",
        method: "POST",
        form: {
            name: "Mock Detector 1",
            description: "Mock implementation of detector",
            url: url
        }
    }, function(error, _, body) {
        if (!error) {
            var jsonBody = JSON.parse(body);
            console.log("result: ", jsonBody);
            startAlertLoop(jsonBody.id);
        } else {
            console.log("error during registration", error, "\nretry ..");
            setTimeout(function() {
                register(url, urlMaster, registrationInterval, alertInterval, startAlertLoop);
            }, registrationInterval * 1000);
        }
    });
};

var registerAndContinuouslyAlertMaster = function(url, urlMaster, registrationInterval, alertInterval) {
    register(url, urlMaster, registrationInterval, alertInterval, function(registrationId) {
        console.log("\nstarting alert loop (each %s seconds)", alertInterval);

        setInterval(function() {
            triggerAlarm(urlMaster, registrationId);
        }, alertInterval * 1000);
    });
};

module.exports = {
    registerAndContinouslyAlert: registerAndContinuouslyAlertMaster
};
