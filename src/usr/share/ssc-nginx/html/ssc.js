function buildPlayer(url, index) {
    console.log("buildPlayer: " + url);
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
    return $("#audioplayer-" + index + "-container").remove();
}

/*
 * XXX: Fade-out does not cancel an ongoing fade-in. This is not a
 * problem as long as fade-in and fade-out speeds are different
 * (otherwise you could get stuck, with fade-in and fade-out processes
 * cancelling each other out). 
 */
function fadeIn(index, done) {
    var pl = getPlayer(index);
    var vol = 0.0;
    pl.volume = vol;
    function loop() {
        vol += 0.006;
        if (vol >= 0.3) {
            pl.volume = 0.3;
            console.log("player " + index + " fade in completed");
            if (done) done();
        } else {
            pl.volume = vol;
            setTimeout(loop, 10);
        }
    };
    pl.addEventListener("playing", function (e) {
        e.srcElement.removeEventListener("playing", arguments.callee);
        loop();
    });
}

function fadeOut(index) {
    console.log("player " + index + " fade out started");
    var pl = getPlayer(index);
    var vol = pl.volume;
    function loop() {
        vol -= 0.003;
        if (vol <= 0.0) {
            pl.volume = 0.0;
            console.log("player " + index + " fade out completed");
            removePlayer(index);
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
    var lastTop = $("#word-scroll span.word-line").last().css('top');
    var lineLength = 0;
    var wordNum = 0;
    var line = ['<span class="word-line">'];
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
        var tag = '<span class="stream-word" onClick="search(' + 
            "'" + w + "'" + ');">' + w + '</span>';
        line.push(tag);

        lineLength += w.length + numDashes * 1.5;
        wordNum++;
        if (lineLength > 30) {
            line.push("------------------------------------");
            el.append(_.join(line, ""));
            el.append("</span>");
            el.append("<br />");
            var newLine = $("#word-scroll span.word-line").last();
            if (lastTop) {
                newLine.css('top', lastTop);
                newLine.css('top', '+=20px');
            }

            var topVal = parseFloat(newLine.css('top'));
            return topVal;
        }
    };
}

var createWordIterator = function (words) {
    var index = 0;

    return {
        next: function () {
            var word = decodeURIComponent(words[index]);
            index++;
            if (index === words.length) {
                index = 0;
            }
            return word;
        }
    };
};

function scroll() {
    $("#word-scroll span.word-line").css('top', '-=1px');
    setTimeout(scroll, 50);
}

var play = (function () {
    var playerCount = 0;
    var previousPlayers = []

    return function (sounds) {
        var players = [];
        var playersElem = $("#players");
        var toFadeOut = _.clone(previousPlayers);
        // Replace (cross-fade) players one by one
        _.each(sounds, function(url) {
            playerCount++;
            players.push(playerCount);
            playersElem.append(buildPlayer(url, playerCount));
            jumpAround(playerCount);
            var oldPlayer = toFadeOut.shift();
            fadeIn(playerCount, function () {
                if (oldPlayer !== undefined) fadeOut(oldPlayer);
            });
        });
        // Fade out remaining players, if any
        _.each(toFadeOut, fadeOut);
        previousPlayers = players;
    };
})();

function hello(keyword) {
    $.get("/ssc/hello?w=" + keyword);
}

function search(keyword) {
    var status = $("#status");
    status.html("Searching...");
    $("#keyword-input")[0].value = keyword;

    keyword = _.trim(keyword).toLowerCase();
    $.get("/ssc/freesound/search/?q=" + keyword + 
          "&f=duration%3A%5B1+TO+60%5D&s=score+desc&advanced=1&g=", function(res) {
        var pattern = /(\/data\/previews\/[^"]*\.ogg)/;
        var sounds = [];
        _.each(res.split('\n'), function(line) {
            var match = line.match(pattern);
            if (!match) return true;
            sounds.push("/ssc/freesound" + match[1]);
            if (sounds.length === 3) return false;
        });
        status.html("Found " + sounds.length + " " + (sounds.length === 1 ? "sound" : "sounds"));
        if (sounds.length === 0) {
            return;
        }
        hello(keyword);
        play(sounds);
    }).fail(function() {
        status.html("Error :(");
    });
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function addWords() {
    $.get("/ssc/words", function(res) {
        shuffle(res.words);
        var wordIterator = createWordIterator(res.words);

        $("#word-scroll span.word-line").each(function (idx, el) {
            var sel = $(el);
            var pos = parseFloat(sel.css('top'));
            if(pos < -100) {
                sel.remove();
            }
        });
        var pos = 0;
        while (pos < window.innerHeight * 1.5) {
            pos = addWordLine(wordIterator);
        }
    });

    setTimeout(addWords, 10000);
}

$(function () {
    addWords();
    scroll();

    $("#searchform").submit(function(event) {
        event.preventDefault();

        var input = $("#keyword-input");
        var button = $("#go-button");
        var keyword = input.val();
        input.blur();

        if(!keyword) return;

        search(keyword);
    });
});
