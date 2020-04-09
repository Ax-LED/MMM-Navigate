//MMM-Navigate.js:

var locked = false;
var vconfirm = 0;

Module.register("MMM-Navigate",{
	// Default module config.
	defaults: {
		Alias: [ 'Seite vorwärts','Seite zurück'],
        Action: [{type: "notification", title: 'Good morning!'},{type: "notification", title: 'Good morning!'}],
        GPIOPins: [26,20,19]//rotary cw, rotary ccw, rotary press (BCM Numbering)
	},

    getStyles: function() {
        return [
                this.file('MMM-Navigate.css'), //load css
            ];
    },

    sendAction: function(description) {
        this.show(0,{force: true});

        if((description.notification == "SHELLCOMMAND") && (vconfirm==0)){
            vconfirm = 1;
            this.sendNotification("SHOW_ALERT",{type:"notification",message:"Ausführen von SHELLCOMMAND "+ description.payload +" bitte durch 2.Klick bestätigen"});
        }else if((description.notification == "SHELLCOMMAND") && (vconfirm==1)){
            vconfirm = 0;
            this.sendSocketNotification(description.notification, description.payload);
        }else{
            vconfirm = 0;
            this.sendNotification(description.notification, description.payload);
        }

        this.hide(10000);
    },

    // Define start sequence.
    start: function() {
        Log.info("Starting module: " + this.name);
        this.sendConfig();//pass config to node_helper.js
    },

	// Override dom generator.
	getDom: function() {
		//Div for loading
		if (this.loading) {
			var loading = document.createElement("div");
			  loading.innerHTML = this.translate("LOADING");
			  loading.className = "dimmed light small";
			  wrapper.appendChild(loading);
			return wrapper;
		}

        var self = this;//makes variables usable in functions
    
		//Div after loading
		var parent = document.createElement("div");
        parent.className = "xsmall bright";

		//build navigation from array
        for (let index = 0; index < this.config.Action.length; index++) {
			var naviItem = document.createElement("li");
			var link = document.createElement('a');
			link.setAttribute('href', '');
            link.innerHTML = this.config.Alias[index];
			naviItem.setAttribute('id', index);
            if(index==0){//first li gets class="selected"
                naviItem.setAttribute('class', 'selected');
			}
            naviItem.appendChild(link);
            parent.appendChild(naviItem);
		}
		return parent;
    },

    sendConfig: function() {
        this.sendSocketNotification("BUTTON_CONFIG", {
            config: this.config
        });
    },

    naviaction: function(payload){
        var self = this;
        
        if(payload.inputtype === 'CW' || payload.inputtype === 'CCW' || payload.inputtype === 'PRESSED'){
            navigationmove(payload.inputtype);
        }
        
        function fselectedid(){//get ID and return it
            for (let index = 0; index < self.config.Action.length; index++) {
                var test = document.getElementsByTagName('li')[index].getAttribute('class');

                if(test=='selected' || test=='selected locked' || test=='selected locked fa-lock1'){//axled lock icon
                    var selectedid = document.getElementsByTagName('li')[index].getAttribute('id');
                    return selectedid;
                }
            }
        }

        function navigationmove(input){
            self.show(0);
            selectedid = fselectedid();
            if(input==='CW' || input==='CCW'){
                vconfirm = 0;

                if(input==='CW'){
                    navistep = 1;
                    actionstep = 0;
                }else if(input==='CCW'){
                    navistep = -1;
                    actionstep = 1;
                }

                if(locked==true){
                    self.sendAction(self.config.Action[selectedid][parseInt(actionstep)]);
                }else if(locked==false){
                                        
                    document.getElementsByTagName('li')[selectedid].setAttribute('class', '');//CW&CCW

                    if(selectedid==0 && input==='CW'){//mark next row
                        document.getElementsByTagName('li')[parseInt(selectedid)+1].setAttribute('class', 'selected');//CW
                    }else if(selectedid==0 && input==='CCW'){//mark last row
                        document.getElementsByTagName('li')[self.config.Action.length-1].setAttribute('class', 'selected');//CCW
                    }else if(selectedid==self.config.Action.length-1 && input==='CW'){//mark first row
                        document.getElementsByTagName('li')[0].setAttribute('class', 'selected');//CW
                    }else if(selectedid==self.config.Action.length-1 && input==='CCW'){//mark prev row
                        document.getElementsByTagName('li')[parseInt(selectedid)-1].setAttribute('class', 'selected');//CCW
                    }else{//mark next one in selected direction
                        document.getElementsByTagName('li')[parseInt(selectedid)+navistep].setAttribute('class', 'selected');
                    }
                }
            }else if(input === 'PRESSED'){
                if(locked==false){//Menu not locked so ... (see below)
                    if(Array.isArray(self.config.Action[selectedid])){//if selected entry Action is array - lock it
                        locked = true;
                        document.getElementsByTagName('li')[selectedid].setAttribute('class', 'selected locked fa-lock1');//axled lock icon
                    }else{//if selected entry Action is object - so there is nothing to lock - execute it
                        self.show(0,{force: true});           
                        self.sendAction(self.config.Action[selectedid]);
                    }
                }else{//Menu locked so unlock it
                    locked = false;
                    document.getElementsByTagName('li')[selectedid].setAttribute('class', 'selected');
                }
            }
        }
        return parent;
    },

    //Helper, to use module without Rotary Encoder and without GPIO Pins, like developing in Pixel VM
    notificationReceived: function(notification, payload) {
        if(notification === "CW" || notification === "CCW" || notification === "PRESSED"){
            this.naviaction({inputtype: ""+ notification +""});
        }

        if(notification === "SHELLCOMMAND"){
             this.sendSocketNotification(notification, payload);
        }
    },

    // socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
	    if(notification === 'CW' || notification === 'CCW' || notification === 'PRESSED'){
            this.naviaction(payload);
        }
    },
});