const express = require('express');
// const fetch = require('node-fetch');
// import fetch from 'cross-fetch';
const fetch = require('cross-fetch');

const app = express();

app.listen(3000, () => {
  console.log('Listening at 3000');
});
app.use(express.static('public'));
app.use(express.json({
  limit: '10mb',
}));

// app.post('/api', (request, response) => {
//   console.log('I got a request');
//   // console.log(request.body);
//   const data = request.body;
//   console.log(data);
//   response.json({
//     status: 'success',
//     nameOfTheCity: data.cityName,
//   });
// });

app.get('/wiki/:cityname', async (request, response) => {
  console.log('Request Number 2');
  console.log(request.params);
  // const name = await request.body;
  // console.log(name);
  const cityName = request.params.cityname;
  console.log(cityName);
  // Qui divisione del name se più parole

  // const urlWikipedia = `https://en.wikipedia.org/w/api.php?action=query&prop=info|extracts|pageimages|images&inprop=url&exsentences=1&titles=india`;
  // const urlWikipedia = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=images&titles=${cityName}`;


  const urlWikipedia = `https://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=${cityName}&prop=pageimages&format=json&pithumbsize=800`
  // const urlWikipedia = `https://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=${cityName}&prop=pageimages&format=json`
  const fetchDataWikiImage = await fetch(urlWikipedia);
  let jsonWiki = await fetchDataWikiImage.json();
  console.log(jsonWiki);
  response.json(jsonWiki);
});