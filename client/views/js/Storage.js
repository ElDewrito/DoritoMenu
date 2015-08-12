dewStorage = (function () {
    var module = {};

    console.log("Storage module loaded");

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

    module.checkCondensed = function () {
      var isCondensed = dewStorage.get("condensed");

        if (isCondensed == "true") {
            console.log("condensed:yes");
            toggleCondensed(false);
        } else
        	console.log("condensed: no");
    }
    module.active = module.available();
    return module;
})();