var request = require('request'),
    express = require('express'),
    async = require('async'),
    fs = require('fs'),
    _ = require('lodash');

var conf = JSON.parse(fs.readFileSync('/etc/sscconf.json'));
var freesoundToken = "Token " + conf.freesound.token;

var app = express();
app.use("/media", express.static(conf.downloadDir));
app.use("/", express.static(__dirname + "/static"));

function searchSounds(keyword, limit, cb) {
    var options = {
        url: "https://www.freesound.org/apiv2/search/text/",
        qs: {
            query: keyword,
            filter: "duration:[1 TO 60]"
        },
        headers: {
            "Authorization": freesoundToken
        }
    };

    request.get(options, function(err, res) {
        if (err) {
            return cb(err);
        }

        var data = JSON.parse(res.body);
        var requests = [];
        _.each(_.take(data.results, limit), function(sound) {
            console.log("Q freesound download: id=" + sound.id);
            requests.push(function (callback) {
                downloadSound(sound.id, callback);
            });
        });
        async.parallel(requests, function(err, results) {
            if (err) {
                return cb(err);
            }
            cb(null, results);
        });
    });
}

function getSoundURL(id, cb) {
    var options = {
        url: "https://www.freesound.org/apiv2/sounds/" + id,
        headers: {
            "Authorization": freesoundToken
        }
    }

    request.get(options, function(err, res) {
        if (err) {
            return cb(err);
        }

        var data = JSON.parse(res.body);
        cb(null, data.previews['preview-hq-ogg']);
    });
}

function downloadSound(id, cb) {
    // XXX: Add fs cache lookup
    getSoundURL(id, function(err, url) {
        if(err) {
            return cb(err);
        }
        var options = {
            url: url,
            headers: {
                "Authorization": freesoundToken
            }
        }

        var fname = "freesound_" + id + ".ogg";
        var path = conf.downloadDir + "/" + fname;
        // XXX: Change to tmp dir + atomic rename
        var stream = request.get(options).pipe(fs.createWriteStream(path));
        stream.on('finish', function () {
            console.log("Download complete: id=" + id);
            cb(null, "media/" + fname);
        });
        stream.on('error', cb);
    });
}



app.get('/getsounds', function(req, res) {
    if (!req.query.keywords) {
        return res.status(400).send("Missing keywords");
    }

    searchSounds(req.query.keywords, 3, function(err, result) {
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
