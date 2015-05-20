var express = require("express");
var request = require("request");
var logger = require('winston');
var puresecMicroservice = require("puresec-microservice-js");

var app = express();
var pmsUtils = puresecMicroservice.utils();

var urlMaster = process.env.MASTER_URL || process.argv[2] || "http://localhost:3000";
var alertInterval = process.env.MASTER_ALERT_INTERVAL || process.argv[3] || 300;
var registrationInterval = process.env.MASTER_REGISTRATION_INTERVAL || process.argv[4] || 5;
var port = process.env.PORT || process.argv[5] || 3001;

pmsUtils.addHealthCheck(app, function() {
    logger.info("health: UP");
});

var triggerAlarm = function(urlMaster, registrationId) {
    logger.info("\ntriggering alarm ..");

    request({
        uri: urlMaster + "/alarm/notify",
        method: "POST",
        form: {
            detector_id: registrationId
        }
    }, function(error, _, body) {
        if (!error) {
            logger.info("result:", body);
        } else {
            logger.error("error during alarm notification", error);
        }
    });
};

var startAlertingLoop = function(registrationId) {
    logger.info("\nstarting alert loop (each %s seconds)", alertInterval);

    setInterval(function() {
        triggerAlarm(urlMaster, registrationId);
    }, alertInterval * 1000);
};

app.listen(port, function() {
    var urlClient = pmsUtils.currentAddress() + ":" + port;
    var master = puresecMicroservice.master(urlMaster);

    var registerOptions = {
        name: "Mock Detector 1",
        description: "Mock implementation of detector",
        type: "detector",
        address: urlClient,
        onSuccess: function(jsonBody) {
            logger.info("result: ", jsonBody);
            startAlertingLoop(jsonBody.id);
        },
        onError: function(error) {
            logger.error("error during registration", error, "\nretry ..");
            setTimeout(function() {
                master.register(registerOptions);
            }, registrationInterval * 1000);
        }
    };

    // register
    logger.info("try to register ..");
    master.register(registerOptions);
});
