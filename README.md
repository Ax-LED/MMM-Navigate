# MMM-Navigate
A module to connect a rotary encoder to MagicMirror and use it for Navigation inside of MagicMirror
I wanted to use interaction to the MagicMirror and decided to use a rotary encoder, which has 3 functions: Clockwise, Counterclockwise and Press.
These fucntions where combined to a navigation, so you have some possibilities, f.e.: Page increment/decrement, Newsfeed Article more/less details and actions for notification system.
The navigation fades out, if not used.

![Magic-Mirror Module MMM-Navigate screenshot1](https://raw.githubusercontent.com/Ax-LED/MMM-Navigate/master/MMM-Navigate_screenshot1.jpg)

![Magic-Mirror Module MMM-Navigate screenshot2](https://raw.githubusercontent.com/Ax-LED/MMM-Navigate/master/MMM-Navigate_screenshot2.jpg)

## Connect rotary encoder to raspberry pi
![Magic-Mirror Module MMM-Navigate rotary encoder](https://raw.githubusercontent.com/Ax-LED/MMM-Navigate/master/MMM-Navigate_fritzing_rotaryencoder.jpg)

## Installing the module
Clone this repository in your `~/MagicMirror/modules/` folder `( $ cd ~MagicMirror/modules/ )`:
````javascript
git clone https://github.com/Ax-LED/MMM-Navigate
cd MMM-Navigate
npm install # this can take a while
````

## Post installation steps
1. Find out, which version of electron is installed
- `cd ~MagicMirror`
- `npm list | grep electron`

you will see output like this
````javascript
├─┬ electron@1.4.15
│ ├─┬ electron-download@3.3.0
│ ├─┬ electron-chromedriver@1.7.1
│ │ └─┬ electron-download@4.1.0
│ │ │ └─┬ electron-to-chromium@1.3.30
│ │ │   └── electron-releases@2.1.0
````

2. Whats next?
- change in your MMM-Navigate folder (`cd ~/MagicMirror/modules/MMM-Navigate`)
- and then type in following command, you must change the version number 1.4.15 in my example) with your own:
- `npm rebuild --runtime=electron --target=1.4.15 --disturl=https://atom.io/download/atom-shell --abi=50`

Now it should work.

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
{
			module: "MMM-Navigate",
			header: "Navigation",
			position: "top_left",
			config: {
					Alias: [ 'Seite vorwärts','Seite zurück', 'News - mehr Details' , 'News - weniger Details','Herunterfahren'],
					Action: [{notification:'PAGE_INCREMENT',payload:''},{notification:'PAGE_DECREMENT',payload:''},{notification:'ARTICLE_MORE_DETAILS',payload:''},{notification:'ARTICLE_LESS_DETAILS',payload:''},{notification: "REMOTE_ACTION", payload: {action: "SHUTDOWN"}}],
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
			<td>An Array of Action of the Alias, for Example <code>{notification:'PAGE_INCREMENT',payload:''}</code> to send page increment to MMM-Pages Module.</td>
		</tr>
		<tr>
			<td><code>GPIOPins</code></td>
			<td>Array for Definition of GPIO-Pins (BMC) to connect the rotary encoder for the following actions: Clockwise, Counterclockwise and Press</td>
		</tr>
   </table>
