Template.Splash.events = {
	'click li': function(e) {
		var overlay = $(e.currentTarget).attr("data-menu");
		$('li').removeClass("active");
		$($(e.currentTarget)).toggleClass("active");

		$(".overlay").removeClass("active");
		$(".overlay[data-id=" + overlay + "]").toggleClass("active");

		$("body").attr("data-menu", overlay);
	},

	'click .back': function(e) {
		$(".overlay.active").removeClass("active");
		$("body").removeAttr("data-menu");
	},

	'click .exit-menu': function(e) {
		dewRcon.send("set_menu false", function(res) {
			console.log(res);
		});
	},
	'click .train-menu' : function(e) {
		e.preventDefault();
        ga('send', 'event', 'settings', 'change-menu', 'train');
		window.location.href = "http://thefeeltrain.github.io";
	}
}

Template.Home.rendered = function() {
	(function(i, s, o, g, r, a, m) {
		i['GoogleAnalyticsObject'] = r;
		i[r] = i[r] || function() {
			(i[r].q = i[r].q || []).push(arguments)
		}, i[r].l = 1 * new Date();
		a = s.createElement(o),
		m = s.getElementsByTagName(o)[0];
		a.async = 1;
		a.src = g;
		m.parentNode.insertBefore(a, m)
	})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

	ga('create', 'UA-65054935-2', 'auto');
	ga('send', 'pageview');

	MDSnackbars.init();
	StartRconConnection();

		// Temporary class manipulation
		$(document).ready(function() {
			$('body').addClass('load');
			setTimeout(function() {
				$('.reveal').removeClass('reveal');
			}, 500);

			var debugParam = getQueryVariable("debug");

    		dewStorage.loadSettings();

			cheet('d o d g e r', function () {
        		ga('send', 'event', 'settings', 'banned', 'dodge');
				$(".banned").addClass("active");
			});

			if (debugParam == 1)
				$("body").addClass("debug");

			var connectParam = getQueryVariable("connect");
			var passParam = getQueryVariable("password");

			if (connectParam != null) {
				if (passParam == false) passParam = "";
				if (/[^0-9.:]+/g.test(connectParam) == false && /[^0-9a-zA-Z.:]+/g.test(passParam) == false) {
					setTimeout(function() {
						dewRcon.send("connect " + connectParam + passParam, function(res) {
							SnackBarOptions.text = res;
							MDSnackbars.show(SnackBarOptions);
						});
					}, 2000);
				}
			}
		});
	}

	function getQueryVariable(variable) {
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for (var i=0;i<vars.length;i++) {
			var pair = vars[i].split("=");
			if(pair[0] == variable){return pair[1];}
		}
		return(false);
	}