var express = require("express");
var logger = require('winston');
var puresecMicroservice = require("puresec-microservice-js");

var urlMaster = process.env.MASTER_URL || process.argv[2] || "http://localhost:3000";
var alertInterval = process.env.MASTER_ALERT_INTERVAL || process.argv[3] || 10;
var registrationInterval = process.env.MASTER_REGISTRATION_INTERVAL || process.argv[4] || 5;
var port = process.env.PORT || process.argv[5] || 3001;

var app = express();
var master = puresecMicroservice.master(urlMaster);
var utils = puresecMicroservice.utils();
var webApp = puresecMicroservice.webApp();

webApp.registerHealthCheckEndpoint(app, function() {
    logger.info("health: UP");
});

var triggerAlarm = function(registrationId) {
    logger.info("\ntriggering alarm ..");

    master.notify({
        registrationId: registrationId,
        onSuccess: function(jsonBody) {
            logger.info("result:", jsonBody);
        },
        onError: function(error) {
            logger.error("error during alarm notification", error);
        }
    });
};

var startAlertingLoop = function(registrationId) {
    logger.info("\nstarting alert loop (each %s seconds)", alertInterval);

    setInterval(function() {
        triggerAlarm(registrationId);
    }, alertInterval * 1000);
};

app.listen(port, function() {
    var registerOptions = {
        name: "Mock Detector 1",
        description: "Mock implementation of detector",
        type: "detector",
        address: utils.currentAddress(port),
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
