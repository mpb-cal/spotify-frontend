var querystring = require('querystring');

var CLIENT_ID = 'f4aaced9159b4631b9189635284d0344';
var API_URL = "https://api.spotify.com/v1";
var TOKEN_ADDRESS = "api/token";
exports.ACDC_ID = "711MCceyCBcFnzjGY4Q7Un";
exports.NICKLOWE_ID = "3BqaUtuQmqIHg7B5Bc7fP7";
var SCOPES = 'user-modify-playback-state ' + 'user-read-playback-state ' + 'user-read-currently-playing ' + 'user-top-read ' + 'user-read-recently-played ' + 'user-library-modify ' + 'user-library-read ' + 'user-follow-modify ' + 'user-follow-read ' + 'playlist-read-private ' + 'playlist-modify-public ' + 'playlist-modify-private ' + 'playlist-read-collaborative ' + 'user-read-private ' + 'user-read-email ' + 'app-remote-control ' + 'streaming ' + '';
exports.LOGIN_URL = "https://accounts.spotify.com/authorize?" + querystring.stringify({
  response_type: 'code',
  client_id: CLIENT_ID,
  scope: SCOPES,
  redirect_uri: "http://localhost:3000/" + TOKEN_ADDRESS,
  state: "HGYGyy7tujjgHGFF"
});

var access_token = "";

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

exports.getAccessToken = function (callback) {
  // look for user-level access token in URL
  var urlParams = new URLSearchParams(window.location.search);
  var token = urlParams.get('token');
  if (token) {
    access_token = token;
    callback();
    return;
  }

  // otherwise, get generic access token from server
  axios({
    method: "GET",
    url: TOKEN_ADDRESS,
    responseType: 'json'
  }).then(function (response) {
    console.log(response);
    access_token = response.data.access_token;
    callback();
  }).catch(function (error) {
    console.log('axios error:');
    console.log(error);
  });
};

var callSpotifyAPI = function callSpotifyAPI(url, callback) {
  axios({
    method: "get",
    url: url,
    headers: {
      Authorization: "Bearer " + access_token
    }
  }).then(function (response) {
    callback(response.data);

    if (response.data.next !== null) {
      callSpotifyAPI(response.data.next, callback);
    }
  }).catch(function (error) {
    console.log(error);
  });
};

exports.init = function (callback) {
  exports.getAccessToken(callback);
};

exports.getUser = function (callback) {
  callSpotifyAPI(API_URL + "/me", callback);
};

exports.getUserProfile = function (id, callback) {
  callSpotifyAPI(API_URL + "/users/" + id, callback);
};

exports.getUserAlbums = function (callback) {
  callSpotifyAPI(API_URL + "/me/albums?limit=50&offset=0", callback);
};

exports.getUserPlaylists = function (callback) {
  callSpotifyAPI(API_URL + "/me/playlists?limit=50&offset=0", callback);
};

exports.getArtist = function (id, callback) {
  callSpotifyAPI(API_URL + "/artists/" + id, callback);
};

exports.getArtistAlbums = function (id, callback) {
  callSpotifyAPI(API_URL + "/artists/" + id + "/albums?include_groups=album&limit=50", callback);
};

exports.getAlbum = function (id, callback) {
  callSpotifyAPI(API_URL + "/albums/" + id, callback);
};