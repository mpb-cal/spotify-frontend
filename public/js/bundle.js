(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var spotify = require('./spotify-browser.js');

var msToDuration = function msToDuration(ms) {
  var sec = Math.floor(ms / 1000);
  var minutes = Math.floor(sec / 60);
  return String(minutes).padStart(2, '0') + ":" + String(sec % 60).padStart(2, '0');
};

var artistAlbumSort = function artistAlbumSort(a, b) {
  if (a.release_date < b.release_date) return -1;
  if (b.release_date < a.release_date) return 1;
  return 0;
};

var ObjectTable = function ObjectTable(_ref) {
  var object = _ref.object;
  return React.createElement(
    'table',
    { border: 1 },
    React.createElement(
      'tbody',
      null,
      Object.keys(object).map(function (e, i) {
        return React.createElement(
          'tr',
          { key: i.toString() },
          React.createElement(
            'td',
            null,
            e
          ),
          React.createElement(
            'td',
            null,
            object[e] ? object[e].toString() : ""
          )
        );
      })
    )
  );
};

var albumSort = function albumSort(a, b) {
  var a1 = a.album.artists[0].name;
  var b1 = b.album.artists[0].name;
  if (a1 < b1) return -1;
  if (b1 < a1) return 1;
  a1 = a.album.release_date;
  b1 = b.album.release_date;
  if (a1 < b1) return -1;
  if (b1 < a1) return 1;
  return 0;
};

var Spotifyer = function (_React$Component) {
  _inherits(Spotifyer, _React$Component);

  function Spotifyer(props) {
    _classCallCheck(this, Spotifyer);

    var _this = _possibleConstructorReturn(this, (Spotifyer.__proto__ || Object.getPrototypeOf(Spotifyer)).call(this, props));

    _this.clickAlbumsButton = _this.clickAlbumsButton.bind(_this);

    _this.state = {
      ready: false,
      albums: [],
      user: {},
      userAlbums: []
    };
    return _this;
  }

  _createClass(Spotifyer, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      spotify.init(function () {
        _this2.setState({
          ready: true
        });

        spotify.getUser(function (data) {
          console.log(data);
          _this2.setState({
            user: data
          });
        });

        spotify.getUserAlbums(function (data) {
          console.log(data);

          _this2.setState(function (state) {
            return {
              userAlbums: [].concat(_toConsumableArray(state.userAlbums), _toConsumableArray(data.items)).sort(albumSort)
            };
          });
        });
      });
    }
  }, {
    key: 'clickAlbumsButton',
    value: function clickAlbumsButton(artistId) {
      var _this3 = this;

      this.setState({
        albums: []
      });

      spotify.getArtistAlbums(artistId, function (data) {
        data.items.forEach(function (e, i, a) {
          spotify.getAlbum(e.id, function (data) {
            _this3.setState(function (state) {
              return {
                albums: [].concat(_toConsumableArray(_this3.state.albums), [data]).sort(artistAlbumSort)
              };
            });
          });
        });
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var userAlbums = this.state.userAlbums;


      return React.createElement(
        'div',
        { className: 'spotifyer' },
        React.createElement(
          'table',
          { border: 1 },
          React.createElement(
            'tbody',
            null,
            userAlbums.map(function (e, i) {
              return React.createElement(
                'tr',
                { key: i.toString() },
                React.createElement(
                  'td',
                  null,
                  React.createElement(
                    'a',
                    { href: e.album.external_urls.spotify, target: '_blank', rel: 'noopener noreferrer' },
                    e.album.name
                  )
                ),
                React.createElement(
                  'td',
                  null,
                  e.album.artists[0].name
                ),
                React.createElement(
                  'td',
                  null,
                  e.album.label
                ),
                React.createElement(
                  'td',
                  null,
                  e.album.popularity
                ),
                React.createElement(
                  'td',
                  null,
                  e.album.release_date
                ),
                React.createElement(
                  'td',
                  null,
                  e.album.total_tracks
                )
              );
            })
          )
        ),
        React.createElement(ObjectTable, { object: this.state.user }),
        React.createElement(
          'button',
          { disabled: !this.state.ready, onClick: function onClick() {
              _this4.clickAlbumsButton(spotify.ACDC_ID);
            } },
          'Get AC/DC Albums'
        ),
        React.createElement(
          'button',
          { disabled: !this.state.ready, onClick: function onClick() {
              _this4.clickAlbumsButton(spotify.NICKLOWE_ID);
            } },
          'Get Nick Lowe Albums'
        ),
        this.state.albums.map(function (e, i) {
          return React.createElement(
            'div',
            { key: i.toString() },
            React.createElement('img', { src: e.images[1].url, style: { float: "left" }, alt: '' }),
            React.createElement(
              'div',
              { style: { float: "left" } },
              React.createElement(
                'a',
                { href: e.external_urls.spotify, target: '_blank', rel: 'noopener noreferrer' },
                e.name
              ),
              React.createElement('br', null),
              'Release Date: ',
              e.release_date,
              React.createElement('br', null),
              React.createElement(
                'ol',
                null,
                e.tracks.items.map(function (e, i) {
                  return React.createElement(
                    'li',
                    { key: i.toString() },
                    React.createElement(
                      'a',
                      { href: e.external_urls.spotify, target: '_blank', rel: 'noopener noreferrer' },
                      e.name
                    ),
                    '...',
                    msToDuration(e.duration_ms)
                  );
                })
              )
            ),
            React.createElement('div', { style: { clear: "both" } })
          );
        })
      );
    }
  }]);

  return Spotifyer;
}(React.Component);

function App() {
  return React.createElement(
    'div',
    { className: 'App' },
    React.createElement('header', { className: 'App-header' }),
    React.createElement(
      'a',
      { href: spotify.LOGIN_URL },
      'Login to Spotify'
    ),
    React.createElement(Spotifyer, null)
  );
}

var e = React.createElement;

var LikeButton = function (_React$Component2) {
  _inherits(LikeButton, _React$Component2);

  function LikeButton(props) {
    _classCallCheck(this, LikeButton);

    var _this5 = _possibleConstructorReturn(this, (LikeButton.__proto__ || Object.getPrototypeOf(LikeButton)).call(this, props));

    _this5.state = { liked: false };
    return _this5;
  }

  _createClass(LikeButton, [{
    key: 'render',
    value: function render() {
      var _this6 = this;

      if (this.state.liked) {
        return 'You liked this.';
      }

      return e('button', { onClick: function onClick() {
          return _this6.setState({ liked: true });
        } }, 'Like');
    }
  }]);

  return LikeButton;
}(React.Component);

var domContainer = document.querySelector('#root');
ReactDOM.render(e(App), domContainer);
},{"./spotify-browser.js":2}],2:[function(require,module,exports){
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

exports.getArtist = function (id, callback) {
  callSpotifyAPI(API_URL + "/artists/" + id, callback);
};

exports.getArtistAlbums = function (id, callback) {
  callSpotifyAPI(API_URL + "/artists/" + id + "/albums?include_groups=album&limit=50", callback);
};

exports.getAlbum = function (id, callback) {
  callSpotifyAPI(API_URL + "/albums/" + id, callback);
};
},{"querystring":5}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],4:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],5:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":3,"./encode":4}]},{},[1]);
