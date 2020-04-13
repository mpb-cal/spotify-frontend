const querystring = require('querystring');

const CLIENT_ID = 'f4aaced9159b4631b9189635284d0344';
const EXPIRED_MSG = 'The access token expired';
const API_URL = "https://api.spotify.com/v1";
const TOKEN_ADDRESS = "api/token";
exports.ACDC_ID = "711MCceyCBcFnzjGY4Q7Un";
exports.NICKLOWE_ID = "3BqaUtuQmqIHg7B5Bc7fP7";
const SCOPES = 
  'user-modify-playback-state ' +
  'user-read-playback-state ' +
  'user-read-currently-playing ' +
  'user-top-read ' +
  'user-read-recently-played ' +
  'user-library-modify ' +
  'user-library-read ' +
  'user-follow-modify ' +
  'user-follow-read ' +
  'playlist-read-private ' +
  'playlist-modify-public ' +
  'playlist-modify-private ' +
  'playlist-read-collaborative ' +
  'user-read-private ' +
  'user-read-email ' +
  'app-remote-control ' +
  'streaming ' +
  ''
;
exports.LOGIN_URL = "https://accounts.spotify.com/authorize?" +
  querystring.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: "http://localhost:3000/" + TOKEN_ADDRESS,
    state: "HGYGyy7tujjgHGFF",
  });

let access_token = "";
let refresh_token = "";

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

exports.getAccessToken = (callback) => {
  // look for user-level access token in URL
  const urlParams = new URLSearchParams(window.location.search);
  const access_token_param = urlParams.get('access_token');
  if (access_token_param) {
    access_token = access_token_param;
    const refresh_token_param = urlParams.get('refresh_token');
    refresh_token = refresh_token_param;
    callback();
    return;
  }

  // otherwise, get generic access token from server
  axios({
    method: "GET",
    url: TOKEN_ADDRESS,
    responseType: 'json',
  }).then((response) => {
    console.log(response);
    access_token = response.data.access_token;
    callback();
  })
  .catch((error) => {
    console.log('axios error:');
    console.log(error);
  });
}

const callSpotifyAPI = (method, url, callback, returnData = null) => {
  console.log("callSpotifyAPI: " + url);
/*
  const storedData = JSON.parse(localStorage.getItem(url));
  if (storedData) {
    console.log("using cached data");
    console.log(localStorage.getItem(url));
    callback(storedData, returnData);
  }
*/

  axios({
    method: method,
    url: url,
    headers: {
      Authorization: "Bearer " + access_token,
    },
  }).then((response) => {
/*
    localStorage.setItem(url, JSON.stringify(response.data));
    console.log(localStorage.getItem(url));
*/
    //if (returnData) {
      callback(response.data, returnData);
    //} else {
      //callback(response.data);
    //}

    if (response.data.next !== null) {
      callSpotifyAPI(method, response.data.next, callback, returnData);
    }
  })
  .catch((error) => {
    console.log("callSpotifyAPI error: " +  error);
    if (error.response) {
      console.log(error.response.data.error.message);
      if (error.response.data.error.message === EXPIRED_MSG) {
      }
    }
  });
}

const getSpotifyAPI = (url, callback, returnData = null) => {
  callSpotifyAPI('get', url, callback, returnData);
}

const postSpotifyAPI = (url, callback, returnData = null) => {
  callSpotifyAPI('post', url, callback, returnData);
}

const putSpotifyAPI = (url, callback, returnData = null) => {
  callSpotifyAPI('put', url, callback, returnData);
}

const deleteSpotifyAPI = (url, callback, returnData = null) => {
  callSpotifyAPI('delete', url, callback, returnData);
}

exports.init = (callback) => {
  exports.getAccessToken(callback);
}

exports.getUser = (callback) => {
  getSpotifyAPI(API_URL + "/me", callback);
}

exports.getUserProfile = (id, callback) => {
  getSpotifyAPI(API_URL + "/users/" + id, callback);
}

exports.getUserAlbums = (callback) => {
  getSpotifyAPI(API_URL + "/me/albums?limit=50&offset=0", callback);
}

exports.getUserPlaylists = (callback) => {
  getSpotifyAPI(API_URL + "/me/playlists?limit=50&offset=0", callback);
}

exports.getArtist = (id, callback) => {
  getSpotifyAPI(API_URL + "/artists/" + id, callback);
}

exports.getArtistAlbums = (id, callback) => {
  getSpotifyAPI(API_URL + "/artists/" + id + "/albums?include_groups=album&limit=50", callback);
}

exports.getAlbum = (id, callback) => {
  getSpotifyAPI(API_URL + "/albums/" + id, callback);
}

exports.getPlaylistTracks = (id, callback) => {
  getSpotifyAPI(API_URL + "/playlists/" + id + "/tracks", callback, id);
}

exports.saveAlbum = (id, callback) => {
  putSpotifyAPI(API_URL + "/me/albums?ids=" + id, callback);
}

exports.deletePlaylist = (id, callback) => {
  deleteSpotifyAPI(API_URL + "/playlists/" + id + '/followers', callback);
}

