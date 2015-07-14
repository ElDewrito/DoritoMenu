//This only happens in the server instance. This code is not public
var geoip = Meteor.npmRequire('geoip-lite');


function UpdateMasterServerList(DewJson) {
    var masterServers;
    if (typeof DewJson !== "undefined") {
        masterServers = DewJson;
    } else {
        masterServers = MasterServers.find().fetch();
    }
    _.each(masterServers, function(key, val) {
        var hashServer = (CryptoJS.SHA256(masterServers[val].list).toString());
        try {
            var checkMasterResult = HTTP.call("GET", masterServers[val].list, {
                timeout: 30000
            });
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
            }
        } catch (e) {
            console.log("Unable to talk to master server (" + masterServers[val].list + ")");
            MasterServers.remove({
                "hash": hashServer,
            });
        }
    });
}

Meteor.startup(function() {
    console.log('Hello World!');

    //Lets get the master server list from github
    var url = "https://raw.githubusercontent.com/ElDewrito/ElDorito/master/dewrito.json";

    var result = HTTP.call("GET", url, {
        timeout: 30000
    });
    if (result.statusCode == 200) {
        console.log("response received.");
        var DewJson = JSON.parse(result.content);
        UpdateMasterServerList(DewJson.masterServers);
    } else {
        console.log("Response issue: ", result.statusCode);
        var errorJson = JSON.parse(result.content);
        throw new Meteor.Error(result.statusCode, errorJson.error);
    }


    //Let's query the master servers every 5 seconds for new games
    //This is fine because the request isn't done on the client, it's done here
    //Once changes are detected, the client will get an update, but only if it's a change!
    Meteor.setInterval(function() {
        UpdateMasterServerList();
    }, 5000);
});
