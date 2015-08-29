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
    },

    geoIP : function() {
        return Session.get("geoIP");
    },

    teamColour : function(teamIndex) {
        return (teamIndex == "0" ? "red" : "blue");
    },

    getColour : function(id) {
        return playerColours[id];
    },

    notNull : function (val) {
        return (val != null && val !== undefined && val != "" && val !== " ");
    },

    isTeamGame : function(variant) {
        // hard code return
        return false;

        if (variant.toLowerCase().indexOf('team') >= 0)
            return true;
        else
            return false;
    },

    playerListInc : function() {
        playerIndex++;
    },

    playerListReset : function () {
        playerIndex = 0;
    },

    getPlayerIndex : function (){
        return playerIndex;
    }
});

var playerIndex = 0;

var playerColours = [
    'rgba(255, 0, 0, 0.3)',
    'rgba(208, 0, 255, 0.3)',
    'rgba(0, 255, 179, 0.3)',
    'rgba(142, 0, 255, 0.3)',
    'rgba(0, 57, 255, 0.3)',
    'rgba(0, 246, 255, 0.3)',
    'rgba(0, 255, 47, 0.3)',
    'rgba(255, 236, 0, 0.64)',
    'rgba(255, 85, 0, 0.42)',
    'rgba(255, 0, 0, 0.3)',
    'rgba(208, 0, 255, 0.3)',
    'rgba(0, 255, 179, 0.3)',
    'rgba(142, 0, 255, 0.3)',
    'rgba(0, 246, 255, 0.3)',
    'rgba(0, 255, 47, 0.3)',
    'rgba(255, 236, 0, 0.64)'
];

function getServerByIP(ip) {
    return GameServers.find({ip: ip}).fetch();
}

function updateServer(ipIn) {
     var server = getServerByIP(ipIn)[0];
    console.log("Server", server);
    Session.set("serverData", server.data);
    Session.set("geoIP", server.geoIP);
}

Template.Lobby.load = function(ipIn) {
    updateServer(ipIn);

    playerIndex = 0;

    if (checkFavourite(ipIn)) {
        $(".lobby-col-left").addClass("favourite");
    } else {
        $(".lobby-col-left").removeClass("favourite");
    }

    var ctx = $("#lobbyChart").get(0).getContext("2d");

    var data = [
        {
            value: 15,
            color:"#F7464A",
            highlight: "#FF5A5E",
            label: "Kills"
        },
        {
            value: 5,
            color: "#46BFBD",
            highlight: "#5AD3D1",
            label: "Deaths"
        }
    ];

    var lobbyChart = new Chart(ctx).Doughnut(data, {
        segmentShowStroke: false,
        animateRotate: false,
    });


    
   //  setInterval(function() {
   //      updateServer(ipIn);
   // }, 5000);
}


Template.Lobby.events = {
    'click .connect': function(e) {

        var server = $(e.currentTarget);
        ga('send', 'event', 'serverlist', 'connect', server.attr("data-ip"));
        if ($(e.currentTarget).hasClass("passworded")) {
            displayPasswordForm(server);
        }
        else {
            dewRcon.send("connect " + server.attr("data-ip") + " ", function(res) {
            SnackBarOptions.text = res;
            MDSnackbars.show(SnackBarOptions);
            });
        }

    }
}