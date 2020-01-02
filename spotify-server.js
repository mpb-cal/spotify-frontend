/*

Install node js.
Start a new project:
  mkdir myApp
  cd myApp
  npm init
  npm install
Install axios:
  npm install axios
Go to developer.spotify.com.
Sign in with your spotify account.
Click on "Create A Client ID" and fill out the form. This is how you register your app.
When finished, you will see your app's client ID and client secret.
Save this file as index.js.
Copy your client ID and secret into this file.
Run this file as node index.js.


Click on your app, click on "Edit Settings", and add the Redirect URL (http://localhost:8888/callback/ for the test app)
Download the code in https://github.com/spotify/web-api-auth-examples/tree/master/authorization_code
and run node app.js and browse to :8888

The sample app works like this:
  get authorization code from spotify:
    send client id to -->
    https://accounts.spotify.com/authorize?  (open in browser, user logs in)
      --> spotify sends code to redirect URL 
  get access token and refresh token from spotify:
    send code and client secret to --> https://accounts.spotify.com/api/token --> receive access token and refresh token
  get user data:
    send acess token to --> https://api.spotify.com/v1/me --> receive user data
 
1. Link to https://accounts.spotify.com/authorize (open in browser, user logs in)
2. User gets redirected back to localhost?code=CODE
3. server should use this CODE plus client secret to get access TOKEN from
    https://accounts.spotify.com/api/token
4. then redirect browser to a url with TOKEN


Manually (Client Credentials Flow):
  1. Get an access token from Spotify:
    - Use https://www.base64encode.org/ (command line base64 did not work) to encode client_id:client_secret
      Use Node's Buffer class in Node
    - Send client id and client secret to https://accounts.spotify.com/api/token:
      curl -X "POST" -H "Authorization: Basic <encoded client_id:client_secret> -d grant_type=client_credentials https://accounts.spotify.com/api/token

      curl -X "POST" -H "Authorization: Basic ZjRhYWNlZDkxNTliNDYzMWI5MTg5NjM1Mjg0ZDAzNDQ6M2I2NzNmYzM4MWFkNDY4YWEyNWFhNzZhN2I3YTE2ZjE=" -d grant_type=client_credentials https://accounts.spotify.com/api/token

    - has to be done from server due to CORS blocking
    - Here is the response:
      {
        "access_token":"BQCOhaGu44b3bfbkX77iX0_yC53NjEI4qHKWptJ4IaBBZu-Xb5QEd9_soHhurjxw24LeMeNOjBRowTG-j9g",
        "token_type":"Bearer",
        "expires_in":3600,
        "scope":""
      }

  2. Use the token to make an API call (can be done from the browser):
    curl -H "Authorization: Bearer BQCOhaGu44b3bfbkX77iX0_yC53NjEI4qHKWptJ4IaBBZu-Xb5QEd9_soHhurjxw24LeMeNOjBRowTG-j9g" https://api.spotify.com/v1/tracks/2TpxZ7JUBn3uw46aR7qd6V

* */

const querystring = require('querystring');
const axios = require('axios');

const API_URL = "https://api.spotify.com/v1";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const CLIENT_ID = 'f4aaced9159b4631b9189635284d0344';
const CLIENT_SECRET = '3b673fc381ad468aa25aa76a7b7a16f1';
const ENCODED = Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString('base64');

// store with sessions?
let access_tokens = {};

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

exports.getAccessToken = (callback, code = '') => {
  let refresh_token = '';

  if (access_tokens[code] !== undefined) {
    console.log('using cached access token');
    access_tokens[code].age = (new Date().valueOf() - access_tokens[code].start_time) / 1000;
    console.log(access_tokens[code]);
    if (access_tokens[code].age >= access_tokens[code].expires_in) {
      console.log('access token expired');
      refresh_token = access_tokens[code].refresh_token;
    } else {
      callback(access_tokens[code]);
      return;
    }
  }

  console.log('getting new access token');
  let postData = {
    grant_type: code ? "authorization_code" : "client_credentials",
  };

  if (code) {
    postData.code = code;
    postData.redirect_uri = "http://localhost:3000/api/token";  // required by spotify but ignored by us
  }

  if (refresh_token) {
    postData.code = refresh_token;
  }

  axios({
    method: "POST",
    url: TOKEN_URL,
    data: querystring.stringify(postData),
    headers: {
      Authorization: "Basic " + ENCODED,
    },
  }).then((response) => {
    access_tokens[code] = {
      ...response.data,
      start_time: new Date().valueOf(),
      age: 0,
    };
    console.log(access_tokens[code]);
    callback(access_tokens[code]);
  })
  .catch((error) => {
    console.log('axios error:');
    console.log(error);
  });
}

//getAccessToken();


