Template.ListServers.helpers({
    server: function() {
        return GameServers.find({
            data: {
                $exists: 1
            }
        });
    }
});

Template.ListServers.events = {
    'click .row.server-item': function(e) {
        var server = $(e.currentTarget).attr("data-ip");
        if ($(e.currentTarget).hasClass("passworded")) {
            var password = prompt("Please type the sever password to connect");
        }
        dewRcon.send("connect " + server + " " + password, function(res) {
            SnackBarOptions.text = res;
            MDSnackbars.show(SnackBarOptions);
        });
    }
}
Template.ListServers.rendered = function() {
    //Lets check for pings when the server list is rendered
    //Lets also re-check pings every 10 seconds from the client
    setInterval(function() {
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
                }
            });
        });
    }, 10000);
}
