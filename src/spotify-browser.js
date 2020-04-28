const querystring = require('querystring');

(function () {
  axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  const CLIENT_ID = 'f4aaced9159b4631b9189635284d0344';
  const EXPIRED_MSG = 'The access token expired';
  const API_URL = "https://api.spotify.com/v1";
  const TOKEN_HREF = "/api/token";
  // redirect URI must be added to app settings in Spotify dashboard,
  // which is why this is hard coded:
  const REDIRECT_URL = 'http://18.144.5.121:3000/api/token';
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
      redirect_uri: REDIRECT_URL,  // must be added to app settings in Spotify dashboard
      state: "HGYGyy7tujjgHGFF",
    });

  let m_access_token = "";
  let m_refresh_token = "";
  let m_player = "";
  let m_device_id = "";

  exports.init = (callback) => {
    // look for user-level access token in URL.
    // if it's there, we are logged in and we can use it to call the Spotify API.
    const urlParams = new URLSearchParams(window.location.search);
    const access_token_param = urlParams.get('access_token');
    if (access_token_param) {
      m_access_token = access_token_param;
      const refresh_token_param = urlParams.get('refresh_token');
      m_refresh_token = refresh_token_param;

      setupPlayer(callback);
    } else {
      // otherwise, get a generic access token from server
      axios({
        method: "GET",
        url: TOKEN_HREF,
        responseType: 'json',
      }).then((response) => {
        console.log(response);
        m_access_token = response.data.access_token;
        callback();
      })
      .catch((error) => {
        console.log('axios error:');
        console.log(error);
      });
    }
  }

  function setupPlayer(callback) {
    m_player = new Spotify.Player({
      name: 'MPB Spotify Front-End Player',
      getOAuthToken: cb => {
        cb(m_access_token);
      }
    });

    // Error handling
    m_player.addListener('initialization_error', ({ message }) => { console.error(message); });
    m_player.addListener('authentication_error', ({ message }) => { console.error(message); });
    m_player.addListener('account_error', ({ message }) => { console.error(message); });
    m_player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
    m_player.addListener('player_state_changed', state => { console.log(state); });

    // Ready
    m_player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      m_device_id = device_id;
      putSpotifyAPI(API_URL + "/me/player", null, null, {device_ids: [m_device_id]});

      callback();
    });

    // Not Ready
    m_player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player
    m_player.connect().then((result) => {
      console.log('connect was successful');
    });
  }

  const callSpotifyAPI = (method, url, callback = null, returnData = null, postData = null) => {
    console.log("callSpotifyAPI: " + url);
  /*
    const storedData = JSON.parse(localStorage.getItem(url));
    if (storedData) {
      console.log("using cached data");
      console.log(localStorage.getItem(url));
      if (callback) {
        callback(storedData, returnData);
      }
    }
  */

    axios({
      method: method,
      url: url,
      headers: {
        Authorization: "Bearer " + m_access_token,
      },
      data: postData,
    }).then((response) => {
  /*
      localStorage.setItem(url, JSON.stringify(response.data));
      console.log(localStorage.getItem(url));
  */
      //if (returnData) {
        if (callback) {
          callback(response.data, returnData);
        }
      //} else {
        //if (callback) {
          //callback(response.data);
        //}
      //}

      if (response.data.next !== null) {
        callSpotifyAPI(method, response.data.next, callback, returnData, postData);
      }
    })
    .catch((error) => {
      console.log("callSpotifyAPI error: " +  error);
      if (error.response) {
        const msg = error.response.data.error.message;
        console.log(msg);
        //if (msg === EXPIRED_MSG) {
          alert(msg);
        //}
      }
    });
  }

  const getSpotifyAPI = (url, callback = null, returnData = null) => {
    callSpotifyAPI('get', url, callback, returnData);
  }

  const postSpotifyAPI = (url, callback = null, returnData = null, postData = null) => {
    callSpotifyAPI('post', url, callback, returnData, postData);
  }

  const putSpotifyAPI = (url, callback = null, returnData = null, postData = null) => {
    callSpotifyAPI('put', url, callback, returnData, postData);
  }

  const deleteSpotifyAPI = (url, callback = null, returnData = null) => {
    callSpotifyAPI('delete', url, callback, returnData);
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

  exports.getDevices = (callback) => {
    getSpotifyAPI(API_URL + "/me/player/devices/", callback);
  }

  exports.play = () => {
    putSpotifyAPI(API_URL + "/me/player/play");
  }

  exports.pause = () => {
    putSpotifyAPI(API_URL + "/me/player/pause");
  }

  exports.getPlayer = (callback) => {
    getSpotifyAPI(API_URL + "/me/player", callback);
  }

  exports.getRecentlyPlayed = (callback) => {
    getSpotifyAPI(API_URL + "/me/player/recently-played", callback);
  }

  exports.getCurrentlyPlaying = (callback) => {
    getSpotifyAPI(API_URL + "/me/player/currently-playing", callback);
  }

/*
PUT 	/v1/me/player/seek 	Seek To Position In Currently Playing Track 	-
PUT 	/v1/me/player/repeat 	Set Repeat Mode On User’s Playback 	-
PUT 	/v1/me/player/volume 	Set Volume For User's Playback 	-
POST 	/v1/me/player/next 	Skip User’s Playback To Next Track 	-
POST 	/v1/me/player/previous 	Skip User’s Playback To Previous Track 	-
PUT 	/v1/me/player/shuffle 	Toggle Shuffle For User’s Playback 	-
POST 	/v1/me/player/queue 	Add an Item to the User's Playback Queue 	-
*/
})();

