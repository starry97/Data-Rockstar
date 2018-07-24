$(document).ready(function () {
  $('#updateItem').click(function () {
    console.log('helloooooo')
  });
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
    // Add mark selection event listener to our sheet
    worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, onSelectionChanged);


    console.log('"Extension Initialized. Running in dashboard named ' + dashboard.name);
    console.log('Sheet info: ' + worksheet.name);
  }, function (err) {
    // something went wrong in initialization
    console.log('Error while Initializing: ' + err.toString());
  });

  function resetTable () {
    $('#data_table tr').remove();
    var headerRow = $('<tr/>');
    headerRow.append('<th>Select a project to update</th>');

    $('#data_table').append(headerRow);
  }

  function populateTable (dt) {
    $('#data_table tr').remove();
    var headerRow = $('<tr/>');
    headerRow.append('<th>Product</th>');
    headerRow.append('<th>Stock</th>');
    headerRow.append('<th>Ordered</th>');
    $('#data_table').append(headerRow);

    let productIndex, stockIndex, orderedIndex, rowIDIndex;

    // get our column indexes
    //stock and ordered seem to be flipped for some reason in the datatable (bug?) so reversing them here.
    for (let c of dt.columns) {
      switch (c.fieldName) {
        case 'Product Name':
          productIndex = c.index;
          break;
        case 'SUM(Stock)':
          orderedIndex = c.index;
          break;
        case 'SUM(Ordered)':
          stockIndex = c.index;
          break;
        case 'RowID':
          rowIDIndex = c.index;
        default:
          break;
      }
    }

    // add our rows for the selected marks
    dt.data.forEach(function (item) {
      const rowID = item[rowIDIndex].formattedValue;
      let dataRow = $('<tr/>');
      dataRow.append('<td>' + item[productIndex].formattedValue + '</td>');
      dataRow.append('<td><input type="text" size="8" id="row_' + rowID + '_stock" value="' + item[stockIndex].formattedValue + '" /></td>');
      dataRow.append('<td><input type="text" size="8" id="row_' + rowID + '_ordered" value="' + item[orderedIndex].formattedValue + '" /></td>');
      $('#data_table').append(dataRow);
    });
  }

  $('form').submit(function (event) {
    console.log('clicked');
    event.preventDefault();
    let formInputs = $('form#projectTasks :input[type="text"]');
    let postData = [];

    formInputs.each(function () {
      let c = $(this);
      postData.push({id: c[0].id, 'value': c[0].value});
    });

    // Post it
    $.ajax({
      type: 'POST',
      url: 'http://localhost:8765',
      data: JSON.stringify(postData),
      contentType: 'application/json'
    }).done(
      worksheet.getDataSourcesAsync().then(function (dataSources) {
        dataSources[0].refreshAsync();
      })
    );

    // event.preventDefault();
  });
});

window.onSpotifyWebPlaybackSDKReady = () => {
  // You can now initialize Spotify.Player and use the SDK
  console.log('initialized');
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
    });
  };
  
  play({
    playerInstance: new Spotify.Player({
      name: 'Carly Rae Jepsen Player',
      getOAuthToken: callback => {
        // Run code to get a fresh access token
        // const token = {
        //   "id": "f3167af078984a73a2193bddc4bb30d6", "secret": "d763962d74754a2682aa890599d263b7"
        // };

        callback(token);
      },
      volume: 0.5
    })
    
  });
};