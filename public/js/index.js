let player;

$(document).ready(function () {
  let worksheet;
  const wsName = 'song_data';    // This is the sheet we'll use for updating task info

  function onSelectionChanged (marksEvent) { 
    const sheetName = marksEvent.worksheet.name;
    marksEvent.getMarksAsync().then(function (selectedMarks) {
      handleSelectedMarks(selectedMarks, sheetName, true);
    });
  }

  function handleSelectedMarks (selectedMarks, sheetName, forceChangeSheet) {
    const songId = selectedMarks['data'][0]['data'][0][2]['_value'];
    document.getElementById('song-id').innerHTML = songId;
    // If we've got selected marks then process them and show our update button
    if (selectedMarks.data[1].totalRowCount > 0) {
      populateTable(selectedMarks.data[1]);
      $('#updateItem').show();
    } else {
      resetTable();
      $('#updateItem').hide();
    }
  }

  tableau.extensions.initializeAsync().then(function () {
    // Initialization succeeded! Get the dashboard's name & log to console
    let dashboard;
    dashboard = tableau.extensions.dashboardContent.dashboard;

    for (const ws of dashboard.worksheets) {
      if (ws.name === wsName) {
        worksheet = ws;
      }
    }

    console.log('"Extension Initialized. Running in dashboard named ' + dashboard.name);
    console.log('Sheet info: ' + worksheet.name);
  }, function (err) {
    // something went wrong in initialization
    console.log('Error while Initializing: ' + err.toString());
  });

  $('#updateItem').click(function () {
    console.log('click')
    play({
      playerInstance: player,
      spotify_uri: 'spotify:track:5CtI0qwDJkDQGwXD1H1cL'
    });
  });
});

const play = ({
  spotify_uri,
  playerInstance: {
      _options: {
          getOAuthToken,
          id
      }
  }
}) => {
  getOAuthToken(access_token => {
      fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
          method: 'PUT',
          body: JSON.stringify({ uris: [spotify_uri] }),
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${access_token}`
          },
      });
      console.log(`https://api.spotify.com/v1/me/player/play?device_id=${id}`);
  });
};


window.onSpotifyWebPlaybackSDKReady = () => {
  // You can now initialize Spotify.Player and use the SDK
  const token = 'BQC9hyAcUE2zVrIL1-KX_ofClTy9ElNJl4l-EsYo_B28w9RC8boyifTva5ppv6voF_gWB3s7PSLkOyADv4BXgn5EGaSvoF_Ce2PoNZu8SHOURZeo-HMuPnDCuTuKGoYJXzJuKwO4a587t5uklLS85wCN1GEbjjEqHg8';
  player = new Spotify.Player({
    name: 'Web Playback SDK Quick Start Player',
    getOAuthToken: cb => { cb(token); }
  });

  console.log('new');
  // Error handling
  player.addListener('initialization_error', ({ message }) => { console.error(message); });
  player.addListener('authentication_error', ({ message }) => { console.error(message); });
  player.addListener('account_error', ({ message }) => { console.error(message); });
  player.addListener('playback_error', ({ message }) => { console.error(message); });

  // Playback status updates
  player.addListener('player_state_changed', state => { console.log(state); });

  // Ready
  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
  });

  // Not Ready
  player.addListener('not_ready', ({ device_id }) => {
    console.log('Device ID has gone offline', device_id);
  });

  // Connect to the player!
  player.connect();
};