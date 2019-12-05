const querystring = require('querystring');

const CLIENT_ID = 'f4aaced9159b4631b9189635284d0344';
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

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

exports.getAccessToken = (callback) => {
  // look for user-level access token in URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  if (token) {
    access_token = token;
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

const callSpotifyAPI = (url, callback) => {
  axios({
    method: "get",
    url: url,
    headers: {
      Authorization: "Bearer " + access_token,
    },
  }).then((response) => {
    callback(response.data);

    if (response.data.next !== null) {
      callSpotifyAPI(response.data.next, callback);
    }
  })
  .catch((error) => {
    console.log(error);
  });
}

exports.init = (callback) => {
  exports.getAccessToken(callback);
}

exports.getUser = (callback) => {
  callSpotifyAPI(API_URL + "/me", callback);
}

exports.getUserProfile = (id, callback) => {
  callSpotifyAPI(API_URL + "/users/" + id, callback);
}

exports.getUserAlbums = (callback) => {
  callSpotifyAPI(API_URL + "/me/albums?limit=50&offset=0", callback);
}

exports.getUserPlaylists = (callback) => {
  callSpotifyAPI(API_URL + "/me/playlists?limit=50&offset=0", callback);
}

exports.getArtist = (id, callback) => {
  callSpotifyAPI(API_URL + "/artists/" + id, callback);
}

exports.getArtistAlbums = (id, callback) => {
  callSpotifyAPI(API_URL + "/artists/" + id + "/albums?include_groups=album&limit=50", callback);
}

exports.getAlbum = (id, callback) => {
  callSpotifyAPI(API_URL + "/albums/" + id, callback);
}

