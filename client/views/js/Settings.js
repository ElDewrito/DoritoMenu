var DEWMENU_LINK = 'http://dewmenu.click';

Template.Settings.helpers({
    setting: function() {
        return GameSettings.find();
    }
});



Template.Settings.events = {
    'keypress input': function(evt, template) {
        ga('send', 'event', 'settings', 'update setting');

        if (evt.which === 13) {
            var command = $(evt.currentTarget).attr("data-command");
            dewRcon.send(command + ' "' + $(evt.currentTarget).val() + '"', function(res) {
                SnackBarOptions.text = res;
                MDSnackbars.show(SnackBarOptions);
            });
        }
    },
    'click #write_config_button': function() {
        dewRcon.send('WriteConfig', function(res) {
            SnackBarOptions.text = res;
            MDSnackbars.show(SnackBarOptions);
        });
    },
    'click #clearStorage': function() {
        dewStorage.clear();
        alert("Storage cleared");
    }
};
