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
        playerInfo: {},
        playerState: {},
        recentlyPlayed: {},
        currentlyPlaying: {},
        devices: [],
        userAlbums: [],
        userPlaylists: [],
        userPlaylistTracks: [],
        showTracks: false,
        showPlaylistTracks: false,
        showPlaylists: false,
        showAlbums: true,
      };
    }

    componentDidMount() {
      spotify.init((player) => {
        this.setState({
          ready: true,
        });

        if (player) {
          player.addListener('player_state_changed', player_state => {
            console.log('player_state_changed:');
            console.log(player_state);

            this.setState({
              playerState: player_state,
            });

            document.title = player_state.track_window.current_track.name;
          });
        }

    /*
        spotify.getUser((data) => {
          this.setState({
            user: data,
          });
        });
    */

        spotify.getUserAlbums((data) => {
          this.setState((state) => ({
            userAlbums: [...state.userAlbums, ...data.items].sort(albumSort),
          }));
        });

        //spotify.getUserPlaylists(this.onGetPlaylists);
      });
    }

    getDevices() {
      spotify.getDevices((data) => {
        this.setState({
          devices: data.devices,
        });
      });
    }

    getPlayer() {
      spotify.getPlayer((data) => {
        this.setState({
          playerInfo: data,
        });
      });
    }

    playTrack(uri) {
      spotify.play([uri]);
    }

    getRecentlyPlayed() {
      spotify.getRecentlyPlayed((data) => {
        this.setState({
          recentlyPlayed: data,
        });
      });
    }

    getCurrentlyPlaying() {
      spotify.getCurrentlyPlaying((data) => {
        this.setState({
          currentlyPlaying: data,
        });
      });
    }

    onGetPlaylistTracks(data, id) {
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
      const {showPlaylists, showAlbums, showTracks, userAlbums, playerState} = this.state;

      let trackName = '';
      let artistName = '';
      if (playerState && typeof playerState.track_window !== 'undefined') {
        trackName = playerState.track_window.current_track.name;
        artistName = playerState.track_window.current_track.artists.
          reduce((acc, e) => acc + e.name + ', ', '').replace(/, $/, '');
      }

      return (
        <div className="spotifyer">
          <Player name={trackName} artist={artistName} />
          <div>
            <button onClick={() => this.getDevices()}>
              Get Devices
            </button>
            {this.state.devices.map((e, i) => (
              <ObjectTable key={i.toString()} object={e} />
            ))}
          </div>
          <div>
            <button onClick={() => this.getPlayer()}>
              Get Player Info
            </button>
            <ObjectTable object={this.state.playerInfo} />
          </div>
          <div>
            <button onClick={() => this.getRecentlyPlayed()}>
              Get Recently Played
            </button>
            <ObjectTable object={this.state.recentlyPlayed} />
          </div>
          <div>
            <button onClick={() => this.getCurrentlyPlaying()}>
              Get Currently Playing
            </button>
            <ObjectTable object={this.state.currentlyPlaying} />
          </div>
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
              playTrack={this.playTrack} 
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

  const Player = (props) => (
    <div className="player p-3 sticky-top">
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

  const AlbumTable = ({albums, showTracks, onChangeCheckbox, playTrack}) => (
    <table className="table table-sm albums">
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
              {e.album.name} -&nbsp;
              <a href={e.album.external_urls.spotify} target="_blank" rel="noopener noreferrer" >
                Open in Spotify
              </a>
              {showTracks ? (
                <ol>
                  {e.album.tracks.items.map((e2,i2) => (
                    <AlbumTrack
                      key={i2.toString()}
                      track={e2}
                      idx={i2}
                      playTrack={playTrack} />
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

  const AlbumTrack = ({track, idx, playTrack}) => {
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

