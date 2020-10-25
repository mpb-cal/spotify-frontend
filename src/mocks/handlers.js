const { rest } = require('msw');
const testData = require('./testData.js');

const API_URL = `${process.env.NODE_ENV === 'test' ? "https://api.spotify.com/v1" : ''}`;
const TOKEN_HREF = "/spotify-frontend/token";
const TOKEN_URL = `${process.env.NODE_ENV === 'test' ? 'http://localhost' : ''}${TOKEN_HREF}`;

exports.handlers = [

  rest.get(API_URL + '/me/albums?limit=50&offset=0', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(testData.albums),
    );
  }),

  rest.get(API_URL + '*', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({name: 'abcdefg', }),
    );
  }),

  rest.get(TOKEN_URL, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        access_token: 'abcdefg',
      }),
    );
  }),

]


