Template.Splash.events = {
    'click li': function(e) {
        var overlay = $(e.currentTarget).attr("data-menu");
        $('li').removeClass("active");
        $($(e.currentTarget)).toggleClass("active");
        $(".overlay[data-id=" + overlay + "]").toggleClass("active");

        $("body").attr("data-menu", overlay);
    }
}

Template.Home.rendered = function() {
    MDSnackbars.init();
    StartRconConnection();
    
    // Temporary class manipulation
    $('body').addClass('load');
    setTimeout(function() {
        $('.reveal').removeClass('reveal');
    }, 500);
}
