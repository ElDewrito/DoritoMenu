if (Meteor.isClient) {
    htmlEncode = function(value) {
        //create a in-memory div, set it's inner text(which jQuery automatically encodes)
        //then grab the encoded contents back out.  The div never exists on the page.
        return $('<div/>').text(value).html();
    };
    Template.registerHelper('capitalizeFirstLetter', function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    });
    Template.registerHelper('lower', function(string) {
        if (typeof string === "string")
            return string.toLowerCase();
        else
            return string;
    });
    Template.registerHelper('Dew_Version', function() {
        return Session.get("Dew_Version");
    });
    Template.registerHelper('Dew_Player_Name', function() {
        return Session.get("Dew_Player_Name");
    });
    Template.registerHelper('gameRunning', function() {
        return Session.get("dewRconConnected");
    });

    Template.registerHelper('getMOTD', function() {
        return Session.get("motd");
    });
      Template.registerHelper('eq', function(var1, var2) {
        return var1 == var2;
    });
    Template.registerHelper('pingGameServer', function(server) {
        var hashServer = (CryptoJS.SHA256(server).toString());
        var ping = Session.get("ping_"+hashServer);
        if (ping === undefined) {
            return "";
        } else {
            return  ping + "ms";
        }
    });

    Template.registerHelper('getPingBars', function(server) {
        var hashServer = (CryptoJS.SHA256(server).toString());
        var ping = Session.get("ping_"+hashServer);

        if (typeof ping === "undefined") return "";

        var pingType = "";

        if (ping < 80) {
            pingType = "good";
        } else if (ping > 81 && ping < 160) {
            pingType = "okay";
        } else if (ping > 161 && ping < 240) {
            pingType = "bad";
        } else {
            pingType = "worst";
        }

        return '<img class="ping_bars" src="/img/ping-' + pingType + '.png" alt="Ping bar indicator " /> ' + ping + 'ms';
    });
}
