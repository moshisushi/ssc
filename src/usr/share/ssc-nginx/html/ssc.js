function buildPlayer(url) {
    return '<audio controls="controls" autoplay loop>' +
        '<source src="' + url + '">' +
        'Your browser does not support the audio element.' +
        '</audio>';
}

$(function () {
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
            _.each(res, function(url) {
                results.append(buildPlayer(url) + "<br /><br />");
            });
        }).fail(function() {
            status.html("Error :(");
        });
    });

});
