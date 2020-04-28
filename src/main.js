window.onSpotifyWebPlaybackSDKReady = () => {
  const spotify = require('./spotify-browser.js');
  const FileSaver = require('file-saver');

  const Row = ReactBootstrap.Row;
  const Col = ReactBootstrap.Col;
  const Button = ReactBootstrap.Button;
  const Form = ReactBootstrap.Form;
  const FormGroup = ReactBootstrap.FormGroup;
  const Accordion = ReactBootstrap.Accordion;
  const Card = ReactBootstrap.Card;

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
          </td>
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
  {/*
            <button onClick={() => this.clickSaveAlbum(e.track.album.id)}>
              Save Album
            </button>
  */}
          </td>
        </tr>
      ))}
    </React.Fragment>
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

  const AlbumTrack = ({track, idx}) => {
    return (
      <li>
        {track.name}.....{msToDuration(track.duration_ms)}
          <a href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer">
            .....Open in Spotify
          </a>
      </li>
    );
  }

  const AlbumTable = ({albums, showTracks, onChangeCheckbox}) => (
    <table className="table table-sm albums">
      <thead className="sticky-top">
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
            <input type="checkbox" id="showTracks" name="showTracks" checked={showTracks} onChange={onChangeCheckbox}/>
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
        {albums.map((e,i) => (
          <tr key={i.toString()}>
            <td className="text-center">
              <img src={e.album.images[2].url} alt="" />
            </td>
            <td>
              {e.album.artists[0].name}
            </td>
            <td>
              <a href={e.album.external_urls.spotify} target="_blank" rel="noopener noreferrer" >
                {e.album.name}
              </a>
              {showTracks ? (
                <ol>
                  {e.album.tracks.items.map((e2,i2) => (
                    <AlbumTrack key={i2.toString()} track={e2} idx={i2} />
                  ))}
                </ol>
              )
              :
              ""
              }
            </td>
            <td>
              {e.album.label}
            </td>
            <td className="text-right">
              {e.album.popularity}
            </td>
            <td>
              {e.album.release_date}
            </td>
            <td className="text-right">
              {e.album.total_tracks}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

/*
POST 	/v1/me/player/queue 	Add an Item to the User's Playback Queue 	-
GET 	/v1/me/player/devices 	Get a User's Available Devices 	devices
GET 	/v1/me/player 	Get Information About The User's Current Playback 	currently playing context
GET 	/v1/me/player/recently-played 	Get Current User's Recently Played Tracks 	play history object
GET 	/v1/me/player/currently-playing 	Get the User's Currently Playing Track 	currently playing object
PUT 	/v1/me/player/pause 	Pause a User's Playback 	-
PUT 	/v1/me/player/seek 	Seek To Position In Currently Playing Track 	-
PUT 	/v1/me/player/repeat 	Set Repeat Mode On User’s Playback 	-
PUT 	/v1/me/player/volume 	Set Volume For User's Playback 	-
POST 	/v1/me/player/next 	Skip User’s Playback To Next Track 	-
POST 	/v1/me/player/previous 	Skip User’s Playback To Previous Track 	-
PUT 	/v1/me/player/play 	Start/Resume a User's Playback 	-
PUT 	/v1/me/player/shuffle 	Toggle Shuffle For User’s Playback 	-
PUT 	/v1/me/player 	Transfer a User's Playback
*/

  const Player = () => (
    <div className="player m-3">
      <h3>Player</h3>
      <button onClick={() => spotify.play()}>
        Play
      </button>
      <button onClick={() => spotify.pause()}>
        Pause
      </button>
    </div>
  );

  class Spotifyer extends React.Component {
    constructor(props) {
      super(props);
      this.onGetPlaylists = this.onGetPlaylists.bind(this);
      this.onGetPlaylistTracks = this.onGetPlaylistTracks.bind(this);
      this.clickAlbumsButton = this.clickAlbumsButton.bind(this);
      this.changeCheckbox = this.changeCheckbox.bind(this);
      this.clickExportAlbums = this.clickExportAlbums.bind(this);
      this.changeChooseFile = this.changeChooseFile.bind(this);

      this.state = {
        ready: false,
        albums: [],
        user: {},
        player: {},
        recentlyPlayed: {},
        currentlyPlaying: {},
        devices: [],
        userAlbums: [],
        userPlaylists: [],
        userPlaylistTracks: [],
        showTracks: true,
        showPlaylistTracks: false,
        showPlaylists: false,
        showAlbums: true,
      };
    }

    componentDidMount() {
      spotify.init(() => {
        this.setState({
          ready: true,
        });

    /*
        spotify.getUser((data) => {
          console.log(data);
          this.setState({
            user: data,
          });
        });
    */

    /*
        spotify.getUserAlbums((data) => {
          this.setState((state) => ({
            userAlbums: [...state.userAlbums, ...data.items].sort(albumSort),
          }));
        });
    */

        //spotify.getUserPlaylists(this.onGetPlaylists);
      });
    }

    getDevices() {
      spotify.getDevices((data) => {
        console.log(data);
        this.setState({
          devices: data.devices,
        });
      });
    }

    getPlayer() {
      spotify.getPlayer((data) => {
        console.log(data);
        this.setState({
          player: data,
        });
      });
    }

    getRecentlyPlayed() {
      spotify.getRecentlyPlayed((data) => {
        console.log(data);
        this.setState({
          recentlyPlayed: data,
        });
      });
    }

    getCurrentlyPlaying() {
      spotify.getCurrentlyPlaying((data) => {
        console.log(data);
        this.setState({
          currentlyPlaying: data,
        });
      });
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

    clickExportAlbums() {
      var blob = new Blob(
        [JSON.stringify({userAlbums: this.state.userAlbums})], 
        {type: "text/plain;charset=utf-8"}
      );
      FileSaver.saveAs(blob, "userAlbums.json");
    }

    changeChooseFile(e) {
      let files = e.target.files;
      if (files.length > 0) {
        let file = files[0];
        if (typeof file !== 'undefined') {
          let reader = new FileReader();
          reader.readAsText(file);
          reader.onloadend = () => {
            let data = JSON.parse(reader.result);
            if (typeof data.userAlbums !== 'undefined') {
              let userAlbums = data.userAlbums;
              console.log(userAlbums);
              this.setState({
                userAlbums
              });
            }
          };
        }
      }
    }

    renderPlaylistTable() {
      return (
        <table className="table table-sm playlists">
          <thead className="sticky-top">
            <tr>
              <th>
                Playlist Name <input type="checkbox" id="showPlaylistTracks" name="showPlaylistTracks" checked={this.state.showPlaylistTracks} onChange={this.changeCheckbox}/>
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
                  <td className="text-right">
                    {e.tracks.total}
                  </td>
                </tr>
                {(this.state.showPlaylistTracks && e.trackList) &&
                  <tr>
                    <td colspan={2}>
                      <TrackTable tracks={e.trackList} />
                    </td>
                  </tr>}
      {/*
                {(this.state.showPlaylistTracks && e.trackList) && <TrackRows tracks={e.trackList} />}
      */}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      );
    }

    render() {
      const {showPlaylists, showAlbums, showTracks, userAlbums} = this.state;

      return (
        <div className="spotifyer">
          <Player />
          <button onClick={() => this.getDevices()}>
            Get Devices
          </button>
          {this.state.devices.map((e, i) => (
            <ObjectTable key={i.toString()} object={e} />
          ))}
          <button onClick={() => this.getPlayer()}>
            Get Player Info
          </button>
          <ObjectTable object={this.state.player} />
          <button onClick={() => this.getRecentlyPlayed()}>
            Get Recently Played
          </button>
          <ObjectTable object={this.state.recentlyPlayed} />
          <button onClick={() => this.getCurrentlyPlaying()}>
            Get Currently Playing
          </button>
          <ObjectTable object={this.state.currentlyPlaying} />
  {/*
          {this.renderPlaylistTrackTable()}
  */}
          <Row>
            <Col>
              <input type="checkbox" id="showPlaylists" name="showPlaylists" onChange={this.changeCheckbox} checked={showPlaylists}/>
              <label htmlFor="showPlaylists">
                Show Playlists
              </label>
            </Col>
          </Row>
          <Row>
            <Col>
              <input type="checkbox" id="showAlbums" name="showAlbums" onChange={this.changeCheckbox} checked={showAlbums}/>
              <label htmlFor="showAlbums">
                Show Albums
              </label>
            </Col>
          </Row>
          <Row>
            <Col xs="auto">
              <Button onClick={this.clickExportAlbums} className="">
                Export Album Data
              </Button>
            </Col>
            <Form className="">
              <Form.Row>
                <FormGroup>
                  <Col xs="auto">
                    Import Album Data:
                  </Col>
                  <Col xs="auto">
                    <Form.Control type="file" className="mb-3" onChange={this.changeChooseFile} />
                  </Col>
                </FormGroup>
              </Form.Row>
            </Form>
          </Row>
            
          {showPlaylists ? this.renderPlaylistTable() : ''}
          {showAlbums ?
            <AlbumTable 
              albums={userAlbums} 
              showTracks={showTracks} 
              onChangeCheckbox={this.changeCheckbox} 
            />
          :
            ''
          }
  {/*
          <ObjectTable object={this.state.user} />
  */}
  {/*
          <button disabled={!this.state.ready} onClick={() => {this.clickAlbumsButton(spotify.ACDC_ID)}}>
            Get AC/DC Albums
          </button>
          <button disabled={!this.state.ready} onClick={() => {this.clickAlbumsButton(spotify.NICKLOWE_ID)}}>
            Get Nick Lowe Albums
          </button>
  */}
  {/*
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
  */}
        </div>
      );
    }
  }

  function App() {
    return (
      <ReactBootstrap.Container fluid>
        <a href={spotify.LOGIN_URL}>
          Login to Spotify
        </a>
        <Spotifyer />
      </ReactBootstrap.Container>
    );
  }

  ReactDOM.render(
    <App />,
    document.querySelector('#root')
  );
};

