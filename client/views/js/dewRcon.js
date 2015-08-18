dewRcon = "";
dewRconConnected = false;
snacking = 0;

StartRconConnection = function() {
    dewRcon = new dewRconHelper();
    dewRcon.dewWebSocket.onopen = function() {
        DisplayNotification("Connected to Eldewrito!");
        dewRconConnected = true;
        Session.set('dewRconConnected', true);
        LoadDewStuff();
    };
    dewRcon.dewWebSocket.onerror = function() {
        dewRconConnected = false;
        Session.set('dewRconConnected', false);
        if (!dewRconConnected) {
            if (DewRconPortIndex == 0) {
                DewRconPortIndex = 1;
                snacking = 1;
                StartRconConnection();
            } else {
                DewRconPortIndex = 0;
                snacking = 0;
                setTimeout(StartRconConnection, 1000);
            }
            if (!snacking) {
                DisplayNotification("Not connected to game. Is Eldewrito running?!");
                snacking = 1;
                setTimeout(function() {
                    snacking = 0;
                }, 9000);
            }
        }
        console.error("WebSocket could not be established, check game is running");
    };
    dewRcon.dewWebSocket.onmessage = function(message) {
        dewRcon._cbFunction(message.data);
        dewRcon.lastMessage = message.data;
    };
}
var DewRconPortIndex = 0;
var DewRconPorts = [11764, 11776];
dewRconHelper = function() {
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    this.dewWebSocket = new WebSocket('ws://127.0.0.1:' + DewRconPorts[DewRconPortIndex], 'dew-rcon');
    this.lastMessage = "";
    this.lastCommand = "";
    this.open = false;
    this._cbFunction = {};
    this.send = function(command, cb) {
        try {
            this._cbFunction = cb;
            this.dewWebSocket.send(command);
            this.lastCommand = command;
        } catch (e) {
            DisplayNotification("Unable to communicate with Eldewrito. Is the game running?", true);
        }
    }
}


//TODO: make it so these don't have to be chained.. Darn CB Functions.
GameSettings = new Meteor.Collection(null);
var settingsBlacklist = ['Execute', 'Help', 'WriteConfig'];
LoadDewStuff = function() {
    //Lets get all the settings!
    dewRcon.send("help", function(res) {
        settings = res.split(/\n/);
        _.each(settings, function(key, val) {
            var settingsPart1 = key.split(' ', 2);
            var settingsHelp = key.split(' - ');
            if (settingsPart1[1] == "-") {
                settingsPart1[1] = "";
            }
            if ($.inArray(settingsPart1[0], settingsBlacklist) == -1) {
                var category = settingsPart1[0].split('.', 1);
                var insertSetting = {
                    category: category[0],
                    command: settingsPart1[0],
                    value: settingsPart1[1],
                    help: settingsHelp
                }
                GameSettings.insert(insertSetting);

                switch (settingsPart1[0]) {
                    case 'Player.Name':
                        Session.set("Dew_Player_Name", settingsPart1[1]);
                    default:
                        //not implemented
                }
            }
        });
        dewRcon.send("Game.Version", function(version) {
            Session.set("Dew_Version", version);
            dewRcon.send('Game.MenuURL "' + window.location + '"', function(ret) {
                dewRcon.send('WriteConfig', function(ret) {
                    //Save menu url
                });
            });
        });
    
        var menuSetting = GameSettings.find({ command: 'Game.MenuURL'}).fetch();
        if (menuSetting !== undefined)
            dewStorage.checkDefault(menuSetting);
    });
}
