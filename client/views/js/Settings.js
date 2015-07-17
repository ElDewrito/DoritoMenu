Template.Settings.helpers({
    setting: function() {
        return GameSettings.find();
    }
});

Template.Settings.events = {
    'keypress input': function(evt, template) {
        if (evt.which === 13) {
            var command = $(evt.currentTarget).attr("data-command");
            dewRcon.send(command + " " + $(evt.currentTarget).val(), function(res) {
                SnackBarOptions.text = res;
                MDSnackbars.show(SnackBarOptions);
            });
        }
    }
}
