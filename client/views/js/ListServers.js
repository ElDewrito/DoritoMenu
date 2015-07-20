Template.ListServers.helpers({
    server: function() {
        return GameServers.find({
            data: {
                $exists: 1
            }
        });
    },

    serverCount: function() {
        return GameServers.find().count();
    },

    playerCount: function() {
        // Ugh, if we had mongo db aggregate we could so this so cleanly.
        var servers = GameServers.find({ 'data.players': { $exists: true}, $where : "this.data.players.length > 0" }).fetch()
        var totalPlayers = 0;

        servers.forEach(function(server) {
            if (server.data !== undefined && server.data.players !== undefined) {
                totalPlayers += server.data.players.length;
            }
        });
        return totalPlayers;
    },

    matchMap: function(map) {
        GameServers.find({ 'data.map' : map }).fetch()
    },

    equals: function(a, b) {
        return (a === b);
    }
});

function orderByPing() {
    var $container = $('.overlay[data-id=gameservers] .list-wrapper');
    var $servers = $('.server-item').detach();

    $servers = $servers.sort(function(a, b) {
        var pingA = $(a).find('.ping').text();
        pingA = parseInt(pingA.substring(0, pingA.length), 10);

        var pingB = $(b).find('.ping').text();
        pingB = parseInt(pingB.substring(0, pingB.length), 10);

        if (isNaN(pingA))
            pingA = 10000;

        if (isNaN(pingB))
            pingB = 10000;

        return pingA > pingB ? 1 : -1;
    });

    $container.html($servers);
}

var orderByPingToggle = false;

Template.ListServers.events = {
    'click .row.server-item': function(e) {
        var server = $(e.currentTarget).attr("data-ip");
        if ($(e.currentTarget).hasClass("passworded")) {
            var password = prompt("Please type the sever password to connect");
        }

        ga('send', 'event', 'serverlist', 'connect', server);

        dewRcon.send("connect " + server + " " + password, function(res) {
            SnackBarOptions.text = res;
            MDSnackbars.show(SnackBarOptions);
        });
    },
    'click .orderByPing' : function(e) {
        ga('send', 'event', 'serverlist', 'sort ping');
        
        $(".orderByPing").toggleClass("active");

        orderByPingToggle = !orderByPingToggle;

        if (orderByPingToggle)
            orderByPing();        
    },

    'click .togglePassworded' : function(e) {

        ga('send', 'event', 'serverlist', 'toggle passworded');

        $(".list-wrapper").toggleClass(".hidePassworded");

        var btnText = "";

        if ($(".list-wrapper").hasClass(".hidePassworded")) {
            $(".list-wrapper .passworded").addClass("filtered");
            btnText = "Show Locked";
        }
        else  {
            $(".list-wrapper .passworded").removeClass("filtered");   
            btnText = "Hide Locked";
        }

        $(".togglePassworded").text(btnText);
    },

    'click .condensed-mode' : function(e) {
        ga('send', 'event', 'serverlist', 'toggle condensed mode');

        $(".list-wrapper").toggleClass("condensed-view");
        $(".condensed-mode").toggleClass("active");

        var isCondensed = $(".condensed-mode").hasClass("active");

        Cookies.set("condensed", isCondensed);

    },

    'click .quick-join' : function(e) {
        ga('send', 'event', 'serverlist', 'quick-join');
        SnackBarOptions.text = "Quick joining...";
        MDSnackbars.show(SnackBarOptions);

        orderByPingToggle = true;
        updatePings();

        var server = $(".server-item:not(.passworded):not(.full").eq(0).attr("data-ip");

        dewRcon.send("connect " + server + " " + "", function(res) {
            SnackBarOptions.text = res;
            MDSnackbars.show(SnackBarOptions);
        });
    }
}

function updatePings() {
     _.each(GameServers.find().fetch(), function(server) {
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
                if (orderByPingToggle)
                    orderByPing();
            }
        });
    });
}
Template.ListServers.rendered = function() {
    //Lets check for pings when the server list is rendered
    //Lets also re-check pings every 10 seconds from the client
    updatePings();
    setInterval(function() {
       updatePings();
    }, 10000);

    $.ajax({
        dataType: "json",
        url: "/motd.json",
        timeout: 15000,
        async: true,
        crossDomain: true,
        success: function(data) {
            if (data.active !== undefined && data.active) {
                msg = "<strong>MOTD</strong> - " + data.author + ": " + data.message;
                Session.set("motd", msg);
            }
        }
    });   

    var isCondensed = Cookies.get("condensed");

    if (isCondensed) {
        $(".list-wrapper").toggleClass("condensed-view");
        $(".condensed-mode").toggleClass("active");
    }
    console.log(isCondensed);
}