/* Magic Mirror
 * Node Helper: {MMM-Navigate}
 *
 * By {AxLED}
 * {MIT} Licensed.
 */

 //Debugging
 //tail -f ~/.pm2/logs/mm-out-0.log
 //tail -f ~/.pm2/logs/mm-error-0.log 

const Gpio = require('onoff').Gpio;
const moment = require('moment');//needed for time
var NodeHelper = require("node_helper");
//Variables
action = '';
helfer = '';
value_a = '';
value_b = '';

module.exports = NodeHelper.create({
	// Subclass start method.
  start: function() {
		var self = this;
		this.loaded = false;
	},
	
	intializeButtons: function() {
		//Rotary Code...
		var self = this;

		console.log('MMM-Navigate, listen on GPIO PINs (BCM): '+self.config.GPIOPins[0]+','+self.config.GPIOPins[1]+','+self.config.GPIOPins[2]);
		const A = new Gpio(self.config.GPIOPins[0], 'in', 'both',{debounceTimeout : 50 }); //BCM Pin 26
		const B = new Gpio(self.config.GPIOPins[1], 'in', 'both',{debounceTimeout : 50 }); //BCM Pin 20
		const C = new Gpio(self.config.GPIOPins[2], 'in', 'both',{debounceTimeout : 20 }); //BCM Pin 19

		A.watch(function (err, value) {
			if (err) {
			  throw err;
			}
			value_a = value;
			if(value_b != ''){
				helfer = f3('B');
			  }
		  });
		  
		B.watch(function (err, value) {
			if (err) {
			  throw err;
			}
			value_b = value;
			if(value_a != ''){
				helfer = f3('A');
			  }
		  });

		C.watch(function (err, value) {
			if (err) {
			  throw err;
			}
			if(value == 0){
				helfer = f3('C');
			}
		  });

		function f3(contact){
			if(contact == 'A'){
				action = 'CW';
			}else if(contact == 'B'){
				action = 'CCW';
			}else if(contact == 'C'){
				action = 'PRESSED';
			}

			//reset variables
			contact = '';
			value_a = ''; 
			value_b = '';

			if(action=='CW' || action=='CCW' || action=='PRESSED'){
				self.sendSocketNotification(action,{inputtype: ""+action+""});
			}
		}
		  
		// Milliseconds
		function sleep_ms(millisecs) {
			var initiation = new Date().getTime();
			while ((new Date().getTime() - initiation) < millisecs);
		}
	},

	// Override socketNotificationReceived method.
	socketNotificationReceived: function(notification, payload) {
		if (notification === 'START') {
			console.log("Working notification system. Notification:", notification, "payload: ", payload);
			// Send notification
			this.sendSocketNotification('MSG', {message: 'test'});
		}else if (notification === 'BUTTON_CONFIG') {     
			this.config = payload.config;
			this.intializeButtons();
		}
	},
	
});
