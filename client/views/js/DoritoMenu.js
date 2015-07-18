Template.Splash.events = {
    'click li': function(e) {
        var overlay = $(e.currentTarget).attr("data-menu");
        $('li').removeClass("active");
        $($(e.currentTarget)).toggleClass("active");

        $(".overlay").removeClass("active");
        $(".overlay[data-id=" + overlay + "]").toggleClass("active");

        $("body").attr("data-menu", overlay);
    },

    'click .back' : function(e) {
    	$(".overlay.active").removeClass("active");
    	$("body").removeAttr("data-menu");
    },

    'click .exit-menu' : function(e) {
        dewRcon.send("set_menu false", function(res) {
            console.log(res);
        });
    }
}

Template.Home.rendered = function() {
    MDSnackbars.init();
    StartRconConnection();
    
    // Temporary class manipulation
    $(document).ready(function() {
	    $('body').addClass('load');
	    setTimeout(function() {
	        $('.reveal').removeClass('reveal');
	    }, 500);
	});
}
