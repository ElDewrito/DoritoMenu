dewRcon = "";
var dewRconConnected = false,
    snacking = 0;

StartRconConnection = function() {
    dewRcon = new dewRconHelper();
    dewRcon.dewWebSocket.onopen = function() {
        DisplayNotification("Connected to Eldewrito!");
        dewRconConnected = true;
        LoadDewStuff();
    };
    dewRcon.dewWebSocket.onerror = function() {
        if (!snacking) {
            DisplayNotification("Not connected to game. Is Eldewrito running?!");
            snacking = 1;
            setTimeout(function() {
                snacking = 0;
            }, 9000);
        }
        dewRconConnected = false;
        if (!dewRconConnected) {
            setTimeout(StartRconConnection, 1000);
        }
    };
    dewRcon.dewWebSocket.onmessage = function(message) {
        dewRcon._cbFunction(message.data);
        dewRcon.lastMessage = message.data;
        console.log(dewRcon.lastMessage);
        console.log(dewRcon.lastCommand);
        console.log(message.data);
    };
}
dewRconHelper = function() {
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    this.dewWebSocket = new WebSocket('ws://127.0.0.1:11776', 'dew-rcon');
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
LoadDewStuff = function() {
    dewRcon.send("Version", function(res) {
        Session.set("Dew_Version", res);
        dewRcon.send("Player.Name", function(res) {
            Session.set("Dew_Player_Name", res);
        });
    });

}
