var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const spotify = require('./spotify-server');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  console.log((new Date).toString());
  next();
});

// called from browser as api/token for client credentials
// or redirected from spotify login as api/token?code=... for authorized credentials
app.get('/api/token', function(req, res, next) {
  spotify.getAccessToken(
    (token_data) => {
      if (typeof(req.query.code) === 'undefined') {
        res.send(token_data);
      } else {
        res.redirect(
          '/?access_token=' + token_data.access_token + 
          '&refresh_token=' + token_data.refresh_token
        );
      }
    },
    req.query.code
  );
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
