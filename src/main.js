window.onSpotifyWebPlaybackSDKReady = () => {
/*
  if (process.env.NODE_ENV !== 'production') {
    const { worker } = require('./mocks/browser')
    worker.start()
  }
*/

  const spotify = require('./spotify-browser.js');
  const FileSaver = require('file-saver');
  const useState = React.useState;
  const useEffect = React.useEffect;
  const useContext = React.useContext;
  const UserContext = React.createContext();

  const msToDuration = (ms) => {
    const sec = Math.floor(ms / 1000);
    const minutes = Math.floor(sec / 60);
    return String(minutes).padStart(2, '0') + ":" + String(sec % 60).padStart(2, '0');
  }

  const artistAlbumSort = (a, b) => {
    if (a.release_date < b.release_date) return -1;
    if (b.release_date < a.release_date) return 1;
    return 0;
  }

  function Spotifyer() {
    const [ready, setReady] = useState(false);
    const [albums, setAlbums] = useState([]);
    const [user, setUser] = useState({});
    const [playerInfo, setPlayerInfo] = useState({});
    const [playerState, setPlayerState] = useState({});
    const [recentlyPlayed, setRecentlyPlayed] = useState({});
    const [currentlyPlaying, setCurrentlyPlaying] = useState({});
    const [devices, setDevices] = useState([]);
    const [userAlbums, setUserAlbums] = useState([]);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [userPlaylistTracks, setUserPlaylistTracks] = useState([]);
    const [showPlaylistTracks, setShowPlaylistTracks] = useState(false);
    const [showPlaylists, setShowPlaylists] = useState(false);
    const [showAlbums, setShowAlbums] = useState(true);

    useEffect(() => {
      spotify.init((player) => {
        setReady(true);

        if (player) {
          player.addListener('player_state_changed', player_state => {
            console.log('player_state_changed:');
            console.log(player_state);
            setPlayerState(player_state);
            document.title = player_state.track_window.current_track.name;
          });
        }

        spotify.getUserAlbums((data) => {
          let albums = data.items.sort(albumSort).map(e => e.album);
          setUserAlbums(albums);
        });
      });
    }, []);

    let trackName = '';
    let artistName = '';
    if (playerState && typeof playerState.track_window !== 'undefined') {
      trackName = playerState.track_window.current_track.name;
      artistName = playerState.track_window.current_track.artists.
        reduce((acc, e) => acc + e.name + ', ', '').replace(/, $/, '');
    }

    function getDevices() {
      spotify.getDevices(data => setDevices(data.devices));
    }

    function getPlayer() {
      spotify.getPlayer(data => setPlayerInfo(data));
    }

    function getUserAlbums() {
      spotify.getUserAlbums(data => setAlbums(data));
    }

    function getRecentlyPlayed() {
      spotify.getRecentlyPlayed(data => setRecentlyPlayed(data));
    }

    function getCurrentlyPlaying() {
      spotify.getCurrentlyPlaying(data => setCurrentlyPlaying(data));
    }

    function playTrack(uri) {
      spotify.play([uri]);
    }

    function onExportAlbumData() {
      var blob = new Blob(
        [JSON.stringify({userAlbums: userAlbums})], 
        {type: "text/plain;charset=utf-8"}
      );
      FileSaver.saveAs(blob, "userAlbums.json");
    }

    function onImportAlbumData(event) {
      let files = event.target.files;
      if (files.length > 0) {
        let file = files[0];
        if (typeof file !== 'undefined') {
          let reader = new FileReader();
          reader.readAsText(file);
          reader.onloadend = () => {
            let data = JSON.parse(reader.result);
            if (typeof data.userAlbums !== 'undefined') {
              let userAlbums = data.userAlbums;
              setUserAlbums(userAlbums);
            }
          };
        }
      }
    }

    return (
      <div className="spotifyer">
        <h1>
          Spotifyer - {ready ? "Ready" : "Not Ready"}
        </h1>
        <Player name={trackName} artist={artistName} />
        <div>
          <button onClick={getDevices}>
            Get Devices
          </button>
          {devices.map((device, i) => (
            <ObjectTable key={i.toString()} object={device} />
          ))}
        </div>
        <div>
          <button onClick={getPlayer}>
            Get Player Info
          </button>
          <ObjectTable object={playerInfo} />
        </div>
        <div>
          <button onClick={getRecentlyPlayed}>
            Get Recently Played
          </button>
          <ObjectTable object={recentlyPlayed} />
        </div>
        <div>
          <button onClick={getCurrentlyPlaying}>
            Get Currently Playing
          </button>
          <ObjectTable object={currentlyPlaying} />
        </div>
        <div>
          <button onClick={getUserAlbums}>
            Get User Albums
          </button>
        </div>
        <div>
          <button onClick={onExportAlbumData} className="">
            Export Album Data
          </button>
        </div>
        <div>
          Import Album Data:
          <input type="file" onChange={onImportAlbumData} />
        </div>
        <AlbumTable 
          albums={userAlbums} 
          playTrack={playTrack} 
        />
      </div>
    );
  }

  const Player = (props) => (
    <div className="player p-3">
      <h4>Track: {props.name}</h4>
      <h5>Artist(s): {props.artist}</h5>
      <button onClick={() => spotify.play()}>
        Play
      </button>
      <button onClick={() => spotify.pause()}>
        Pause
      </button>
      <button onClick={() => spotify.seek(10000)}>
        Seek 00:10
      </button>
      <button onClick={() => spotify.seek(60000)}>
        Seek 01:00
      </button>
    </div>
  );

  const ObjectTable = ({object}) => (
    <table border={1}>
      <tbody>
        {Object.keys(object).map((e,i) => (
          <tr key={i.toString()}>
            <td valign='top'>
              {e}
            </td>
            <td valign='top'>
              {object[e] ? 
                (typeof object[e] === 'object' ?
                  <ObjectTable object={object[e]} />
                :
                  object[e].toString() 
                )
              : 
                ""
              }
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const albumSort = (a, b) => {
    let a1 = a.album.artists[0].name.toUpperCase();
    let b1 = b.album.artists[0].name.toUpperCase();
    if (a1 < b1) return -1;
    if (b1 < a1) return 1;
    a1 = a.album.release_date; 
    b1 = b.album.release_date; 
    if (a1 < b1) return -1; 
    if (b1 < a1) return 1;
    return 0;
  }

  const playlistSort = (a, b) => {
    let a1 = a.name.toUpperCase();
    let b1 = b.name.toUpperCase();
    if (a1 < b1) return -1;
    if (b1 < a1) return 1;
    return 0;
  }

  const SpotifyLink = (props) => (
    <a href={props.item.external_urls.spotify} target="_blank" rel="noopener noreferrer" >
      {props.item.name}
    </a>
  );

  const TrackTable = ({tracks}) => (
    <table className="table table-sm">
      <thead className="">
        <tr>
          <th>
            Artist
          </th>
          <th>
            Title
          </th>
          <th>
            Album
          </th>
          <th>
            Length
          </th>
        </tr>
      </thead>
      <tbody>
        {tracks.map((e,i) => (
          <tr key={i.toString()}>
            <td>
              <SpotifyLink item={e.track.artists[0]} />
            </td>
            <td>
              <SpotifyLink item={e.track} />
            </td>
            <td>
              <SpotifyLink item={e.track.album} />
            </td>
            <td>
              {msToDuration(e.track.duration_ms)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  function AlbumTable({albums, playTrack}) {
    const [showTracks, setShowTracks] = useState(false);
    const username = useContext(UserContext);

    return (
      <div>
        <div className="albumTableHeader albumTableRow">
          <div>
            <input type="checkbox" id="showImage" disabled checked readOnly />
            <label htmlFor="showImage">
              Show Image
            </label>
          </div>
          <div>
            Artists(s)
          </div>
          <div>
            Album Title
            <br />
            <input
              type="checkbox"
              id="showTracks"
              name="showTracks"
              checked={showTracks}
              onChange={() => setShowTracks(!showTracks)}
            />
            <label htmlFor="showTracks">
              Show Tracks
            </label>
          </div>
          <div>
            Label
          </div>
          <div>
            Popularity (1-100)
          </div>
          <div>
            Release Date
          </div>
          <div>
            # of Tracks
          </div>
        </div>
        {albums.map((album, i) => (
          <React.Fragment key={i.toString()}>
            <div className="albumTableRow" key={i.toString()}>
              <div>
                <img src={album.images[2].url} alt="" />
              </div>
              <div>
                {album.artists[0].name}
              </div>
              <div>
                {album.name} -&nbsp;
                <a href={album.external_urls.spotify} target="_blank" rel="noopener noreferrer" >
                  Open in Spotify
                </a>
              </div>
              <div>
                {album.label}
              </div>
              <div>
                {album.popularity}
              </div>
              <div>
                {album.release_date}
              </div>
              <div>
                {album.total_tracks}
              </div>
            </div>
            {showTracks ? (
              <div className="albumTableTracksRow">
                <div>
                  <ol>
                    {album.tracks.items.map((track, i2) => (
                      <AlbumTrack
                        key={i2.toString()}
                        track={track}
                        idx={i2}
                        playTrack={playTrack} />
                    ))}
                  </ol>
                </div>
              </div>
            )
            :
            ""
            }
          </React.Fragment>
        ))}
      </div>
    );
  }

  const AlbumTrack = React.memo(({track, idx, playTrack}) => {
    return (
      <li>
        <a href="" onClick={(event) => {event.preventDefault(); playTrack(track.uri);}}>
          {track.name}
        </a>
        .....{msToDuration(track.duration_ms)}
          {/*
          <a href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer">
            .....Open in Spotify
          </a>
          */}
      </li>
    );
  });

  function App() {
    return (
      <UserContext.Provider value="marcb">
        <a href={spotify.LOGIN_URL}>
          Login to Spotify
        </a>
        <Spotifyer />
      </UserContext.Provider>
    );
  }

  ReactDOM.render(
    <App />,
    document.querySelector('#root')
  );
};

