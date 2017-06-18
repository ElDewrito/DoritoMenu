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
                //console.log("Got response from master (" + masterServers[val].list + ")");
                var Json = JSON.parse(checkMasterResult.content);
                Json.list = masterServers[val].list;

                MasterServers.update({
                    "hash": hashServer,
                }, {
                    $set: Json
                }, {
                    upsert: true
                });
                // console.log("Game Servers: " + Json.result.servers);
                _.each(Json.result.servers, function(key, i) {
                    if (!_.contains(gameServers, Json.result.servers[i])) {
                        gameServers.push(Json.result.servers[i]);
                    }
                });
            }
        } catch (e) {
            //console.log("Unable to talk to master server (" + masterServers[val].list + ")");
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
            console.log("Game server shut down " + server);

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
            console.log(geoip.pretty(server.split(":")[0]));

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
        try {
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
            } else {
                //Unable to talk to server.. is it down? maybe we should remove it...
                GameServers.remove({
                    "hash": server.hash,
                });
            }
        } catch (e) {
            //network issue? Timeout?
            GameServers.remove({
                "hash": server.hash,
            });
        }
    });
}

function GetMasterServerList() {
    //Lets get the master server list from github on startup
    //We might want to have this in a 10 minute loop or something, but for now this is fine
    
	// Thanks TheDarkConduit for the heads up on URL change.
	var url = "https://raw.githubusercontent.com/ElDewrito/ElDorito/master/dist/dewrito.json";

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

    // MatchmakingPlayers.cle

    // for (var i = 1; i < 10; i++ ){
    //     console.log("adding player" + i);
    //     var player = {
    //         name : "Player" + i,
    //         ip: "127.0.0.1",
    //         uid: "player.uuid" + i,
    //         netspeed: randomBetween(1000, 15000)
    //     }        

    //     MatchmakingPlayers.insert(player);
    // }
    Meteor.methods({
        'HaloClickLogin': function() {
            this.unblock();
            var data = ServerCookies.retrieve(this.connection);
            var cookies = data && data.cookies;
            if (cookies["pass_hash"] == "" || cookies["session_id"] == "") {
                throw new Meteor.Error("HaloClickAPI", "Not logged into halo.click, your account will not store stats or be allowed to join official Halo.Click servers");
                return;
            }
            var click_user = Meteor.http.call("GET", "https://forum.halo.click/api/authenticate_session?session_password=" + cookies["pass_hash"] + "&session_id=" + cookies["session_id"] + "&api_key=" + HaloClickGoodies.APIKEY);
            var user = JSON.parse(click_user.content);
            if (typeof user.member_id === "undefined") {
                throw new Meteor.Error("HaloClickAPI", "Not logged into halo.click, your account will not store stats or be allowed to join official Halo.Click servers");
                return;
            }
            console.log("User Auth Request: " + user.name);
            var userAcct = Meteor.users.findOne({
                "profile.click_id": user.member_id
            });
            var userObj = {
                username: user.name,
                email: user.email,
                password: user.magic_password,
                profile: {
                    title: user.title,
                    group: user.member_group_id,
                    display_name: user.members_display_name,
                    joined: user.joined,
                    avatar: user.pp_main_photo,
                    avatar_thumb: user.pp_thumb_photo,
                    banned: user.member_banned,
                    click_id: user.member_id
                }
            };
            if (typeof userAcct === "undefined") {
                Accounts.createUser(userObj);
            } else {
                Meteor.users.update({
                    "profile.click_id": user.member_id
                }, {
                    $set: userObj
                });
            }
            return {
                email: user.email,
                password: user.magic_password
            };
        }
    });
    Meteor.publish("MasterServers", function() {
        return MasterServers.find();
    });
    Meteor.publish("GameServers", function() {
        return GameServers.find();
    });
    Meteor.publish("MatchmakingPlayers", function() {
        return MatchmakingPlayers.find();
    });
});

// Temporary function
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
