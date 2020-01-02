var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _this = this;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
  var a1 = a.album.artists[0].name.toUpperCase();
  var b1 = b.album.artists[0].name.toUpperCase();
  if (a1 < b1) return -1;
  if (b1 < a1) return 1;
  a1 = a.album.release_date;
  b1 = b.album.release_date;
  if (a1 < b1) return -1;
  if (b1 < a1) return 1;
  return 0;
};

var playlistSort = function playlistSort(a, b) {
  var a1 = a.name.toUpperCase();
  var b1 = b.name.toUpperCase();
  if (a1 < b1) return -1;
  if (b1 < a1) return 1;
  return 0;
};

var SpotifyLink = function SpotifyLink(props) {
  return React.createElement(
    'a',
    { href: props.item.external_urls.spotify, target: '_blank', rel: 'noopener noreferrer' },
    props.item.name
  );
};

var TrackRows = function TrackRows(_ref2) {
  var tracks = _ref2.tracks;
  return React.createElement(
    React.Fragment,
    null,
    tracks.map(function (e, i) {
      return React.createElement(
        'tr',
        { key: i.toString() },
        React.createElement(
          'td',
          null,
          React.createElement(SpotifyLink, { item: e.track.artists[0] })
        ),
        React.createElement(
          'td',
          null,
          React.createElement(SpotifyLink, { item: e.track })
        ),
        React.createElement(
          'td',
          null,
          msToDuration(e.track.duration_ms)
        ),
        React.createElement(
          'td',
          null,
          React.createElement(SpotifyLink, { item: e.track.album }),
          React.createElement(
            'button',
            { onClick: function onClick() {
                return _this.clickSaveAlbum(e.track.album.id);
              } },
            'Save Album'
          )
        )
      );
    })
  );
};

