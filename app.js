var express = require("express");
var master = require("./master.js");
var network = require("./network.js");

var app = express();

var urlMaster = process.env.MASTER_URL || process.argv[2] || "http://192.168.178.23:3000";
var alertInterval = process.env.MASTER_ALERT_INTERVAL || process.argv[3] || 60;
var registrationInterval = process.env.MASTER_REGISTRATION_INTERVAL || process.argv[4] || 5;
var port = process.env.PORT || process.argv[5] || 3001;

app.get("/health", function(req, res) {
    console.log("\nhealth: OK");
    res.send("OK");
});

var server = app.listen(port, function() {
    var url = network.currentCallbackAddress() + ":" + port;
    console.log("detect dummy microservice listening at '%s'", url);

    master.registerAndContinouslyAlert(url, urlMaster, registrationInterval, alertInterval);
});
