//MMM-Navigate.js:

Module.register("MMM-Navigate",{
	// Default module config.
	defaults: {
		Alias: [ 'Seite vorwärts','Seite zurück'],
        Action: [{type: "notification", title: 'Good morning!'},{type: "notification", title: 'Good morning!'}],
        GPIOPins: [26,20,19]//rotary cw, rotary ccw, rotary press (BCM Numbering)
	},

    getStyles: function() {
        return [
                this.file('MMM-Navigate.css'), // css laden
            ]
        },

    sendAction: function(description) {
        this.show(0,{force: true});
        this.sendNotification(description.notification, description.payload);
        this.hide(10000);
    },

    // Define start sequence.
    start: function() {
        Log.info("Starting module: " + this.name);
        this.sendConfig();//pass config to node_helper.js
        //Helper to test connection to node_helper.js
        //this.sendSocketNotification('START', {message: 'Starte Verbindung node_helper für ' + this.name});
    },

	// Override dom generator.
	getDom: function() {
		//Div for loading
		if (this.loading) {
			var loading = document.createElement("div");
			  loading.innerHTML = this.translate("LOADING");
			  loading.className = "dimmed light small";
			  wrapper.appendChild(loading);
			return wrapper
		}

		var self = this;//makes variables usable in functions
		//Div after loading
		var parent = document.createElement("div");
        parent.className = "xsmall bright";
        parent.setAttribute('tabindex', 0);//set tabindex on div for focus purposes

		//build navigation from array
        for (let index = 0; index < this.config.Action.length; index++) {
			var naviItem = document.createElement("li");
			var link = document.createElement('a');
			link.setAttribute('href', '');
			link.setAttribute('target', 'iframe_a');
			link.innerHTML = this.config.Alias[index];
			naviItem.setAttribute('id', index)
            if(index==0){//first li gets class="selected"
                naviItem.setAttribute('class', 'selected');
			}
			naviItem.append(link);
			parent.append(naviItem);
		}
		return parent
    },

    sendConfig: function() {
        this.sendSocketNotification("BUTTON_CONFIG", {
            config: this.config
        });
    },

    naviaction: function(payload){
        var self = this;
        var selectedid = '';
        var test = '';

        if(payload.inputtype === 'CW'){
            self.show(0);
            selectedid = fselectedid();
            //console.log('FCW, selectedid: '+selectedid);

            if(selectedid==''){//first li gets class="selected"
                document.getElementsByTagName('li')[0].setAttribute('class', 'selected');
            }else if(selectedid==self.config.Action.length-1){//last entry reached, set mark on first entry
                document.getElementsByTagName('li')[selectedid].setAttribute('class', '');
                document.getElementsByTagName('li')[0].setAttribute('class', 'selected');
            }else{//delete mark of selected id and mark next one
                document.getElementsByTagName('li')[selectedid].setAttribute('class', '');
                document.getElementsByTagName('li')[parseInt(selectedid)+1].setAttribute('class', 'selected');
            }
        }else if(payload.inputtype === 'CCW'){
            self.show(0);
            selectedid = fselectedid();

            if(selectedid==''){
                document.getElementsByTagName('li')[self.config.Action.length-1].setAttribute('class', 'selected');
            }else if(selectedid==0){//first entry reached, set mark on last entry
                document.getElementsByTagName('li')[selectedid].setAttribute('class', '');
                document.getElementsByTagName('li')[self.config.Action.length-1].setAttribute('class', 'selected');
            }else{//delete mark of selected id and mark previous one
                document.getElementsByTagName('li')[selectedid].setAttribute('class', '');
                document.getElementsByTagName('li')[parseInt(selectedid)-1].setAttribute('class', 'selected');
            }
        }else if(payload.inputtype === 'pressed'){  
            //console.log('Lockstring: ',this.lockStrings,' xxx ',this.hidden);
            self.show(0,{force: true});          
            selectedid = fselectedid();        
            //console.log('Alex, Payload: ', self.config.Action[selectedid].notification,' xxx ',self.config.Action[selectedid].payload);
            self.sendAction(self.config.Action[selectedid]);
        }
            
        function fselectedid(){//get ID and return it
            for (let index = 0; index < self.config.Action.length; index++) {
                var test = document.getElementsByTagName('li')[index].getAttribute('class');

                if(test=='selected'){
                    var selectedid = document.getElementsByTagName('li')[index].getAttribute('id');
                }
            }
            return selectedid;
        }
        return parent
    },

    // socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "{{MODULE_NAME}}-NOTIFICATION_TEST") {
			// set dataNotification
			this.dataNotification = payload;
			this.updateDom();
        }else if(notification === 'MSG'){
            //Log.info('MSG Testnofication von node_helper für MMM-Navigate erhalten, Payload: '+payload.message);
        }else if(notification === 'CW'){
            //console.log('Rotary Info CW erhalten');
            this.naviaction(payload);
        }else if(notification === 'CCW'){
            //console.log('Rotary Info CCW erhalten');
            this.naviaction(payload);
        }else if(notification === 'pressed'){
            //console.log('Rotary Info pressed erhalten');
            this.naviaction(payload);
        }
    },
    
});