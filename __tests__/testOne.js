const spotify = require('../src/spotify-browser.js');

it('initializes the spotify browser module', done => {
  spotify.init((player) => {
    done();
  });
});

it('makes a spotify API call to get user\'s list of albums', done => {
  spotify.init((player) => {
    spotify.getUserAlbums((data) => {
      expect(data.items).toBeDefined();
      //console.log(data.items[0]);
      expect(data.items[0].album.name).toBe('Back In Memphis');
      done();
    });
  });
});

it('makes a spotify API call to getUser', done => {
  spotify.init((player) => {
    spotify.getUser((data) => {
      expect(data.name).toBe('abcdefg');
      done();
    });
  });
});

