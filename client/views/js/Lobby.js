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

    },

    serverData : function() {
        return Session.get("serverData");
    }  
});


function getServerByIP(ip) {
    return GameServers.find({ip: ip}).fetch();
}
Template.Lobby.rendered = function(ipIn) {
    
    var server = getServerByIP(ipIn)[0];
    Session.set("serverData", server.data);
}
