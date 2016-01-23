
dewStorage = (function () {
	var module = {};

	module.available = function () {
		try {
			return 'localStorage' in window && window['localStorage'] !== null;
		} catch (e) {
			return false;
		}
	},

	module.get = function (name) {
		var item = localStorage.getItem(name);

		if (item !== undefined)
			return item;
		else
			return false;
	},

	module.set = function (name, val) {
		localStorage.setItem(name, val);            
	},

	module.setArray = function (name, val) {
		var tmp = JSON.parse(dewStorage.get(name));
		if (tmp == null) {
			tmp = [];
		}

		tmp.push(val);

		dewStorage.set(name, JSON.stringify(tmp));
	},

	module.removeFromArray = function (name, val) {
		var tmp = JSON.parse(dewStorage.get(name));
		if (tmp == null) return false;

		var i = tmp.indexOf(val);

		if (i > -1) {
			tmp.splice(i, 1);
		}

		dewStorage.set(name, JSON.stringify(tmp));
	},

	module.clear = function () {
		localStorage.clear();
	},

	module.checkDefault = function(val) {

		if (dewStorage.get("default") == "1" || dewStorage.get("default") == "0" ) return;

		var menuUrl = val[0].value;

		if (menuUrl.indexOf("DEWMENU_LINK") <= -1) {

			$(".overlay[data-id=setMenu]").addClass("active");

			$(".overlay[data-id=setMenu] .confirm").on("click", function() {
				dewRcon.send('game.menuurl ' + DEWMENU_LINK);
				SnackBarOptions.text = "Dewmenu set as the default";
				MDSnackbars.show(SnackBarOptions);
				$(".overlay[data-id=setMenu]").removeClass("active");
        		ga('send', 'event', 'settings', 'set default', 'true');
				dewStorage.set("default", "1");
			});

			$(".overlay[data-id=setMenu] .cancel").on("click", function() {
        		ga('send', 'event', 'settings', 'set default', 'false');
				$(".overlay[data-id=setMenu]").removeClass("active");
				dewStorage.set("default", "0");
			});
		}
	},

	module.loadSettings = function () {
		var isCondensed = dewStorage.get("condensed");

		if (isCondensed == "false") {
			toggleCondensed(false);
		}

		var pings = dewStorage.get("orderByPing");

		if (pings == "true") {
			orderPing(false);
		}

		checkFavouriteList();
	}
	module.active = module.available();
	return module;
})();