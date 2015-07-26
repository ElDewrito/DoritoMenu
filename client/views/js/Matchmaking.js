Template.Matchmaking.helpers({
    matchmakingPlayers: function() {
        return MatchmakingPlayers.find();
    },
    matchmakingPlayersCount: function() {
        return MatchmakingPlayers.find().count();
    },
    serverCount: function() {
        return GameServers.find().count();
    },
    matchmakingStatus: function() {
        return Session.get("MatchmakingStatus");
    }
});

JoinMatchmaking = function() {
    if (Session.get("currentPage") == "matchmaking" && Session.get("lastPage") != "matchmaking") {
        console.log("Loaded Matchmaking!");
        dewRcon.send("Server.MenuState 2", function(res) {
            if (res == "Changed game state to 2") {

                Session.set("MatchmakingStatus", "Checking connection speed...");
                $.ajax({
                    url: 'https://dew.halo.click/upload_timer.php?a=' + moment().unix(),
                    type: 'POST',
                    crossdomain: true,
                    context: this,
                    success: function(res) {
                        res = JSON.parse(res);
                        TestUploadSpeed(res.id);
                    }
                });
            }
            else
            {
                Session.set("MatchmakingStatus", "You need to be in the main menu to join matchmaking.");
            }
        });
    }
}

function TestUploadSpeed(id) {
    $.ajax({
        url: 'https://dew.halo.click/bandwidth.php?id=' + id + '&a=' + moment().unix(),
        type: 'POST',
        context: this,
        crossdomain: true,
        data: getRandomString(1),
        success: function(res) {
            console.log(res);
            ReallyJoinMatchmaking(res.time);
        }
    });
}

function getRandomString(sizeInMb) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()_+`-=[]\{}|;':,./<>?", //random data prevents gzip effect
        iterations = sizeInMb * 1024 * 1024, //get byte count
        result = '';
    for (var index = 0; index < iterations; index++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    };
    return result;
};

function ReallyJoinMatchmaking(speed) {
    Session.set("MatchmakingStatus", "Joining matchmaking...");
    //TODO: I really need to fix this callback overwrite bug
    dewRcon.send("Player.Name", function(res) {
        var name = res;
        dewRcon.send("Player.PubKey", function(res) {
            var uid = CryptoJS.SHA256(res).toString();
            Meteor.call('addToMatchmaking', name, uid, speed, function(error, result) {
                if (error) {
                    console.log(error);
                } else {
                    var player_id = result;
                    Session.set("MMPlayerID", player_id);
                    console.log(player_id);
                    Session.set("MatchmakingStatus", "Waiting to play...");
                }
            });
        });
    });
}
