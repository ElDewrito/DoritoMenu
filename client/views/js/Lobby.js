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

function updateServer(ipIn) {
     var server = getServerByIP(ipIn)[0];
    console.log("Server", server);
    Session.set("serverData", server.data);
    console.log("Server updated");
}
Template.Lobby.load = function(ipIn) {
    updateServer(ipIn);
    
   //  setInterval(function() {
   //      updateServer(ipIn);
   // }, 5000);
}
