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

var callSpotifyAPI = function callSpotifyAPI(method, url, callback) {
  var returnData = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  axios({
    method: method,
    url: url,
    headers: {
      Authorization: "Bearer " + access_token
    }
  }).then(function (response) {
    if (returnData) {
      callback(response.data, returnData);
    } else {
      callback(response.data);
    }

    if (response.data.next !== null) {
      callSpotifyAPI(method, response.data.next, callback, returnData);
    }
  }).catch(function (error) {
    console.log(error);
  });
};

var getSpotifyAPI = function getSpotifyAPI(url, callback) {
  var returnData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  callSpotifyAPI('get', url, callback, returnData);
};

var postSpotifyAPI = function postSpotifyAPI(url, callback) {
  var returnData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  callSpotifyAPI('post', url, callback, returnData);
};

var putSpotifyAPI = function putSpotifyAPI(url, callback) {
  var returnData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  callSpotifyAPI('put', url, callback, returnData);
};

var deleteSpotifyAPI = function deleteSpotifyAPI(url, callback) {
  var returnData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  callSpotifyAPI('delete', url, callback, returnData);
};

exports.init = function (callback) {
  exports.getAccessToken(callback);
};

exports.getUser = function (callback) {
  getSpotifyAPI(API_URL + "/me", callback);
};

exports.getUserProfile = function (id, callback) {
  getSpotifyAPI(API_URL + "/users/" + id, callback);
};

exports.getUserAlbums = function (callback) {
  getSpotifyAPI(API_URL + "/me/albums?limit=50&offset=0", callback);
};

exports.getUserPlaylists = function (callback) {
  getSpotifyAPI(API_URL + "/me/playlists?limit=50&offset=0", callback);
};

exports.getArtist = function (id, callback) {
  getSpotifyAPI(API_URL + "/artists/" + id, callback);
};

exports.getArtistAlbums = function (id, callback) {
  getSpotifyAPI(API_URL + "/artists/" + id + "/albums?include_groups=album&limit=50", callback);
};

exports.getAlbum = function (id, callback) {
  getSpotifyAPI(API_URL + "/albums/" + id, callback);
};

exports.getPlaylistTracks = function (id, callback) {
  getSpotifyAPI(API_URL + "/playlists/" + id + "/tracks", callback, id);
};

exports.saveAlbum = function (id, callback) {
  putSpotifyAPI(API_URL + "/me/albums?ids=" + id, callback);
};

exports.deletePlaylist = function (id, callback) {
  deleteSpotifyAPI(API_URL + "/playlists/" + id + '/followers', callback);
};