# Zardo's Captcha Solver

This is an automated non-browser based recaptcha/cloudfare solver for the famous discord bot poketwo. It uses scrappey to solve captchas and logs them in a mongoDB. <br>
Since this is a now free solver. No support will be provided. Any contacts made for assistance will be ignored. Check my other repository if you wish to get a better solver.

## Features
- Fully Automated
- Under 2mins solving speed on system provided proxies
- Under 80s solving speed on webshare proxies
- Under 20s solving speed on iproyal proxies
- Embedded with a log checker for your clients


## Installation

Please follow the following steps to run this solver yourself!

1. **Install Node.js:** Download Node.js from [Here](https://nodejs.org/en/download/current).
2. **Download the following listed libraries using ```npm install <library_name>```:**
   - mongodb
   - express
   - axios
3. **Configure the port on line `6` in `server.js`**.
4. **Configure the mongoDB uri on line `11` in `server.js`**.
5. **Configure the host on line `162` in `index.html`**.
6. **Run the server using `node server.js`**.

> Skip step 4 if youre using nomongo version
## Available Endpoints
- **/solve** - To solve the captcha.
- **/credits** - To check available Balance of a user.
- **/logs** - To get json of logs of a user.
- **/logger** - To get a web-based GUI for checking logs.

## How to get scrappey keys?
You need to sign up at `app.scrappey.com` and then verify your email for 175 free solves.

### Note
You can make multiple keys and provide to the clients as needeed.


# TO-DO
1. Make the license-management more robust.
2. Improve the logger.
3. Experiment to reduce solving time.
4. ~~Make a Discord-bot to automatically generate scrappey api-keys~~.
5. Add a way to reset keys.
