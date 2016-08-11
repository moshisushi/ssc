function buildPlayer(url, index) {
    return '<div id="audioplayer-' + index + '-container">' +
        '<audio id="audioplayer-' + index +
        '" controls="controls" autoplay loop>' +
        '<source src="' + url + '">' +
        'Your browser does not support the audio element.' +
        '</audio></div>';
}

function getPlayer(index) {
    return $("#audioplayer-" + index)[0];
}

function removePlayer(index) {
    console.log("player " + index + " remove");
    return $("#audioplayer-" + index + "-container").remove();
}

function fadeIn(index, done) {
    var pl = getPlayer(index);
    var vol = 0.0;
    pl.volume = vol;
    function loop() {
        vol += 0.006;
        if (vol >= 1.0) {
            pl.volume = 1.0;
            console.log("player " + index + " fade in completed");
            pl.removeEventListener("playing", loop);
            if (done) done();
        } else {
            pl.volume = vol;
            setTimeout(loop, 10);
        }
    };
    pl.addEventListener("playing", loop);
}

function fadeOut(index, done) {
    var pl = getPlayer(index);
    var vol = pl.volume;
    function loop() {
        vol -= 0.003;
        if (vol <= 0.0) {
            pl.volume = 0.0;
            console.log("player " + index + " fade out completed");
            removePlayer(index);
            if (done) done();
        } else {
            pl.volume = vol;
            setTimeout(loop, 10);
        }
    };
    loop();
}

function jumpAround(index) {
    var pl = getPlayer(index);
    function loop() {
        var pos = Math.random() * pl.duration;
        var dur = 200 + Math.floor(Math.random() * 2000)
        pl.currentTime = pos;
        if(!pl.paused) {
            setTimeout(loop, dur);
        }
    }
    pl.addEventListener("loadeddata", loop);
}

function addWordLine(wordIterator) {
    var el = $("#word-scroll");
    var lineLength = 0;
    var wordNum = 0;
    var line = ['<span>'];
    while(true) {
        var w = wordIterator.next();
        var randLower = 3;
        var randUpper = wordNum % 2 === 0 ? 5 : 15;
        var numDashes = _.random(randLower, randUpper);
        var dashes = [];
        for(var i = 0; i < numDashes; i++) {
            dashes.push("-");
        }
        dashes = _.join(dashes, "");
        if (wordNum === 0) {
            line.push("------------------------------------");
        } else {
            line.push(dashes);
        }
        line.push(w);

        lineLength += w.length + numDashes * 1.5;
        wordNum++;
        if (lineLength > 30) {
            line.push("------------------------------------");
            el.append(_.join(line, ""));
            el.append("</span>");
            el.append("<br />");
            return;
        }
    };
}

var createWordIterator = function () {
    var index = 0;
    var words = [
        "Contrary",
        "popular",
        "belief",
        "Lorem",
        "Ipsum",
        "simply",
        "random",
        "has",
        "roots",
        "piece",
        "classical",
        "Latin",
        "literature",
        "making",
        "over",
        "2000",
        "years",
        "old",
        "Richard",
        "McClintock",
        "Latin",
        "professor",
        "College",
        "Virginia",
        "looked",
        "more",
        "obscure",
        "Latin",
        "words",
        "consectetur",
        "Lorem",
        "Ipsum",
        "passage",
        "going",
        "through",
        "cites",
        "word",
        "classical",
        "literature",
        "discovered",
        "undoubtable",
        "source",
        "Lorem",
        "Ipsum",
        "comes",
        "from",
        "sections",
        "Finibus",
        "Bonorum",
        "Malorum",
        "Extremes",
        "Good",
        "and",
        "Evil",
        "Cicero",
        "written",
        "This",
        "book",
        "treatise",
        "theory",
        "ethics",
        "very",
        "popular",
        "Contrary",
        "popular",
        "belief",
        "Lorem",
        "Ipsum",
        "simply",
        "random",
        "has",
        "roots",
        "piece",
        "classical",
        "Latin",
        "literature",
        "making",
        "over",
        "2000",
        "years",
        "old",
        "Richard",
        "McClintock",
        "Latin",
        "professor",
        "College",
        "Virginia",
        "looked",
        "more",
        "obscure",
        "Latin",
        "words",
        "consectetur",
        "Lorem",
        "Ipsum",
        "passage",
        "going",
        "through",
        "cites",
        "word",
        "classical",
        "literature",
        "discovered",
        "undoubtable",
        "source",
        "Lorem",
        "Ipsum",
        "comes",
        "from",
        "sections",
        "Finibus",
        "Bonorum",
        "Malorum",
        "Extremes",
        "Good",
        "and",
        "Evil",
        "Cicero",
        "written",
        "This",
        "book",
        "treatise",
        "theory",
        "ethics",
        "very",
        "popular",
        "during",
        "during",
        "Renaissance"
    ];

    return {
        next: function () {
            var word = words[index];
            index++;
            if (index === words.length) {
                index = 0;
            }
            return word;
        }
    };
};

var scrollPos = 0;
function scroll() {
    $("#word-scroll").css("margin-top", "" + scrollPos + "px");
    scrollPos -= 1;
    setTimeout(scroll, 50);
}

$(function () {
    var wordIterator = createWordIterator();
    
    for (var i = 0; i < 1000; i++) {
        addWordLine(wordIterator);
    }
    scroll();

    var playerCount = 0;
    var lastPlayerIndices = [];

    $("#searchform").submit(function(event) {
        event.preventDefault();

        var input = $("#keyword-input");
        var button = $("#go-button");
        var keyword = input.val();
        input.blur();

        if(!keyword) return;

        var results = $("#results");
        var status = $("#status");
        status.html("Fetching sounds... (could take a few seconds)");
 
        button.attr("disabled", true);
        $.get("getsounds?keywords=" + keyword, function(res) {
            button.attr("disabled", false);
            status.html("Download complete! Found " + _.size(res) + " sounds (result cap=3)");
            if (res.length === 0) {
                return;
            }
            var playerIndices = [];
            var i = 0;
            _.each(res, function(url) {
                results.append(buildPlayer(url, playerCount));
                jumpAround(playerCount);
                playerIndices.push(playerCount);
                var toFade = lastPlayerIndices.length > 0 ? [lastPlayerIndices.shift()] : [];
                i++;
                if (i === res.length && lastPlayerIndices.length > 0) {
                    // Last new player, so add fade out hooks to any remaining players 
                    toFade = _.concat(toFade, lastPlayerIndices);
                }
                fadeIn(playerCount, function () {
                    _.each(toFade, fadeOut);
                });
                playerCount++;
            });
            lastPlayerIndices = playerIndices;
        }).fail(function() {
            button.attr("disabled", false);
            status.html("Error :(");
        });
    });
});
