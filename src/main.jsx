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

class Spotifyer extends React.Component {
  constructor(props) {
    super(props);
    this.clickAlbumsButton = this.clickAlbumsButton.bind(this);
    this.changeShowTracks = this.changeShowTracks.bind(this);

    this.state = {
      ready: false,
      albums: [],
      user: {},
      userAlbums: [],
      userPlaylists: [],
      showTracks: true,
    };
  }

  componentDidMount() {
    spotify.init(() => {
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

      spotify.getUserPlaylists((data) => {
        console.log(data);
        
        this.setState((state) => ({
          userPlaylists: [...state.userPlaylists, ...data.items].sort(playlistSort),
        }));
      });
    });
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

  renderPlaylistTable() {
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
          {this.state.userPlaylists.map((e,i) => (
            <tr key={i.toString()}>
              <td>
                <a href={e.external_urls.spotify} target="_blank" rel="noopener noreferrer" >
                  {e.name}
                </a>
              </td>
              <td>
                {e.tracks.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  changeShowTracks(e) {
    const showTracks = e.target.checked;

    this.setState({
      showTracks: showTracks,
    });
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
              <input type="checkbox" id="showTracks" checked={this.state.showTracks} onChange={this.changeShowTracks}/>
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
        <input type="checkbox" id="showPlaylists" disabled checked />
        <label htmlFor="showPlaylists">
          Show Playlists
        </label>
        {this.renderPlaylistTable()}
        <input type="checkbox" id="showAlbums" disabled checked />
        <label htmlFor="showAlbums">
          Show Albums
        </label>
        {this.renderAlbumTable()}
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

