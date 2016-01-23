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
    },
    equals: function(a, b) {
        return (a === b);
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

function orderByTeams() {
    var $container = $('.player-list-container .player-list');
    var $players = $('.player-list-container .player-list li').detach();

    $red = $players.filter(function() {
        if ($(this).attr("data-team") == 0) return true;
    });

    $blue = $players.filter(function() {
        if ($(this).attr("data-team") == 1) return true;
    });

    $.merge($red, $blue);

    $container.append($red);
}

function updateTopPlayer(index) {
    var player = serverObj.data.players[index];

    if (player == undefined || !player) {
        player = serverObj.data.players[0];
    }

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
var activeIndex = 0;
Template.Lobby.load = function(ipIn) {
    Session.set('lastUpdated', new Date());
    $('.player-list-container').removeAttr("data-isTeamGame");
    Chart.defaults.global.responsive = true;
    updateServer(ipIn);
    updateTopPlayer(0);
    
    setTimeout(function() {
        if (serverObj.data.teams)
            orderByTeams();
    }, 250);

    clearInterval(serverUpdateInterval);

    serverUpdateInterval = setInterval(function() {
        updateServer(ipIn);
        updateTopPlayer(activeIndex);
        if (serverObj.data.teams) {
            orderByTeams();
            updateTeamBars(serverObj.data.players);
        }
   }, 5000);
}

Template.Lobby.events = {
    'click .connect': function(e) {

        var server = $(e.currentTarget);
        console.log(server);
        ga('send', 'event', 'serverlist', 'connect', server.attr("data-ip"));

        if ($("[data-id='lobby'] .lobby-col-left").hasClass("passworded")) {
            console.log("Is passworded");
            displayPasswordForm(server);
        }
        else {
            console.log("Is not passworded");

            dewRcon.send("connect " + server.attr("data-ip") + " ", function(res) {
            SnackBarOptions.text = res;
            MDSnackbars.show(SnackBarOptions);
            });
        }
    },
    'mouseover .player-list [data-index]' : function(e) {
        e.preventDefault();
        var playerIndex = $(e.currentTarget).attr("data-index");

        updateTopPlayer(playerIndex);
    },
    'mouseout .player-list [data-index]' : function(e) {
           updateTopPlayer(activeIndex);
    },
    'click .player-list [data-index]' : function(e) {
        e.preventDefault();
        var playerIndex = $(e.currentTarget).attr("data-index");

        if (playerIndex == activeIndex) {
            $(".player-list li").removeClass("active-player");   
        }
        else {
            $(".player-list li").removeClass("active-player");   
            $(e.currentTarget).addClass("active-player");
            activeIndex = playerIndex;
            updateTopPlayer(activeIndex);
        }
    }
}
displayPasswordForm = function(server) {
    $(".overlay[data-id=password]").addClass("active");

    $(".overlay[data-id=password] .connect").on("click", function() {
        var password = $(".overlay[data-id=password] #loginPassword").val();
        dewRcon.send("connect " + $(server).attr('data-ip') + " " + password, function(res) {
            SnackBarOptions.text = res;
            MDSnackbars.show(SnackBarOptions);
        });

        $(".overlay[data-id=password]").removeClass("active");
    });

    $(".overlay[data-id=password] .cancel").on("click", function() {
        $(".overlay[data-id=password]").removeClass("active");
    });
}