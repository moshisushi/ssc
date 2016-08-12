var request = require('request'),
    express = require('express'),
    async = require('async'),
    fs = require('fs'),
    _ = require('lodash');

var conf = JSON.parse(fs.readFileSync('/etc/sscconf.json'));

var app = express();
app.use("/media", express.static(conf.downloadDir));
app.use("/", express.static(__dirname + "/static"));

function searchSounds(keyword, cb) {
    var options = {
        url: "http://127.0.0.1/ssc/freesound/search/",
        qs: {
            q: keyword,
            f: "duration:[1 TO 60]",
            s: "score+desc",
            advanced: 1,
            g: 1
        }
    };

    request.get(options, function(err, res) {
        if (err) {
            return cb(err);
        }
        return res.toString();
    });
}

app.get('/getsounds', function(req, res) {
    if (!req.query.keywords) {
        return res.status(400).send("Missing keywords");
    }

    searchSounds(req.query.keywords, function(err, result) {
        if (err) {
            console.log("ERROR: " + err);
            return res.status(500).send("Internal server error");
        }
        return res.status(200).send(result);
    });
});


var port = conf.listen ? conf.listen : 8989;
app.listen(port, "127.0.0.1", function () {
    console.log('Server listening on port ' + port);
});
