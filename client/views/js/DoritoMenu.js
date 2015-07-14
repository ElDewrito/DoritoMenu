Template.Splash.events = {
    'click li': function(e) {
        var overlay = $(e.currentTarget).attr("data-menu");
        $('li').removeClass("active");
        $($(e.currentTarget)).toggleClass("active");
        $(".overlay[data-id=" + overlay + "]").toggleClass("active");
    }
}

Template.Home.rendered = function() {
    $('body').delay(10).addClass('load');
}
