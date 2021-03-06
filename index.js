const express = require('express');
const fs = require('fs');
const fetch = require('cross-fetch');
const {
  default: axios
} = require('axios');


const Datastore = require('nedb');

const cannyEdgeDetector = require('canny-edge-detector');

const ImageCanny = require('image-js').Image;

const app = express();
const port = 3000;

const database = new Datastore('citiesDatabase.db');
database.loadDatabase();

app.listen(port, () => {
  console.log(`Listening at ${port}`);
});

app.use(express.static('public'));
app.use(express.json({
  limit: '10mb',
}));


app.get('/wiki/:cityname', async (request, response) => {
  const cityName = request.params.cityname;

  let fileUrl;

  try {
    const Pixabay_Api_Key = `14002767-fc7a727782d5b5a6b70bdeb00`;
    const urlPixabay = `https://pixabay.com/api/?key=${Pixabay_Api_Key}&q=${cityName}&category=places&image_type=photo`;
    const dataPixabay = await axios.get(urlPixabay);
    const jsonPixabay = await dataPixabay["data"];
    // const jsonPixabay = await dataPixabay.json();
    // console.log(dataPixabay);
    fileUrl = await jsonPixabay["hits"][0]["largeImageURL"];
    // console.log(fileUrl);
    response.json(jsonPixabay);

    // axios.get(urlPixabay).then((response) => {
    //   console.log(response);
    // })
    // axios({
    //   method: 'get',
    //   url: urlPixabay,
    //   responseType: 'stream'
    // }).then((response)=>{
    //   console.log
    // })


  } catch {

    const urlTeleport = `https://api.teleport.org/api/urban_areas/slug:${(cityName).toLowerCase()}/images/`;
    // console.log(urlTeleport);
    // const dataTeleport = await fetch(urlTeleport);
    const dataTeleport = await axios.get(urlTeleport);
    // console.log(dataTeleport);
    const jsonTeleport = await dataTeleport["data"];
    // console.log(jsonTeleport);
    fileUrl = await jsonTeleport["photos"][0]["image"]["web"];
    // console.log('Got Teleport');
    response.json(jsonTeleport);
  }


  downloadAndCannyEdge(fileUrl);

})


app.post('/queryDb', (request, response) => {
  const data = request.body;
  database.find({
    name: data.name
  }, function (error, docs) {
    if (error) {
      response.end();
      return;
    } else if (docs.length == 0) {
      // console.log('Not in database, saving...');
      response.json({
        status: 'success',
        action: 'Not in database',
        name: data.name,
      });
    } else {
      // console.log('HERE read from database');
      response.json({
        status: 'success',
        action: 'read from db',
        name: data.name,
        title: docs[0]["title"],
        data: docs[0]["data"]
      });
    }
  });
});


app.post('/saveDb', (request, response) => {
  // console.log('Saving...');
  const saveData = request.body;
  // console.log(saveData);
  database.insert(saveData);
  response.json({
    status: 'success',
    action: 'saved on database',
    name: saveData.name,
  });

});

// Sperimentale
app.get('/menu', (request, response) => {
  // console.log('reading all saving cities...');
  database.find({}, (err, docs) => {
    response.json({
      status: 'success',
      action: 'reading from db',
      data: docs
    })
  })
})
// Sperimentale

// Sperimentale cancel from db
app.post('/cancelDb', (request, response) => {
  // console.log(request.body);
  const cancelCity = request.body.name;
  // console.log(cancelCity);
  // console.log('cancel request...');
  database.remove({
    name: cancelCity
  }, (err, docs) => {
    response.json({
      status: 'success',
      action: 'cancel from db',
      data: docs
    })
  })
  // database.cancel({
  //   name:
  // }, (err, docs) => {

  // })
})
// Sperimentale

// let number = 0;

async function downloadAndCannyEdge(url) {

  if (fs.existsSync('public/tempImage/image.png')) {
    fs.unlink('public/tempImage/image.png', (error) => {
      if (error) {
        throw error;
      }
      // console.log('Wikipedia File canceled.');
    });
  }
  if (fs.existsSync('public/cannyimage/edge.png')) {
    fs.unlink('public/cannyimage/edge.png', (error) => {
      if (error) {
        throw error;
      }
      // console.log('Canny Edge File canceled.');
    });
  }

  const response = await fetch(url);
  const buffer = await response.buffer();
  let writeFile = fs.writeFile(`public/tempImage/image.png`, await buffer, async () => {
    const img = await ImageCanny.load(`public/tempImage/image.png`);
    const grey = await img.grey();
    const options = {
      lowThreshold: 120,
      highThreshold: 130,
      gaussianBlur: 0.6, //ultima mod - 0.7 o 0.5 test
      brightness: 1.1
    };
    const edge = await cannyEdgeDetector(grey, options);
    return edge.save('public/cannyImage/edge.png');
  });
  // number++;
  // console.log('finished downloading!');
  return writeFile;
}