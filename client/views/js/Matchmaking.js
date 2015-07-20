Template.Matchmaking.helpers({
    matchmakingPlayers: function() {
        return MatchmakingPlayers.find();
    },
    matchmakingPlayersCount : function() {
        return MatchmakingPlayers.find().count();
    },
    serverCount: function() {
        return GameServers.find().count();
    },
});


Template.Matchmaking.rendered = function() {
    console.log("Loaded");
}