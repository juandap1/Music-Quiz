var express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const yts = require( 'yt-search' );
const fs = require( 'fs' );
const path = require( 'path' );
var app = express();
const PORT = 8000;

app.use(cors());

app.get('/', function(req, res) {
  res.render('index.ejs');
});
app.get('/settings', function(req, res) {
  res.render('settings.ejs');
});

const Spotify = require('node-spotify-api');
const spotifyClient = new Spotify({
    id: "cab5f78e5e2a44b993bcd3e999fa8a0e",
    secret: "30a6d373970b49519b6e94e415254f8b"
});

start();


async function start() {
  //https://open.spotify.com/playlist/4dZQRXBixDTzIfPsIBiqxD?si=cdddaa71aad74de4 - BranBot Playlist
  var publicDir = require('path').join(__dirname,'/');
  app.use(express.static(publicDir));

  app.listen(PORT, () => {
    console.log(`Running server on PORT ${PORT}...`);
  })

  app.get('/mp3fetch', (req,res) => {
    var URL = req.query.URL;
    res.header('Content-Disposition', 'attachment; filename="video.mp3"');
    ytdl(URL, {
        format: 'mp3'
        }).pipe(res);
  });

  app.get('/delete', (req,res) => {
    var url = req.query.URL;
    if (fs.existsSync(path.join(__dirname, url))) { 
      setTimeout(function () {
        fs.unlink(path.join(__dirname, url), (err) => {
          if (err) { 
            console.log(err); 
          } 
        });
        res.json({result: 'success'})
      }, 3600000);
    }
  });

  app.get('/getsong', async (req,res) => {
    var spotifyurl = 'https://open.spotify.com/playlist/7emq1SwiOSZxOty3fgARES?si=9c14f5c9569947e2';
    var path = await spotify_tracks_from_playlist(spotifyurl);
    console.log(JSON.parse(path));
    res.json(JSON.parse(path));
  });
}

function isSpotify(str) {
  return str.toLowerCase().indexOf('spotify.com') > -1;
}

function spotify_extract_trackname(item) {
  if ('artists' in item) {
      let name = [];
      for (let artist of item.artists) {
          name.push(artist.name);
      }
      return name;
  } else if ('track' in item && 'artists' in item.track) {
      return spotify_extract_trackname(item.track);
  }
}

async function spotify_tracks(url) {
const ui = url.replace("https://open.spotify.com/track/", "").split("?")[0];
let track = await spotifyClient
  .request('https://api.spotify.com/v1/tracks/' + ui)
  .then(function(data) {
    return spotify_extract_trackname(data);
}).catch(function(err) {
    console.error('spotify_tracks: ' + err);
});
return(track);
}

async function spotify_new_releases() {

  let arr = await spotifyClient
      .request('https://api.spotify.com/v1/browse/new-releases')
      .then(function(data) {
          let arr = [];
          if ('albums' in data) {
              for (let item of data.albums.items) {
                  let track = spotify_extract_trackname(item)
                  arr.push(track)
              }
          }
          return arr;
      })
      .catch(function(err) {
          console.error('spotify_new_releases: ' + err);
      });

  return arr;
}

async function spotify_recommended(genre) {

  let arr = await spotifyClient
      .request('https://api.spotify.com/v1/recommendations?seed_genres=' + genre)
      .then(function(data) {
          let arr = [];
          if ('tracks' in data) {
              for (let item of data.tracks) {
                  let track = spotify_extract_trackname(item)
                  arr.push(track)
              }
          }
          return arr;
      })
      .catch(function(err) {
          console.error('spotify_recommended: ' + err);
      });

  return arr;
}

async function spotify_tracks_from_playlist(spotifyurl) {
  const regex = /\/playlist\/(.+?)(\?.+)?$/;
  const found = spotifyurl.match(regex);
  const playlist = 'https://api.spotify.com/v1/playlists/' + found[1];
  let total = await spotifyClient
      .request(playlist)
      .then(function(data) {
          return data.tracks.total;
      })
      .catch(function(err) {
          console.error('spotify_tracks_from_playlist: ' + err);
      });
  var arr = [];
  while(arr.length < 4){
      var r = Math.floor(Math.random() * total) + 1;
      if(arr.indexOf(r) === -1) arr.push(r);
  }
  var trackData = {
    "name": "",
    "artists": [],
    "wrong": [],
    "thumbnail": "",
    "path": ""
  };
  for (var i = 0; i < 4; i++) {
    var url = playlist + '/tracks?offset=' + arr[i] + '&limit=1';
    await spotifyClient
    .request(url)
    .then(function(data) {
      if (i === 0) {
        if ('artists' in data.items[0]) {
          trackData.name = data.items[0].name;
        } else {
          trackData.name = data.items[0].track.name;
        }
        trackData.artists = spotify_extract_trackname(data.items[0]);
        trackData.thumbnail = data.items[0].track.album.images[0].url;
      } else {
        var wrong;
        if ('artists' in data.items[0]) {
          wrong = data.items[0].name;
        } else {
          wrong = data.items[0].track.name;
        }
        wrong += " - ";
        var artists = spotify_extract_trackname(data.items[0]);
        for (var j = 0; j < artists.length; j++) {
          if (j == 0) {
            wrong += artists[j];
          } else {
            wrong += ", " + artists[j];
          }
        }
        trackData.wrong.push(wrong);
      }
    })
    .catch(function(err) {
        console.error('spotify_tracks_from_playlist: ' + err);
    });
  }
  let track = trackData.name;
  if (track.includes(" - ")) {
    track = track.split(" - ")[0];
  }
  if (track.includes(" (")) {
    track = track.split(" (")[0];
  }
  var path = 'music/' + track + '.mp3';
  i = 1;
  while (fs.existsSync(path)) {
    path = 'music/' + track + i + '.mp3';
    i++;
  }
  for (var i = 0; i < trackData.artists.length; i++) {
    track += " " + trackData.artists[i];
  }
  var cur = await yts( track + " original audio" );
  //console.log(cur.videos[0]);
  /*ytdl(cur.videos[0].url, {
    format: 'mp3'
  }).pipe(fs.createWriteStream(path));*/
  trackData.path = path;
  deleteFile(path);
  return JSON.stringify(trackData);
}

function deleteFile(url) {
  if (fs.existsSync(path.join(__dirname, url))) { 
    setTimeout(function () {
      fs.unlink(path.join(__dirname, url), (err) => {
        if (err) { 
          console.log(err); 
        } 
      });
      res.json({result: 'success'})
    }, 3600000);
  }
}