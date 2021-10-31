<template>
  <q-page class="flex flex-center" style="background-color: rgb(70, 70, 70);">
    <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    >
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PageIndex'
})

/*
//////////////////////////////////////////
//////////////// SPOTIFY /////////////////
//////////////////////////////////////////
const Spotify = require('node-spotify-api');
const spotifyClient = new Spotify({
    id: SPOTIFY_TOKEN_ID,
    secret: SPOTIFY_TOKEN_SECRET
});

function isSpotify(str) {
    return str.toLowerCase().indexOf('spotify.com') > -1;
}

function spotify_extract_trackname(item) {
    if ('artists' in item) {
        let name = '';
        for (let artist of item.artists) {
            name += ' ' + artist.name;
        }

        let title = item.name;
        let track = title + ' ' + name + ' lyrics';
        return track;
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
    const url = 'https://api.spotify.com/v1/playlists/' + found[1] + '/tracks';
    console.log(url)
    let arr = await spotifyClient
        .request(url)
        .then(function(data) {
            let arr = [];
            if ('items' in data) {
                for (let item of data.items) {
                    let track = spotify_extract_trackname(item)
                    arr.push(track)
                }
            }
            return arr;
        })
        .catch(function(err) {
            console.error('spotify_tracks_from_playlist: ' + err);
        });

    return arr;
}
//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
*/
</script>
