SnackBarOptions = {
    text: 'You need to set SnackBarOptions.text before calling show!', // change snackbar's text/html
    toast: false, // change snackbar's style (true = rounded corners)
    align: 'right', // align 'left' or 'right'
    fullWidth: true, // snackbar takes all screen width (overrides align and toast style, also remove default 2px rounded corners)
    timeout: 3000, // delay before the snackbar disappears (if 0, the snackbar is permanent unless another snackbar is triggered or MDSnackbars.hide() is called)
    html: true, // allows HTML insertion
    clickToClose: true // enable/disable click to close behavior
};
var played = false;
DisplayNotification = function(string,override) {
	if(typeof override !== "undefined"){
		played = false;
	}
    SnackBarOptions.text = string;
    MDSnackbars.show(SnackBarOptions);
    if (!played) {
        $('#notification')[0].currentTime = 0;
        $('#notification')[0].volume=0.1;
        $('#notification')[0].play();
        played = true;
    }
}
