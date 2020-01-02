const spotify = require('./spotify-browser.js');

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

const ObjectTable = ({object}) => (
  <table border={1}>
    <tbody>
      {Object.keys(object).map((e,i) => (
        <tr key={i.toString()}>
          <td>
            {e}
          </td>
          <td>
            {object[e] ? object[e].toString() : ""}
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

const TrackRows = ({tracks}) => (
  <React.Fragment>
    {tracks.map((e,i) => (
      <tr key={i.toString()}>
        <td>
          <SpotifyLink item={e.track.artists[0]} />
        </td>
        <td>
          <SpotifyLink item={e.track} />
        </td>
        <td>
          {msToDuration(e.track.duration_ms)}
        </td>
        <td>
          <SpotifyLink item={e.track.album} />
          <button onClick={() => this.clickSaveAlbum(e.track.album.id)}>
            Save Album
          </button>
        </td>
      </tr>
    ))}
  </React.Fragment>
);

class Spotifyer extends React.Component {
  constructor(props) {
    super(props);
    this.onSpotifyInit = this.onSpotifyInit.bind(this);
    this.onGetPlaylists = this.onGetPlaylists.bind(this);
    this.onGetPlaylistTracks = this.onGetPlaylistTracks.bind(this);
    this.clickAlbumsButton = this.clickAlbumsButton.bind(this);
    this.changeCheckbox = this.changeCheckbox.bind(this);

    this.state = {
      ready: false,
      albums: [],
      user: {},
      userAlbums: [],
      userPlaylists: [],
      userPlaylistTracks: [],
      showTracks: true,
      showPlaylistTracks: true,
      showPlaylists: true,
      showAlbums: false,
    };
  }

  componentDidMount() {
    spotify.init(this.onSpotifyInit);
  }

  onGetPlaylistTracks(data, id) {
    //data.items.forEach((e, i, a) => {
      //console.log(id + " " + e.track.name);
    //});

    this.setState((state) => {
      let userPlaylists = state.userPlaylists;
      const index = userPlaylists.findIndex((e) => e.id == id);
      if (index !== -1) {
        userPlaylists[index].trackList = [...userPlaylists[index].trackList, ...data.items];
      }

      return {
        userPlaylists: userPlaylists,
      };
    });
  }

  onGetPlaylists(data) {
    console.log(data);

    data.items.forEach((e) => e.trackList = []);

    this.setState((state) => ({
      userPlaylists: [...state.userPlaylists, ...data.items].sort(playlistSort),
    }));

    data.items.forEach((e, i, a) => {
      spotify.getPlaylistTracks(e.id, this.onGetPlaylistTracks);
    });
  }

  onSpotifyInit() {
    this.setState({
      ready: true,
    });

    spotify.getUser((data) => {
      console.log(data);
      this.setState({
        user: data,
      });
    });

    spotify.getUserAlbums((data) => {
      console.log(data);

      this.setState((state) => ({
        userAlbums: [...state.userAlbums, ...data.items].sort(albumSort),
      }));
    });

    spotify.getUserPlaylists(this.onGetPlaylists);
  }

  clickAlbumsButton(artistId) {
    this.setState({
      albums: [],
    });

    spotify.getArtistAlbums(artistId, (data) => {
      data.items.forEach((e,i,a) => {
        spotify.getAlbum(e.id, (data) => {
          this.setState((state) => ({
            albums: [...this.state.albums, data].sort(artistAlbumSort),
          }));
        });
      });
    });
  }

  changeCheckbox(e) {
    const name = e.target.name;
    const checked = e.target.checked;

    this.setState({
      [name]: checked,
    });
  }

  renderPlaylistTrackTable() {
    return (
      <table border={1}>
        <thead>
          <tr>
            <th>
              Name
            </th>
            <th>
              # of Tracks
            </th>
          </tr>
        </thead>
        <tbody>
          {this.state.userPlaylistTracks.map((e,i) => (
            <tr key={i.toString()}>
              <td>
                <a href={e.track.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                  {e.track.name}
                </a>
                ...{msToDuration(e.track.duration_ms)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  clickDeletePlaylist(id) {
    spotify.deletePlaylist(id);
  }

  clickSaveAlbum(id) {
    spotify.saveAlbum(id);
  }

  renderPlaylistTable() {
    return (
      <table border={1}>
        <thead>
          <tr>
            <th>
              Name
              <input type="checkbox" id="showPlaylistTracks" name="showPlaylistTracks" checked={this.state.showPlaylistTracks} onChange={this.changeCheckbox}/>
              <label htmlFor="showPlaylistTracks">
                Show Tracks
              </label>
            </th>
            <th>
              # of Tracks
            </th>
          </tr>
        </thead>
        <tbody>
          {this.state.userPlaylists.map((e,i) => (
            <React.Fragment key={i.toString()}>
              <tr>
                <td>
                  <a href={e.external_urls.spotify} target="_blank" rel="noopener noreferrer" >
                    {e.name}
                  </a>
        {/*
                  <button onClick={() => this.clickDeletePlaylist(e.id)}>
                    Delete Playlist
                  </button>
        */}
{/*
                  {(this.state.showPlaylistTracks && e.trackList) ?
                    <table border={1}>
                      {e.trackList.map((e2,i2) => (
                        <tr key={i2.toString()}>
                          <td>
                            <SpotifyLink item={e2.track.artists[0]} />
                          </td>
                          <td>
                            <SpotifyLink item={e2.track} />
                          </td>
                          <td>
                            {msToDuration(e2.track.duration_ms)}
                          </td>
                          <td>
                            <SpotifyLink item={e2.track.album} />
                            <button onClick={() => this.clickSaveAlbum(e2.track.album.id)}>
                              Save Album
                            </button>
                          </td>
                        </tr>
                      ))}
                    </table>
                  :
                    ""
                  }
        */}
                </td>
                <td>
                  {e.tracks.total}
                </td>
              </tr>
              <TrackRows tracks={e.trackList} />
            </React.Fragment>
          ))}
        </tbody>
      </table>
    );
  }

  renderAlbumTable() {
    return (
      <table border={1}>
        <thead>
          <tr>
            <th>
              <input type="checkbox" id="showImage" disabled checked readOnly />
              <label htmlFor="showImage">
                Show Image
              </label>
            </th>
            <th>
              Artists(s)
            </th>
            <th>
              Album Title
              <br />
              <input type="checkbox" id="showTracks" name="showTracks" checked={this.state.showTracks} onChange={this.changeCheckbox}/>
              <label htmlFor="showTracks">
                Show Tracks
              </label>
            </th>
            <th>
              Label
            </th>
            <th>
              Popularity (1-100)
            </th>
            <th>
              Release Date
            </th>
            <th>
              # of Tracks
            </th>
          </tr>
        </thead>
        <tbody>
          {this.state.userAlbums.map((e,i) => (
            <tr key={i.toString()}>
              <td>
                <img src={e.album.images[2].url} alt="" />
              </td>
              <td>
                {e.album.artists[0].name}
              </td>
              <td>
                <a href={e.album.external_urls.spotify} target="_blank" rel="noopener noreferrer" >
                  {e.album.name}
                </a>
                {this.state.showTracks ? (
                <ol>
                  {e.album.tracks.items.map((e2,i2) => (
                    <li key={i2.toString()}>
                      <a href={e2.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                        {e2.name}
                      </a>
                      ...{msToDuration(e2.duration_ms)}
                    </li>
                  ))}
                </ol>)
                :
                ""
                }
              </td>
              <td>
                {e.album.label}
              </td>
              <td>
                {e.album.popularity}
              </td>
              <td>
                {e.album.release_date}
              </td>
              <td>
                {e.album.total_tracks}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  render() {
    return (
      <div className="spotifyer">
{/*
        {this.renderPlaylistTrackTable()}
*/}
        <input type="checkbox" id="showPlaylists" name="showPlaylists" onChange={this.changeCheckbox} checked={this.state.showPlaylists}/>
        <label htmlFor="showPlaylists">
          Show Playlists
        </label>
        <input type="checkbox" id="showAlbums" name="showAlbums" onChange={this.changeCheckbox} checked={this.state.showAlbums}/>
        <label htmlFor="showAlbums">
          Show Albums
        </label>
        {this.state.showPlaylists ? this.renderPlaylistTable() : ''}
        {this.state.showAlbums ? this.renderAlbumTable() : ''}
        <ObjectTable object={this.state.user} />
        <button disabled={!this.state.ready} onClick={() => {this.clickAlbumsButton(spotify.ACDC_ID)}}>
          Get AC/DC Albums
        </button>
        <button disabled={!this.state.ready} onClick={() => {this.clickAlbumsButton(spotify.NICKLOWE_ID)}}>
          Get Nick Lowe Albums
        </button>
        {this.state.albums.map((e,i) => (
          <div key={i.toString()}>
            <img src={e.images[1].url} style={{float: "left", }} alt="" />
            <div style={{float: "left", }}>
              <a href={e.external_urls.spotify} target="_blank" rel="noopener noreferrer" >{e.name}</a><br/>
              Release Date: {e.release_date}<br/>
              <ol>
              {e.tracks.items.map((e,i) => (
                <li key={i.toString()}>
                  <a href={e.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                    {e.name}
                  </a>
                  ...{msToDuration(e.duration_ms)}
                </li>
              ))}
              </ol>
            </div>
            <div style={{clear: "both", }}>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
      <a href={spotify.LOGIN_URL}>
        Login to Spotify
      </a>
      <Spotifyer />
    </div>
  );
}



const e = React.createElement;

class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    if (this.state.liked) {
      return 'You liked this.';
    }

    return e(
      'button',
      { onClick: () => this.setState({ liked: true }) },
      'Like'
    );
  }
}

const domContainer = document.querySelector('#root');
ReactDOM.render(e(App), domContainer);

