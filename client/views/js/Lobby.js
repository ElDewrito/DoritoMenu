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

    ip : function() {
        return Session.get("ip");
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

    isTeamGame : function(players) {
        return teamGame(players);
    },

    playerListInc : function() {
        playerIndex++;
    },

    playerListReset : function () {
        playerIndex = 0;
    },

    getPlayerIndex : function (){
        return playerIndex;
    },

    healthStatus : function (isAlive) {
        return (isAlive ? 'alive' : 'dead');
    },

    lastUpdated : function() {
        return Session.get('lastUpdated');
    }
});

function teamGame(players) {
    if ($('.player-list-container').attr("data-isTeamGame")) {
        return $('.player-list-container').attr("data-isTeamGame") == 'true';
    }

    var isATeamGame = true;
    if (players == null || players == undefined) return false;
    _.each(players, function(player) {
        if (player.team > 1) {
            isATeamGame = false;
            return true;
        }
    });

    $('.player-list-container').attr("data-isTeamGame", isATeamGame);
    return isATeamGame;
}

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

function orderByTeams() {
    var $container = $('.player-list-container .player-list');
    var $players = $('.player-list-container .player-list li').detach();

    $players = $players.sort(function(a, b) {
        var pingA = $(a).attr('data-team');
        pingA = parseInt(pingA.substring(0, pingA.length), 10);

        var pingB = $(b).attr('data-team');
        pingB = parseInt(pingB.substring(0, pingB.length), 10);

        if (isNaN(pingA))
            pingA = 10000;

        if (isNaN(pingB))
            pingB = 10000;

        return pingA > pingB ? 1 : -1;
    });

    $container.append($players);
}

function updateTopPlayer(player) {
    $(".highlight-player .name").html(player.name);
    $(".highlight-player [data-stat=score] .value").html(player.score);
    $(".highlight-player [data-stat=kills] .value").html(player.kills);
    $(".highlight-player [data-stat=deaths] .value").html(player.deaths);
    $(".highlight-player [data-stat=assists] .value").html(player.assists);

    var graphKills = (player.kills <= 0 ? 0.1 : player.kills);
    var graphDeaths = (player.deaths <= 0 ? 0.1 : player.deaths);

    var data = [
        {
            value: graphKills,
            color:"#F7464A",
            highlight: "#FF5A5E",
            label: "Kills"
        },
        {
            value: graphDeaths,
            color: "#46BFBD",
            highlight: "#5AD3D1",
            label: "Deaths"
        }
    ];  

    var ctx = $("#lobbyChart").get(0).getContext("2d");

    var lobbyChart = new Chart(ctx).Doughnut(data, {
        segmentShowStroke: false,
        animateRotate: false,
    });
}

function getServerByIP(ip) {
    return GameServers.find({ip: ip}).fetch();
}

function updateTeamBars(players) {
    var redScore = 0;
    var blueScore = 0;

    if (players == null || players == undefined) return false;
    _.each(players, function(player) {
        if (player.team == 0) {
            redScore += player.score;
        }

        if (player.team == 1) {
            blueScore += player.score;
        }
    });

    var totalScore = redScore + blueScore;
    var redSize = Math.round((redScore / totalScore) * 100);

    $(".team-weighing .team-red").css({"width" : redSize + "%"});
    $(".team-weighing .team-red span").html(redSize + "%");
}

var serverObj;
function updateServer(ipIn) {
    serverObj = getServerByIP(ipIn)[0];
    Session.set("serverData", serverObj.data);
    Session.set("geoIP", serverObj.geoIP);
    Session.set("ip", ipIn);

    playerIndex = 0;

    if (checkFavourite(ipIn)) {
        $(".lobby-col-left").addClass("favourite");
    } else {
        $(".lobby-col-left").removeClass("favourite");
    }

    var ctx = $("#lobbyChart").get(0).getContext("2d");

    var data = [
        {
            value: 0.1,
            color:"#F7464A",
            highlight: "#FF5A5E",
            label: "Kills"
        },
        {
            value: 0.1,
            color: "#46BFBD",
            highlight: "#5AD3D1",
            label: "Deaths"
        }
    ];

    var lobbyChart = new Chart(ctx).Doughnut(data, {
        segmentShowStroke: false,
        animateRotate: false,
        tooltipTemplates : '<%= value %>',
        showTooltips: true
    });
}

var serverUpdateInterval = null;
Template.Lobby.load = function(ipIn) {
    Session.set('lastUpdated', new Date());
    $('.player-list-container').removeAttr("data-isTeamGame");
    Chart.defaults.global.responsive = true;
    updateServer(ipIn);
    updateTopPlayer(serverObj.data.players[0]);
    
    setTimeout(function() {
        if (teamGame(serverObj.data.players))
            orderByTeams();
    }, 500);

    clearInterval(serverUpdateInterval);

    serverUpdateInterval = setInterval(function() {
        updateServer(ipIn);
        if (teamGame(serverObj.data.players)) {
            orderByTeams();
            updateTeamBars(serverObj.data.players);
        }
   }, 5000);
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
    },
    'mouseover .player-list [data-index]' : function(e) {
        e.preventDefault();
        var name = $(e.currentTarget).attr("data-name");

        var playerIndex = -1;
        for (var i = 0; i < serverObj.data.players.length; i++) {
            if (serverObj.data.players[i].name == name) {
                playerIndex = i;
                continue;
            }
        }
        updateTopPlayer(serverObj.data.players[playerIndex]);
    }
}