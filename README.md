# MMM-Navigate
A module to connect a rotary encoder to MagicMirror and use it for Navigation inside of MagicMirror
I wanted to use interaction to the MagicMirror and decided to use a rotary encoder, which has 3 functions: Clockwise, Counterclockwise and Press.
These functions where combined to a navigation, so you have some possibilities, f.e.: Page increment/decrement, Newsfeed Article more/less details and actions for notification system.
The navigation fades out, if not used.

![Magic-Mirror Module MMM-Navigate screenshot1](https://raw.githubusercontent.com/Ax-LED/MMM-Navigate/master/MMM-Navigate_screenshot1.jpg)

![Magic-Mirror Module MMM-Navigate screenshot2](https://raw.githubusercontent.com/Ax-LED/MMM-Navigate/master/MMM-Navigate_screenshot2.jpg)

## Connect rotary encoder to raspberry pi
Using capacitors for CLK, DT and SW Pin can be usefull for debouncing.
![Magic-Mirror Module MMM-Navigate rotary encoder](https://raw.githubusercontent.com/Ax-LED/MMM-Navigate/master/MMM-Navigate_fritzing_rotaryencoder.jpg)

## Installing the module
Clone this repository in your `~/MagicMirror/modules/` folder `( $ cd ~MagicMirror/modules/ )`:
````javascript
git clone https://github.com/Ax-LED/MMM-Navigate
cd MMM-Navigate
npm install # this can take a while
````

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
{
	module: "MMM-Navigate",
	header: "Navigation",
	position: "top_left",
	config: {
			Alias: [
				'Seiten blättern',
				'News (mehr/weniger Details)',
				'Test notification',
				'News - mehr Details',
				'News - weniger Details',
				'Neustart MagicMirror (PM2)',
				'Neustart',
				'Herunterfahren'
			],
			Action: [
				[{notification:'PAGE_INCREMENT',payload:''},{notification:'PAGE_DECREMENT',payload:''}],//action array, first press locks menu, after this rotation CW/CCW executes, second press release lock mode
				[{notification:'ARTICLE_MORE_DETAILS',payload:''},{notification:'ARTICLE_LESS_DETAILS',payload:''}],
				{notification: "SHOW_ALERT", payload: {type:"notification",message:"Dies ist eine Testnachricht"}},//single action, execute on press
				{notification:'ARTICLE_MORE_DETAILS',payload:''},
				{notification:'ARTICLE_LESS_DETAILS',payload:''},
				{notification: "REMOTE_ACTION", payload: {action: "RESTART"}},
				{notification: "REMOTE_ACTION", payload: {action: "REBOOT"}},
				{notification: "REMOTE_ACTION", payload: {action: "SHUTDOWN"}}
			],
			GPIOPins: [26,20,19]//rotary cw, rotary ccw, rotary press (BCM Numbering)
			},
},
````
## Configuration options

The following properties can be configured:


<table width="100%">
	<thead>
		<tr>
			<th>Option</th>
			<th width="100%">Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><code>Alias</code></td>
			<td>An Array of the Alias for the navigation entries.</td>
		</tr>
		<tr>
			<td><code>Action</code></td>
			<td>An Array of Action of the Alias. There are two modes:<br>1. Execution of a single action, for Example <code>{notification:'PAGE_INCREMENT',payload:''}</code> to send page increment to MMM-Pages Module.<br>
			2. Execution of an array of action, as there are some actions, which belong together (like PAGE_INCREMENT and PAGE_DECREMENT), Example Config: <code>[{notification:'PAGE_INCREMENT',payload:''},{notification:'PAGE_DECREMENT',payload:''}]</code><br>
			Behavior: First press locks menu (can be identified by the red css frame), after this rotation CW/CCW executes actions from config, second press release lock mode so you can select another navigation entry.</td>
		</tr>
		<tr>
			<td><code>GPIOPins</code></td>
			<td>Array for Definition of GPIO-Pins (BMC) to connect the rotary encoder for the following actions: Clockwise, Counterclockwise and Press</td>
		</tr>
   </table>
   Further information:<br>In version 1.1 of the module, i added a 'second click confirmation notification' for the following <code>REMOTE_ACTIONs</code>.<br>
   - SHUTDOWN<br>
   - RESTART<br>
   - REBOOT<br>
   This means, if you select one of these entries and press the rotary, you get a notification to do a second press to execute the selected entry.

   ## Further options
   You can communication with this module also by sending notifications.
   Examples:
   <code>yourmmip:8080/remote?action=NOTIFICATION&notification=CCW</code> emulates turning rotary counterclockwise
   <code>yourmmip:8080/remote?action=NOTIFICATION&notification=CW</code> emulates turning rotary clockwise
   <code>yourmmip:8080/remote?action=NOTIFICATION&notification=PRESSED</code> emulates pressing rotary encoder

   ## Version
   1.2 Changelog:
   - added lock icon next to navigation alias, if locked
   - code cleaned
   
   1.1
   Changelog:
   - added ability to send notifications to MMM-Navigate by other modules
   - added locked mode, so you can put two(2) actions in one(1) navigation link which belong together (like PAGE_INCREMENT and PAGE_DECREMENT). More details see Configuration options (Action).
   - modified css, so locked mode is visual (red frame when locked) in MM
   - added second click confirmation notification' for the following REMOTE_ACTIONs (SHUTDOWN, RESTART, REBOOT)
   
   1.0 initial release
