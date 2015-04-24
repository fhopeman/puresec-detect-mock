var express = require("express");
var app = express();

app.get("/health", function(req, res) {
    res.send("OK");
});

var server = app.listen(3001, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("detect dummy microservice listening at http://%s:%s", host, port);
});
