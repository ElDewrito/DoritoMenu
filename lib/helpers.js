if (Meteor.isClient) {
    htmlEncode = function(value) {
        //create a in-memory div, set it's inner text(which jQuery automatically encodes)
        //then grab the encoded contents back out.  The div never exists on the page.
        return $('<div/>').text(value).html();
    }
    Template.registerHelper('capitalizeFirstLetter', function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    });
    Template.registerHelper('lower', function(string) {
        return string.toLowerCase();
    });    
    Template.registerHelper('Dew_Version', function() {
        return Session.get("Dew_Version");
    });    
    Template.registerHelper('Dew_Player_Name', function() {
        return Session.get("Dew_Player_Name");
    });
    Template.registerHelper('pingGameServer', function(server) {
        var hashServer = (CryptoJS.SHA256(server).toString());
        return Session.get("ping_"+hashServer);
    });
}