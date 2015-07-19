Template.Lobby.helpers({
    players: function(ip) {
        return GameServers.find({
            data: {
                $exists: 1
            },
            ip : ip
        });
    },

    loadLobby : function (ip) {
        // Load all lobby stuff here

        var players = Template.Lobby.helpers.players(ip);
        console.log(players);

    }
});



Template.Lobby.rendered = function(ipIn) {
    console.log("Lobby call:", ipIn);

    
    // if (ipIn !== undefined)
        // Template.Lobby.helpers.loadLobby(ser);


    // We need to add in the template markup here



    //Lets check for pings when the server list is rendered
    //Lets also re-check pings every 10 seconds from the client
    setInterval(function() {
        _.each(GameServers.find({ip: ipIn }).fetch(), function(server) {
            var startTime = Date.now(),
                endTime,
                ping;
            var hashServer = (CryptoJS.SHA256(server.ip).toString());
            $.ajax({
                type: "GET",
                url: "http://" + server.ip + "/",
                async: true,
                timeout: 5000,
                success: function() {
                    endTime = Date.now();
                    ping = Math.round((endTime - startTime) / 1.60);
                    Session.set("ping_" + hashServer, ping);
                }
            });

            // Load shit
            Session.set("playerList", server.players);
            Session.set("lobbyID", server._id);
        });
    }, 10000);

    $.ajax({
        dataType: "json",
        url: "https://api.myjson.com/bins/39vba",
        timeout: 15000,
        async: true,
        success: function(data) {
            if (data.active !== undefined && data.active) {
                msg = "MOTD - " + data.author + ": " + data.message;
                Session.set("motd", msg);
            }
        }
    });   
}
