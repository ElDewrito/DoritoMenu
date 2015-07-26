var imageAddr = "img/speedtest.jpg";
var downloadSize = 3591548; //bytes

MeasureConnectionSpeed = {};
MeasureConnectionSpeed.download = function() {
    var startTime, endTime;
    var download = new Image();
    download.onload = function() {
        endTime = (new Date()).getTime();
        showResults();
    }

    download.onerror = function(err, msg) {
        console.log("Invalid image, or error downloading");
    }

    startTime = (new Date()).getTime();
    var cacheBuster = "?nnn=" + startTime;
    download.src = imageAddr + cacheBuster;

    function showResults() {
        var duration = (endTime - startTime) / 1000;
        var bitsLoaded = downloadSize * 8;
        var speedBps = (bitsLoaded / duration).toFixed(2);
        var speedKbps = (speedBps / 1024).toFixed(2);
        var speedMbps = (speedKbps / 1024).toFixed(2);
        console.log("Your connection speed is: <br />" +
            speedBps + " bps<br />" +
            speedKbps + " kbps<br />" +
            speedMbps + " Mbps<br />");
    }
}
MeasureConnectionSpeed.upload = function() {
    console.log('not implemented yet');
}
