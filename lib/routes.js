Router.configure({
    loadingTemplate: 'loading',
    layoutTemplate: 'layout'
});
Accounts.config({
    forbidClientAccountCreation: true
});
Router.route('/', {
    name: 'home',
    fastRender: true,
    waitOn: function() {
        return [Meteor.subscribe('MasterServers'), Meteor.subscribe('GameServers'), Meteor.subscribe('MatchmakingPlayers')];
    }
});
