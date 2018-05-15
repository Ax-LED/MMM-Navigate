/* Magic Mirror
 * Node Helper: {MMM-Navigate}
 *
 * By {AxLED}
 * {MIT} Licensed.
 */

 //Debugging
 //tail -f ~/.pm2/logs/mm-out-0.log
 //tail -f ~/.pm2/logs/mm-error-0.log 

const Gpio = require('onoff').Gpio
const moment = require('moment');//needed for time
var NodeHelper = require("node_helper");
last_time = '';
helfer = '';

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
		const A = new Gpio(self.config.GPIOPins[0], 'in', 'both',{debounceTimeout : 20 }) //BCM Pin 26
		const B = new Gpio(self.config.GPIOPins[1], 'in', 'both',{debounceTimeout : 20 }) //BCM Pin 20
		const C = new Gpio(self.config.GPIOPins[2], 'in', 'both',{debounceTimeout : 20 }) //BCM Pin 19*/

		A.watch(function (err, value) {
			if (err) {
			  throw err
			}
			//console.log('A triggered: ' + value)
			helfer = f2('A',value);
		  })
		  
		  B.watch(function (err, value) {
			if (err) {
			  throw err
			}
			//console.log('B triggered: ' + value)
			helfer = f2('B',value);
		  })
		  
		  C.watch(function (err, value) {
			if (err) {
			  throw err
			}
			//console.log('C triggered: ' + value)
			helfer = f2('C',value);
		  })
		  
		  //Variables
		  seq_contacts = '';
		  seq_value = '';
		  action = '';
		  
		  function f2(contact, value){
			seq_contacts = seq_contacts + contact;
			seq_value = seq_value + value;
			if(last_time==''){//set if not already set
				last_time = moment();
			}
			var b = moment();
			var vdiff = b.diff(last_time,'millisecond');

			//for A & B ist timediff needed, for C not really
			if((seq_contacts.indexOf('A')!=-1 || seq_contacts.indexOf('B')!=-1) && (seq_contacts.indexOf('C')==-1)){
				if(vdiff>30){
					action = frichtung(seq_contacts+seq_value);
					//console.log('Zeitdifferenz:',b.diff(last_time,'millisecond'));
					//console.log('seq_contacts/value:', seq_contacts+seq_value);
					//console.log('action: ',action);
					sleep_ms(200);
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

			}else if(seq_contacts.indexOf('C')!=-1){//only react on C0 which is C-Button Press (not C-Button UP)
				
				if(vdiff>10){

					action = frichtung('C0');
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

			if(action=='CW'){
				self.sendSocketNotification('CW',{inputtype: 'CW'});
				action = '';
				return;
			}else if(action=='CCW'){
				self.sendSocketNotification('CCW',{inputtype: 'CCW'});
				action = '';
				return;
			}else if(action=='pressed'){
				self.sendSocketNotification('pressed',{inputtype: 'pressed'});
				action = '';
				return;
			}
			action = '';
			return;
		  }
		  
		  // Milliseconds
		  function sleep_ms(millisecs) {
			  var initiation = new Date().getTime();
			  while ((new Date().getTime() - initiation) < millisecs);
			}

		  function frichtung(seq){
			 switch(seq){
				//CW
				case 'A0':
				case 'AA00':
				case 'AA10':
				case 'AB00':
				case 'AB01':
				case 'AB11':
				case 'ABA010':
				case 'ABA000':
				case 'ABABAB110011':
				case 'BA01':
				case 'BA10':
				case 'BAABA10001':
				case 'BAA010':
				case 'BAA110':
				case 'BAA111':
				case 'BAB011':
				case 'BABA1001':
				case 'BABA1110':
				case 'BABAB00011':
				case 'BABAB10011':
				case 'BABAB10010':
				case 'BABA0001':
				case 'AABAB10011':
				case 'ABA001':
				case 'BAABA00001':
				case 'BAABB10001':
				  seq = 'CW';
				  return seq;
				  break;
				//CCW
				case 'AB01':
				case 'AB10':
				case 'ABA000':
				case 'ABA011':
				case 'ABB001':
				case 'ABB110':
				case 'ABB111':
				case 'ABAA1000':
				case 'ABABA10000':
				case 'ABABB10001':
				case 'B0':
				case 'BA00':
				case 'BA11':
				case 'BB01':
				case 'BB10':
				case 'BAA000':
				case 'BAB001':
				case 'BAB110':
				case 'BABABB000001':
				case 'BABABA010001':
				case 'BABB1110':
				case 'BBAB1001':
				case 'BBABA10001':
				case 'BBABA10000':
				case 'BBABB10001':
				case 'ABABA10011':
				case 'ABAB1001':
					seq = 'CCW';
					return seq;
					break;
				//Rotary pressed
				case 'C0':
				case 'CC00':
				case 'CC01':
				case 'CC10':
				case 'CCCC1010':
					seq = 'pressed';
					return seq;
					break;
			}
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
