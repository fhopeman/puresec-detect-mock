var express = require("express");
var puresecMicroservice = require("puresec-microservice-js");

var app = express();

var urlMaster = process.env.MASTER_URL || process.argv[2] || "http://localhost:3000";
var alertInterval = process.env.MASTER_ALERT_INTERVAL || process.argv[3] || 300;
var registrationInterval = process.env.MASTER_REGISTRATION_INTERVAL || process.argv[4] || 5;
var port = process.env.PORT || process.argv[5] || 3001;

app.get("/health", function(req, res) {
    console.log("\nhealth: OK");
    res.send("OK");
});


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

var startAlertingLoop = function(registrationId) {
    console.log("\nstarting alert loop (each %s seconds)", alertInterval);

    setInterval(function() {
        triggerAlarm(urlMaster, registrationId);
    }, alertInterval * 1000);
};

app.listen(port, function() {
    var urlClient = puresecMicroservice.utils().currentAddress() + ":" + port;
    var master = puresecMicroservice.master(urlMaster);

    var registerOptions = {
        name: "Mock Handler 1",
        description: "Mock implementation of handler",
        type: "detector",
        address: urlClient,
        onSuccess: function(jsonBody) {
            console.log("result: ", jsonBody);
            startAlertingLoop(jsonBody.id);
        },
        onError: function(error) {
            console.log("error during registration", error, "\nretry ..");
            setTimeout(function() {
                master.register(registerOptions);
            }, registrationInterval * 1000);
        }
    };

    // register
    console.log("try to register ..");
    master.register(registerOptions);
});
