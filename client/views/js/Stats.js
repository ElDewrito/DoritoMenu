Template.Stats.helpers({
    server: function() {
        return GameServers.find({
            data: {
                $exists: 1
            }
        });
    }
});
