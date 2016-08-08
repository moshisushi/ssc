function buildPlayer(url, index) {
    return '<audio id="audioplayer-' + index +
        '" controls="controls" autoplay loop>' +
        '<source src="' + url + '">' +
        'Your browser does not support the audio element.' +
        '</audio>';
}

function jumpAround(index) {
    var pl = $("#audioplayer-" + index)[0];

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

function addWords(words) {
    var el = $("#word-scroll");
    el.html("");
    var lineLength = 0;
    var wordNum = 0;
    _.each(words, function(w) {
        var randLower = 3;
        var randUpper = wordNum % 2 === 0 ? 5 : 15;
        var numDashes = _.random(randLower, randUpper);
        var dashes = [];
        for(var i = 0; i < numDashes; i++) {
            dashes.push("-");
        }
        dashes = _.join(dashes, "");
        if (wordNum === 0) {
            el.append("------------------------------------");
        } else {
            el.append(dashes);
        }
        el.append(w);

        lineLength += w.length + numDashes * 1.5;
        wordNum++;
        if (lineLength > 30) {
            el.append("------------------------------------");
            el.append("<br />");
            lineLength = 0;
            wordNum = 0;
        }
    });
}

$(function () {
    addWords([
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
    ]);



    $("#searchform").submit(function(event) {
        event.preventDefault();

        var input = $("#keyword-input");
        var keyword = input.val();
        input.blur();

        if(!keyword) return;

        var results = $("#results");
        results.html("");
        var status = $("#status");
        status.html("Fetching sounds... (could take a few seconds)");
        $.get("getsounds?keywords=" + keyword, function(res) {
            status.html("Download complete! Found " + _.size(res) + " sounds (result cap=3)");
            var index = 0;
            _.each(res, function(url) {
                results.append(buildPlayer(url, index) + "<br /><br />");
                jumpAround(index);
                index++;
            });
        }).fail(function() {
            status.html("Error :(");
        });




    });
});