var Spotifyer = function (_React$Component) {
  _inherits(Spotifyer, _React$Component);

  function Spotifyer(props) {
    _classCallCheck(this, Spotifyer);

    var _this2 = _possibleConstructorReturn(this, (Spotifyer.__proto__ || Object.getPrototypeOf(Spotifyer)).call(this, props));

    _this2.onSpotifyInit = _this2.onSpotifyInit.bind(_this2);
    _this2.onGetPlaylists = _this2.onGetPlaylists.bind(_this2);
    _this2.onGetPlaylistTracks = _this2.onGetPlaylistTracks.bind(_this2);
    _this2.clickAlbumsButton = _this2.clickAlbumsButton.bind(_this2);
    _this2.changeCheckbox = _this2.changeCheckbox.bind(_this2);

    _this2.state = {
      ready: false,
      albums: [],
      user: {},
      userAlbums: [],
      userPlaylists: [],
      userPlaylistTracks: [],
      showTracks: true,
      showPlaylistTracks: true,
      showPlaylists: true,
      showAlbums: false
    };
    return _this2;
  }

  _createClass(Spotifyer, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      spotify.init(this.onSpotifyInit);
    }
  }, {
    key: 'onGetPlaylistTracks',
    value: function onGetPlaylistTracks(data, id) {
      //data.items.forEach((e, i, a) => {
      //console.log(id + " " + e.track.name);
      //});

      this.setState(function (state) {
        var userPlaylists = state.userPlaylists;
        var index = userPlaylists.findIndex(function (e) {
          return e.id == id;
        });
        if (index !== -1) {
          userPlaylists[index].trackList = [].concat(_toConsumableArray(userPlaylists[index].trackList), _toConsumableArray(data.items));
        }

        return {
          userPlaylists: userPlaylists
        };
      });
    }
  }, {
    key: 'onGetPlaylists',
    value: function onGetPlaylists(data) {
      var _this3 = this;

      console.log(data);

      data.items.forEach(function (e) {
        return e.trackList = [];
      });

      this.setState(function (state) {
        return {
          userPlaylists: [].concat(_toConsumableArray(state.userPlaylists), _toConsumableArray(data.items)).sort(playlistSort)
        };
      });

      data.items.forEach(function (e, i, a) {
        spotify.getPlaylistTracks(e.id, _this3.onGetPlaylistTracks);
      });
    }
  }, {
    key: 'onSpotifyInit',
    value: function onSpotifyInit() {
      var _this4 = this;

      this.setState({
        ready: true
      });

      spotify.getUser(function (data) {
        console.log(data);
        _this4.setState({
          user: data
        });
      });

      spotify.getUserAlbums(function (data) {
        console.log(data);

        _this4.setState(function (state) {
          return {
            userAlbums: [].concat(_toConsumableArray(state.userAlbums), _toConsumableArray(data.items)).sort(albumSort)
          };
        });
      });

      spotify.getUserPlaylists(this.onGetPlaylists);
    }
  }, {
    key: 'clickAlbumsButton',
    value: function clickAlbumsButton(artistId) {
      var _this5 = this;

      this.setState({
        albums: []
      });

      spotify.getArtistAlbums(artistId, function (data) {
        data.items.forEach(function (e, i, a) {
          spotify.getAlbum(e.id, function (data) {
            _this5.setState(function (state) {
              return {
                albums: [].concat(_toConsumableArray(_this5.state.albums), [data]).sort(artistAlbumSort)
              };
            });
          });
        });
      });
    }
  }, {
    key: 'changeCheckbox',
    value: function changeCheckbox(e) {
      var name = e.target.name;
      var checked = e.target.checked;

      this.setState(_defineProperty({}, name, checked));
    }
  }, {
    key: 'renderPlaylistTrackTable',
    value: function renderPlaylistTrackTable() {
      return React.createElement(
        'table',
        { border: 1 },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            null,
            React.createElement(
              'th',
              null,
              'Name'
            ),
            React.createElement(
              'th',
              null,
              '# of Tracks'
            )
          )
        ),
        React.createElement(
          'tbody',
          null,
          this.state.userPlaylistTracks.map(function (e, i) {
            return React.createElement(
              'tr',
              { key: i.toString() },
              React.createElement(
                'td',
                null,
                React.createElement(
                  'a',
                  { href: e.track.external_urls.spotify, target: '_blank', rel: 'noopener noreferrer' },
                  e.track.name
                ),
                '...',
                msToDuration(e.track.duration_ms)
              )
            );
          })
        )
      );
    }
  }, {
    key: 'clickDeletePlaylist',
    value: function clickDeletePlaylist(id) {
      spotify.deletePlaylist(id);
    }
  }, {
    key: 'clickSaveAlbum',
    value: function clickSaveAlbum(id) {
      spotify.saveAlbum(id);
    }
  }, {
    key: 'renderPlaylistTable',
    value: function renderPlaylistTable() {
      return React.createElement(
        'table',
        { border: 1 },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            null,
            React.createElement(
              'th',
              null,
              'Name',
              React.createElement('input', { type: 'checkbox', id: 'showPlaylistTracks', name: 'showPlaylistTracks', checked: this.state.showPlaylistTracks, onChange: this.changeCheckbox }),
              React.createElement(
                'label',
                { htmlFor: 'showPlaylistTracks' },
                'Show Tracks'
              )
            ),
            React.createElement(
              'th',
              null,
              '# of Tracks'
            )
          )
        ),
        React.createElement(
          'tbody',
          null,
          this.state.userPlaylists.map(function (e, i) {
            return React.createElement(
              React.Fragment,
              { key: i.toString() },
              React.createElement(
                'tr',
                null,
                React.createElement(
                  'td',
                  null,
                  React.createElement(
                    'a',
                    { href: e.external_urls.spotify, target: '_blank', rel: 'noopener noreferrer' },
                    e.name
                  )
                ),
                React.createElement(
                  'td',
                  null,
                  e.tracks.total
                )
              ),
              React.createElement(TrackRows, { tracks: e.trackList })
            );
          })
        )
      );
    }
  }, {
    key: 'renderAlbumTable',
    value: function renderAlbumTable() {
      var _this6 = this;

      return React.createElement(
        'table',
        { border: 1 },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            null,
            React.createElement(
              'th',
              null,
              React.createElement('input', { type: 'checkbox', id: 'showImage', disabled: true, checked: true, readOnly: true }),
              React.createElement(
                'label',
                { htmlFor: 'showImage' },
                'Show Image'
              )
            ),
            React.createElement(
              'th',
              null,
              'Artists(s)'
            ),
            React.createElement(
              'th',
              null,
              'Album Title',
              React.createElement('br', null),
              React.createElement('input', { type: 'checkbox', id: 'showTracks', name: 'showTracks', checked: this.state.showTracks, onChange: this.changeCheckbox }),
              React.createElement(
                'label',
                { htmlFor: 'showTracks' },
                'Show Tracks'
              )
            ),
            React.createElement(
              'th',
              null,
              'Label'
            ),
            React.createElement(
              'th',
              null,
              'Popularity (1-100)'
            ),
            React.createElement(
              'th',
              null,
              'Release Date'
            ),
            React.createElement(
              'th',
              null,
              '# of Tracks'
            )
          )
        ),
        React.createElement(
          'tbody',
          null,
          this.state.userAlbums.map(function (e, i) {
            return React.createElement(
              'tr',
              { key: i.toString() },
              React.createElement(
                'td',
                null,
                React.createElement('img', { src: e.album.images[2].url, alt: '' })
              ),
              React.createElement(
                'td',
                null,
                e.album.artists[0].name
              ),
              React.createElement(
                'td',
                null,
                React.createElement(
                  'a',
                  { href: e.album.external_urls.spotify, target: '_blank', rel: 'noopener noreferrer' },
                  e.album.name
                ),
                _this6.state.showTracks ? React.createElement(
                  'ol',
                  null,
                  e.album.tracks.items.map(function (e2, i2) {
                    return React.createElement(
                      'li',
                      { key: i2.toString() },
                      React.createElement(
                        'a',
                        { href: e2.external_urls.spotify, target: '_blank', rel: 'noopener noreferrer' },
                        e2.name
                      ),
                      '...',
                      msToDuration(e2.duration_ms)
                    );
                  })
                ) : ""
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
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _this7 = this;

      return React.createElement(
        'div',
        { className: 'spotifyer' },
        React.createElement('input', { type: 'checkbox', id: 'showPlaylists', name: 'showPlaylists', onChange: this.changeCheckbox, checked: this.state.showPlaylists }),
        React.createElement(
          'label',
          { htmlFor: 'showPlaylists' },
          'Show Playlists'
        ),
        React.createElement('input', { type: 'checkbox', id: 'showAlbums', name: 'showAlbums', onChange: this.changeCheckbox, checked: this.state.showAlbums }),
        React.createElement(
          'label',
          { htmlFor: 'showAlbums' },
          'Show Albums'
        ),
        this.state.showPlaylists ? this.renderPlaylistTable() : '',
        this.state.showAlbums ? this.renderAlbumTable() : '',
        React.createElement(ObjectTable, { object: this.state.user }),
        React.createElement(
          'button',
          { disabled: !this.state.ready, onClick: function onClick() {
              _this7.clickAlbumsButton(spotify.ACDC_ID);
            } },
          'Get AC/DC Albums'
        ),
        React.createElement(
          'button',
          { disabled: !this.state.ready, onClick: function onClick() {
              _this7.clickAlbumsButton(spotify.NICKLOWE_ID);
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

    var _this8 = _possibleConstructorReturn(this, (LikeButton.__proto__ || Object.getPrototypeOf(LikeButton)).call(this, props));

    _this8.state = { liked: false };
    return _this8;
  }

  _createClass(LikeButton, [{
    key: 'render',
    value: function render() {
      var _this9 = this;

      if (this.state.liked) {
        return 'You liked this.';
      }

      return e('button', { onClick: function onClick() {
          return _this9.setState({ liked: true });
        } }, 'Like');
    }
  }]);

  return LikeButton;
}(React.Component);

var domContainer = document.querySelector('#root');
ReactDOM.render(e(App), domContainer);