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
seq_contacts = '';
seq_value = '';
action = '';
last_time = '';
helfer = '';
value_a = '';
value_b = '';
value_c = '';

module.exports = NodeHelper.create({
	// Subclass start method.
    start: function() {
        var self = this;
        //console.log("Starting node helper for: " + self.name);
		//this.intializeButtons();
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
			//console.log('A triggered: ' + value)
			value_a = value;
			if(value_b != ''){
				helfer = f3('B');
			  }
		  });
		  
		  B.watch(function (err, value) {
			if (err) {
			  throw err;
			}
			//console.log('B triggered: ' + value)
			value_b = value;
			if(value_a != ''){
				helfer = f3('A');
			  }
		  });

		  C.watch(function (err, value) {
			if (err) {
			  throw err;
			}
			//console.log('C triggered: ' + value)
			helfer = f2('C',value);
		  });

		  function f2(contact, value){
			seq_contacts = seq_contacts + contact;
			seq_value = seq_value + value;
			if(last_time==''){//set if not already set
				last_time = moment();
			}
			var b = moment();
			var vdiff = b.diff(last_time,'millisecond');

			//for A & B ist timediff needed, for C not really
			if(seq_contacts.indexOf('C')!=-1){//only react on C0 which is C-Button Press (not C-Button UP)
				if(vdiff>10){
					//action = frichtung('C0');
					action = 'PRESSED';
					//console.log('Zeitdifferenz:',b.diff(last_time,'millisecond'));
					//console.log('seq_contacts/value:', seq_contacts+seq_value);
					//console.log('action: ',action);
					sleep_ms(250);
					//reset variables
					last_time = '';
					seq_contacts = '';
					seq_value = '';

				}else if(vdiff>40){
					//console.log('Zeitdifferenz:',b.diff(last_time,'millisecond'));
					//console.log('seq_contacts/value:', seq_contacts+seq_value);
					//reset variables
					last_time = '';
					seq_contacts = '';
					seq_value = '';
				}
			}

			if(action=='PRESSED'){
				self.sendSocketNotification('PRESSED',{inputtype: 'PRESSED'});
				action = '';
				return;
			}
			action = '';
			return;
		  }

		  function f3(contact){
			if(contact == 'A'){
				action = 'CW';
			}else if(contact == 'B'){
				action = 'CCW';
			}

			//reset variables
			contact = '';
			value_a = ''; 
			value_b = '';

			if(action=='CW'){
				self.sendSocketNotification('CW',{inputtype: 'CW'});
				action = '';
				return;
			}else if(action=='CCW'){
				self.sendSocketNotification('CCW',{inputtype: 'CCW'});
				action = '';
				return;
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
		};
	},
	
});
