Template.MOTD.rendered = function() {
    $(document).ready(function() {

        $.ajax({
            dataType: "json",
            url: "/motd.json",
            timeout: 15000,
            async: true,
            crossDomain: true,
            success: function(data) {
                if (data.active !== undefined && data.active) {
                    msg = "<strong>MOTD</strong> - " + data.author + ": " + data.message;

                   if (checkMOTD(data.motdID) == false) {
                        displayMOTD(data);
                   }
                }
            }
        });  
    });
}

Template.MOTD.events = {
    'click .motd-splash .accept': function(e) {
        e.preventDefault();
        $(".motd-splash, .motd-splash-blur").removeClass("show");
        var motdId = $(".motd-splash").attr("data-motd-id");

        dewStorage.setArray("motd", motdId);
    }
}

checkMOTD = function(id) {
    var motd = JSON.parse(dewStorage.get("motd"));
    if (motd == null) return false;
    if (motd.indexOf(id.toString()) >= 0)
        return true;
    else
        return false;
},

displayMOTD  = function(data) {
    $(".motd-splash, .motd-splash-blur").addClass("show");
    $(".motd-splash").attr("data-motd-id", data.motdID);

    $(".motd-splash .motd-heading").html(data.heading);
    $(".motd-splash .motd-body").html(data.body);
}
