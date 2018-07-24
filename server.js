// Setup basic express server
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var XLSX = require('xlsx');
var server = require('http').createServer(app);
var path = require('path');
var port = process.env.PORT || 8765;

const workbookFile = 'Product Inventory.xlsx';
const wsName = 'Product Inventory';

/**************************************************/
// Start the Server
/**************************************************/
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

/**************************************************/
// Routing
/**************************************************/
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, 'public')));

app.post('/', function (req, res) {
  // updateWorkbook(req.body);

  res.send('Thanks for the data.');
});

app.get('/columns', function (req, res) {
  console.log('getting columns...');
  res.send(getColumns());
});

function updateWorkbook (data) {
  // We have a single sheet in our Excel file:  "Product Inventory"
  //   the data is in cells A1:E45 (the header row is A1:F1, actual tasks are A2:E45)
  //   Due Date is in Column D
  //   Completion Date is in Column E
  //   RowID is in Column A (won't be updated)
  //   Product Name is Column B (won't be updated)
  //   Sales is Column C (Won't be updated)
  //   Stock is Column D
  //   Ordered is Column E
  console.log('Updating our spreadsheet with the following incoming data: ' + JSON.stringify(data));
  // Open our Excel file & see how many rows there are
  let workbook = XLSX.readFile(workbookFile);
  let ws = workbook.Sheets[wsName];
  let rows = XLSX.utils.sheet_to_json(ws).length;

  // Iterate through all the data items we need to update
  for (let d = 0; d < data.length; d++) {
    let rowToUpdate = data[d].id.replace('row_', '').split('_')[0];
    let fieldToUpdate = data[d].id.replace('row_', '').split('_')[1];
    let newValue = data[d].value;
    console.log('row,field,value: ' + rowToUpdate + '|' + fieldToUpdate + '|' + newValue);

    for (let r = 0; r < rows; r++) {
      let cellAddress = { c: 0, r: 1 + r };          // Offset from F1 (the header cell) and is 0 indexed
      let cellRef = XLSX.utils.encode_cell(cellAddress);
      let activeCell = ws[cellRef];

      // We've found the row in our Excel file with matching rowID
      // Let's update the cell in this row for the corresponding field/column
      if (activeCell.v === parseInt(rowToUpdate)) {
        let targetAddress;
        let targetCellRef;
        let targetCell;

        switch (fieldToUpdate) {
          case 'stock':
            targetAddress = { c: 3, r: 1 + r };
            break;

          case 'ordered':
            targetAddress = { c: 4, r: 1 + r };
            break;

          default:
            break;
        }

        targetCellRef = XLSX.utils.encode_cell(targetAddress);
        targetCell = ws[targetCellRef];

        targetCell.v = newValue;
      }
    }
  }

  XLSX.writeFile(workbook, workbookFile);
//   XLSX.writeFile(workbook, workbookFile, { cellDates: true });
  console.log('Just saved our Excel file data!');
}

function getColumns () {
  // Open our Excel file & see how many rows there are
  let workbook = XLSX.readFile(workbookFile);
  let ws = workbook.Sheets[wsName];
  let jsonWS = XLSX.utils.sheet_to_json(ws);
  let retArr = [];

  if (jsonWS && jsonWS.length > 0) {
    // get the first object and extract the column info
    for (let c in jsonWS[0]) {
      retArr.push(c);   
    }
  }

  if (retArr.length > 0) {
    console.log(retArr);
    return retArr;
  } else {
    return 'No column information found!';
  }
}
