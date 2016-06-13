#SiliconLabs Thunderboard Web Client
---


##Introduction
The web client is built with various web tools including:

- [React](https://facebook.github.io/react/) for overall view architecture
	- [Alt.js](http://alt.js.org/) for the [flux](https://facebook.github.io/flux/) implementation with React
	- [React Router](https://github.com/rackt/react-router) for routing within the app
	- [React D3 Components](https://github.com/codesuki/react-d3-components) for using D3 charts with React
- [D3.js](http://d3js.org/) For data-driven charts
- [Firebase](https://www.firebase.com/) as the real-time back-end service
- [LESS](http://lesscss.org/) for CSS pre-processing
- [Gulp](http://gulpjs.com/) for building and minifying code
- [npm](https://www.npmjs.com/) as a package manager

---

##Firebase Setup
1. Setup a [Firebase](https://www.firebase.com/) account and database.
2. Set that Firebase url on `line 16` of `src/js/main.js`
	- `window.firebaseURL = 'https://___________.firebaseio.com/';`
3. Set the firebase project name on `line 2` of `firebase.json`. It should be something like `glowing-inferno-55555`
4. Install the [Firebase command line tools](https://www.firebase.com/docs/hosting/command-line-tool.html) which will allow you to deploy your changes to Firebase with `firebase deploy.`

##Getting Started
1. After downloading the source, you will need to get all of the required packages to run the local server. 
	- Run `npm install` (For more information on npm, see [npmjs.com](https://www.npmjs.com/))
2. After install completes, you can run `gulp watch` to start the live-reload server. If a browser did not open, you can go to `localhost:8080` to view the base page. 
3. To build the minified version of the code, use `gulp build`
4. When streaming data to Firebase from the device, you will be given a URL with the scheme of `/#/ (device id) / (session id) / (demo type)`
	- All valid URLs can be found in `src/js/main.js`
	
###Database Structure

    {
       "thunderboard": {
          "boardId (ThunderboardXXXXX)":{
             "sessions":{
                timestamp:(GUID)
                "1444075233":"2dadff7e-c716-44a2-a1d3-28a46b5112b2"
             }
          }
       },
       "sessions": {
          (GUID)
           "2dadff7e-c716-44a2-a1d3-28a46b5112b2":{
              "startTime" : timestamp,
              "endTime" : timestamp,
              "shortURL": (bitly link),
              "contactInfo" : {
                  "fullName":"John Smith",
                  "phoneNumber":1231231234,
                  "emailAddress":"john@smith.co.uk",
                  "title":"",
                  "deviceName":"Thunderboard #1234"
              },
              "temperatureUnits" : 0/1 for SI/US ,
              "measurementUnits" : 0/1 for SI/US,
              "motion":{
                  "data":{
                      "1444075233": {
                          "ax":____,
                          "ay":____,
                          "az":____,
                          "ox":____,
                          "oy":____,
                          "oz":____,
                          "speed":____,
                          "distance":____
                      }
                  }
              },
              "environment":{
                 "data" : { 
                     "1444075233": { 
                         "temperature" : 0 ,
                         "humidity" : 0 ,
                         "ambientLight" : 0,
                         "uvIndex" : 0
                     }
                 }
              },
              "io":{
                 "data":{
                     "1444075233": { 
                         "led0" : 0, 
                         "led1" : 1, 
                         "switch0" : 0, 
                         "switch1" : 0  
                     }
                 }
             }
          }
       }
    }


##Gulp Tasks
`gulp` - Build local code and start a server  
`gulp watch` - Build local code and start server with LiveReload  
`gulp build` - Build the code and uglify it for deployment to firebase