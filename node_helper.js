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
var NodeHelper = require("node_helper");
const exec = require("child_process").exec;
const url = require("url");

//Variables
var lastStateCLK = 0;

module.exports = NodeHelper.create({
	// Subclass start method.
  start: function() {
		var self = this;
		this.loaded = false;
		this.createRoutes();
	},
	
	intializeRotary: function() {

		//Rotary Code..
		this.loaded = true;
		var self = this;

		console.log('MMM-Navigate, listen on GPIO PINs (BCM): '+self.config.GPIOPins[0]+','+self.config.GPIOPins[1]+','+self.config.GPIOPins[2]);
		const CLK = new Gpio(self.config.GPIOPins[1], 'in', 'both',{debounceTimeout : 0 }); //BCM Pin 20
		const DT = new Gpio(self.config.GPIOPins[0], 'in', 'both',{debounceTimeout : 0 }); //BCM Pin 26
		const SW = new Gpio(self.config.GPIOPins[2], 'in', 'both',{debounceTimeout : 20 }); //BCM Pin 19

		CLK.read(function (err, value) {
			if (err) {
			  throw err;
			}
			this.lastStateCLK = value;
			this.a = value;
		});

		DT.read(function (err, value) {
			if (err) {
			  throw err;
			}
			this.b = value;
		});
		
		CLK.watch(function (err, value) {
			if (err) {
			  throw err;
			}
			this.a = value;
		});
		
		DT.watch(function (err, value) {
			if (err) {
				throw err;
			}
			this.b  = value;
			tick();
		});
		
		SW.watch(function (err, value) {
			if (err) {
			  throw err;
			}
			if(value == 0){
				self.sendSocketNotification('PRESSED',{inputtype: 'PRESSED'});
			}
		  });

		function tick() {
			const { a, b } = this;

			if (a != lastStateCLK && a == 1){//only do action, if rotary was moved and only count one step
				if (b != a){
					self.sendSocketNotification('CW',{inputtype: 'CW'});
					lastdir = 'CW';
				} else {
					self.sendSocketNotification('CCW',{inputtype: 'CCW'});
					lastdir = 'CCW';
				}
			} 

			//catch missing count when changing from CCW to CW
			if (a == lastStateCLK && b == 0 && lastdir == 'CCW') {
				self.sendSocketNotification('CW',{inputtype: 'CW'});	
				lastdir = 'CW';
			}

			lastStateCLK = a;
			return this;
		}

	},

	// Override socketNotificationReceived method.
	socketNotificationReceived: function(notification, payload) {
		if (notification === 'BUTTON_CONFIG') {     
			this.config = payload.config;

			if (this.loaded === false) {//AxLED 2020-04
				this.intializeRotary();
			}
			
		}

		if (notification === 'SHELLCOMMAND') {
			console.log("MMM-Navigate, received Shellcommand:", payload);
			exec(payload, null);
		}
	},

	createRoutes: function() {
		var self = this;

		this.expressApp.get("/MMM-Navigate/remote", function(req, res) {
				var query = url.parse(req.url, true).query;
				if(query.notification=='CW' || query.notification=='CCW' || query.notification=='PRESSED'){
					self.sendSocketNotification(query.notification,{inputtype: ""+query.notification+""});
				}
				res.send("MMM-Navigate, data received: "+ JSON.stringify(query));
		});
	},
});