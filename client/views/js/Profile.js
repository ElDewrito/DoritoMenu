

Template.Profile.helpers({
    player: function() {
       // return GameServers.find({'data.players.name' : "Limited"});

        var pipeline = [
          {$match: { 'data.players.name': 'Limited' }}
        ];
        var result = GameServers.aggregate(pipeline);
        console.log(result);
    }
});

Template.Settings.events = {
    'keypress input': function(evt, template) {
        ga('send', 'event', 'settings', 'update setting');

        if (evt.which === 13) {
            var command = $(evt.currentTarget).attr("data-command");
            dewRcon.send(command + " " + $(evt.currentTarget).val(), function(res) {
                SnackBarOptions.text = res;
                MDSnackbars.show(SnackBarOptions);
            });
        }
    }
}
