const querystring = require('querystring');
const testData = require('./mocks/testData.js');
const fetch = window.fetch;

(function () {
  //axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  const CLIENT_ID = 'f4aaced9159b4631b9189635284d0344';
  const EXPIRED_MSG = 'The access token expired';
  const API_URL = "https://api.spotify.com/v1";
  const TOKEN_HREF = "/spotify-frontend/token";
  // fetch on serverside during jest testing needs absolute URLs
  const TOKEN_URL = `${process.env.NODE_ENV === 'test' ? 'http://localhost' : ''}${TOKEN_HREF}`;
  // redirect URI must be added to app settings in Spotify dashboard,
  // which is why this is hard coded:
  //const REDIRECT_URL = 'http://18.144.5.121/api/token';
  const REDIRECT_URL = 'http://18.144.5.121' + TOKEN_HREF;
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

      if (process.env.NODE_ENV === 'test') {
        callback(null);
        return;
      }

      setupPlayer(callback);
    } else {
      // otherwise, get a generic access token from server

/*
      if (process.env.NODE_ENV !== 'test') {
        callback(null);
        return;
      }
*/

      fetch(TOKEN_URL, {
        method: "GET",
      })
        .then(response => response.json())
        .then(data => {
          m_access_token = data.access_token;
          callback(null);
        })
        .catch((error) => {
          console.log('fetch error:');
          console.log(error);
        })
      ;
    }
  }

  function setupPlayer(callback) {
    let player = new Spotify.Player({
      name: 'MPB Spotify Front-End Player',
      getOAuthToken: cb => {
        cb(m_access_token);
      }
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
/*
    player.addListener('player_state_changed', state => {
      console.log('player_state_changed:');
      console.log(state);
    });
*/

    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      m_device_id = device_id;
      putSpotifyAPI(API_URL + "/me/player", null, null, {device_ids: [m_device_id]});

      callback(player);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player
    player.connect().then((result) => {
      console.log('connect was successful');
    });
  }

  const callSpotifyAPI = (method, url, callback = null, returnData = null, postData = null) => {
    console.log("callSpotifyAPI " + url);

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

/*
    if (process.env.NODE_ENV !== 'test') {
      return;
    }
*/

    fetch(url, {
      method: method,
      headers: {
        Authorization: "Bearer " + m_access_token,
        //'Content-Type': 'application/x-www-form-urlencoded',  // on POST
      },
      data: postData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.log("callSpotifyAPI " + url + " " + "error: " +  data.error.message);
          return;
        }

        // exceeding quota
        //localStorage.setItem(url, JSON.stringify(data));

        if (callback) {
          callback(data, returnData);
        }

        if (data.next) {
          callSpotifyAPI(method, data.next, callback, returnData, postData);
        }
      })
      .catch((error) => {
        console.log("callSpotifyAPI " + url + " " + "error: " +  error);
        if (error.response) {
          const msg = error.response.data.error.message;
          console.log("callSpotifyAPI " + url + " " + msg);
          //if (msg === EXPIRED_MSG) {
            alert(msg);
          //}
        }
      })
    ;
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
    if (process.env.NODE_ENV !== 'test') {
      callback(testData.albums);
      return;
    }

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

  exports.play = (uris = []) => {
    putSpotifyAPI(API_URL + "/me/player/play", null, null, uris.length ? {uris} : null);
  }

  exports.pause = () => {
    putSpotifyAPI(API_URL + "/me/player/pause");
  }

  exports.seek = (position_ms) => {
    putSpotifyAPI(API_URL + "/me/player/seek?position_ms=" + position_ms);
  }

  exports.repeat = (state) => {
    putSpotifyAPI(API_URL + "/me/player/repeat?state=" + state);
  }

  exports.volume = (volume_percent) => {
    putSpotifyAPI(API_URL + "/me/player/volume?volume_percent=" + volume_percent);
  }

  exports.shuffle = (state) => {
    putSpotifyAPI(API_URL + "/me/player/shuffle?state=" + state);
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
  position_ms
PUT 	/v1/me/player/repeat 	Set Repeat Mode On User’s Playback 	-
  state = track, context or off
PUT 	/v1/me/player/volume 	Set Volume For User's Playback 	-
  volume_percent
POST 	/v1/me/player/next 	Skip User’s Playback To Next Track 	-
POST 	/v1/me/player/previous 	Skip User’s Playback To Previous Track 	-
PUT 	/v1/me/player/shuffle 	Toggle Shuffle For User’s Playback 	-
  state = true or false
POST 	/v1/me/player/queue 	Add an Item to the User's Playback Queue 	-
*/
})();

