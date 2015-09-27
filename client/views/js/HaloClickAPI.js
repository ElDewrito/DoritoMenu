DoHaloClickMagic = function() {
    Deps.autorun(function() {
        if (ServerCookies.ready()) {
            Meteor.call('HaloClickLogin', function(error, user) {
                if (error) {
                	Meteor.logout();
                    DisplayNotification(error.reason);
                    return;
                }
                return Meteor.loginWithPassword(user.email, user.password, function(error) {
                    if (error) {
                    	Meteor.logout();
                        DisplayNotification(error.reason);
                    } else {
                        DisplayNotification("Logged into Halo.Click as " + Meteor.user().username);
                    }
                });
            });
        }
    });
}
