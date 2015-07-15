//This only happens in the server instance. This code is not public
var geoip = Meteor.npmRequire('geoip-lite');
var Agent = Meteor.npmRequire('socks5-http-client/lib/Agent');
/*
//Uncomment if using TOR
var httpExtraOptions = {
    timeout: 30000,
    agentClass: Agent,
    agentOptions: {
        socksHost: 'localhost', // Defaults to 'localhost'.
        socksPort: 9050 // Defaults to 1080.
    }
}
*/
var httpExtraOptions = {
    timeout: 30000
}

function UpdateMasterServerList(DewJson) {
    var masterServers, gameServers = [];
    if (typeof DewJson !== "undefined") {
        masterServers = DewJson;
    } else {
        masterServers = MasterServers.find().fetch();
    }
    _.each(masterServers, function(key, val) {
        var hashServer = (CryptoJS.SHA256(masterServers[val].list).toString());
        try {
            var checkMasterResult = HTTP.call("GET", masterServers[val].list, httpExtraOptions);
            if (checkMasterResult.statusCode == 200) {
                console.log("Got response from master (" + masterServers[val].list + ")");
                var Json = JSON.parse(checkMasterResult.content);
                Json.list = masterServers[val].list;

                MasterServers.update({
                    "hash": hashServer,
                }, {
                    $set: Json
                }, {
                    upsert: true
                });
                console.log("Game Servers: " + Json.result.servers);
                _.each(Json.result.servers, function(key, i) {
                    if (!_.contains(gameServers, Json.result.servers[i])) {
                        gameServers.push(Json.result.servers[i]);
                    }
                });
            }
        } catch (e) {
            console.log("Unable to talk to master server (" + masterServers[val].list + ")");
            MasterServers.remove({
                "hash": hashServer,
            });
        }
    });
    if (gameServers.length > 0) {
        var currentGameServers = [];
        _.each(GameServers.find().fetch(), function(server) {
            currentGameServers.push(server.ip);
        });
        var removedServers = _.difference(currentGameServers, gameServers);
        var newServers = _.difference(gameServers, currentGameServers);

        _.each(removedServers, function(server) {
            console.log("Game server shut down" + server);

            var hashGameServer = (CryptoJS.SHA256(server).toString());

            GameServers.remove({
                "hash": hashGameServer
            });
        });

        _.each(newServers, function(server) {
            console.log("New Game Server Online " + server);

            var hashGameServer = (CryptoJS.SHA256(server).toString());
            console.log("hash: " + hashGameServer);
            var GameServer = {
                ip: server
            };
            GameServer.geoIP = geoip.lookup(server.split(":")[0]);

            gameServers.push(GameServer);
            GameServers.update({
                "hash": hashGameServer,
            }, {
                $set: GameServer
            }, {
                upsert: true
            });
        });
    }
}

function UpdateGameServerStats() {
    _.each(GameServers.find().fetch(), function(server) {
        var checkGameResult = HTTP.call("GET", "http://" + server.ip + "/", httpExtraOptions);
        if (checkGameResult.statusCode == 200) {
            server.data = JSON.parse(checkGameResult.content);
            delete server._id;
            GameServers.update({
                "hash": server.hash,
            }, {
                $set: server
            }, {
                upsert: true
            });
        }
        else
        {
            //Unable to talk to server.. is it down? maybe we should remove it...
             GameServers.remove({
                "hash": server.hash,
            });
        }
    });
}

function GetMasterServerList() {
    //Lets get the master server list from github on startup
    //We might want to have this in a 10 minute loop or something, but for now this is fine
    var url = "https://raw.githubusercontent.com/ElDewrito/ElDorito/master/dewrito.json";

    try {
        var result = HTTP.call("GET", url, httpExtraOptions);
    } catch (e) {
        console.log("Error getting master server list.. retrying in 3 seconds.\n" + e.message);
        Meteor.setTimeout(GetMasterServerList, 3000);
        return;
    }
    if (result.statusCode == 200) {
        console.log("response received.");
        var DewJson = JSON.parse(result.content);
        UpdateMasterServerList(DewJson.masterServers);
    } else {
        console.log("Response issue: ", result.statusCode);
        var errorJson = JSON.parse(result.content);
    }

}
Meteor.startup(function() {
    console.log('Hello World!');

    GetMasterServerList();

    //Let's query the master servers every 5 seconds for new games
    //This is fine because the request isn't done on the client, it's done here
    //Once changes are detected, the client will get an update, but only if it's a change!
    Meteor.setInterval(function() {
        UpdateMasterServerList();
    }, 5000);    

    //Every 10 seconds lets query all the game servers for their latest stat data
    Meteor.setInterval(function() {
        UpdateGameServerStats();
    }, 10000);

    //Let's get the master server list every 10 minutes just in case it changed. 
    Meteor.setInterval(function() {
        GetMasterServerList();
    }, 600000);
});
