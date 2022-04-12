let inputField = document.querySelector('#insertInput');

let UrbanAreasCompleteList = [];

let countryP = 'IT';

// Precaricamento Country se ok localizzazione ------------------ *****
// GEOLOCALIZZAZIONE
if ('geolocation' in navigator) {
  console.log('Geolocation available');
  console.log(navigator.language);
  navigator.geolocation.getCurrentPosition(async (position) => {
    console.log(position.coords);

    // const data = {}
  });
}
// GEOLOCALIZZAZIONE
// Precaricamento Country se ok localizzazione ------------------ *****




async function cityScores(city) {
  // let url = `https://api.teleport.org/api/urban_areas/slug:${city.toLowerCase()}/scores/`;
  const url = `https://api.teleport.org/api/cities/?search=${city}&embed=city%3Asearch-results%2Fcity%3Aitem%2Fcity%3Aurban_area%2Fua%3Ascores`
  const data = await fetch(url);
  const json = await data.json();
  console.log(json);
  // return json;
}

async function getCompleteListUrbanAreas(arr) {
  const url = `https://api.teleport.org/api/urban_areas`;
  let completeDataset = await fetch(url);
  let completeUAList = await completeDataset.json();
  // console.log(completeUAList);

  let completeUAListTotal = completeUAList["_links"]["ua:item"];

  for (let elem of completeUAListTotal) {
    arr.push(elem["name"]);
  }
  return arr;
}

getCompleteListUrbanAreas(UrbanAreasCompleteList);

// Ulteriore filter della lista delle città totali ottenute

async function filterCityList(city, controller) {
  const url = `https://api.teleport.org/api/cities/?search=${city}`;
  const data = await fetch(url);
  const json = await data.json();
  const detailsUrl = await json["_embedded"]["city:search-results"][0]["_links"]["city:item"]["href"];
  const detailsData = await fetch(detailsUrl);
  const detailsJson = await detailsData.json();
  // console.log(detailsJson["_links"]["city:country"]["href"]);
  const href = await detailsJson["_links"]["city:country"]["href"];
  const iso_alpha2 = await (href.split('/')[5]).split(':')[1];

  if (iso_alpha2 == controller) {
    return city;
  } else {
    return;
  }
}

let completeCitiesOfACountryArray = [];

// Parte creazione database stato per stato con default IT -> possibilità cambio stato con aggiornamento 
// database

async function getRegionsList(country) {
  const url = `https://api.teleport.org/api/countries/iso_alpha2%3A${country}/admin1_divisions/`;
  const data = await fetch(url);
  const regionsJson = await data.json();
  for await (let elem of regionsJson["_links"]["a1:items"]) {
    // console.log(elem["href"]);
    const regionsUrlforCities = `${elem["href"]}/cities`;
    const dataByRegion = await fetch(regionsUrlforCities);
    const jsonByRegion = await dataByRegion.json();
    // console.log(jsonByRegion["_links"]);
    for await (let elem of jsonByRegion["_links"]["city:items"]) {
      // console.log(elem);
      completeCitiesOfACountryArray.push(elem["name"]);
    }
  }
  return completeCitiesOfACountryArray;

}


let arr = [];

let secondCityArray = [];


inputField.addEventListener('change', async () => {

  console.log(inputField.value);
  let buttons = [];





  try {

    // Rilevamento città --------

    const url = `https://api.teleport.org/api/cities/?search=${inputField.value}&embed=city:search-results/city:item/city:country&embed=city:search-results/city:item/city:admin1_division&embed=city:search-results/city:item/city:urban_area&embed=ua:item/ua:scores&embed=ua:item/ua:images&embed=city:search-results/city:item/city:timezone/tz:offsets-now`;
    const data = await fetch(url);
    const info = await data.json();
    console.log(info);
    console.log(info["_embedded"]["city:search-results"][0]["_embedded"]["city:item"]["_embedded"]["city:admin1_division"]["geonames_admin1_code"]);

    // Rilevamento città --------

    // Visualizzazione nome città ecc ------------------------------------ ******



    // Visualizzazione nome città ecc ------------------------------------ ******

    // Calcolo Lista città disponibili per Country -------------------------- **

    // Rilevamento Country => diventa CountryP ------------------------------ *
    // Solo se localizzazione non disponibile

    let countryCode = await info["_embedded"]["city:search-results"][0]["_embedded"]["city:item"]["_embedded"]["city:country"]["iso_alpha2"];
    console.log("countryCode iso_alpha2 ==> " + countryCode);

    // Rilevamento Country => diventa CountryP ------------------------------ *

    try {
      // Scores
      const urlScores = await info["_embedded"]["city:search-results"][0]["_embedded"]["city:item"]["_embedded"]["city:urban_area"]["_links"]["ua:scores"]["href"];
      console.log(urlScores);
      const dataScores = await fetch(urlScores);
      const infoScores = await dataScores.json();
      console.log(infoScores);
      console.log(await info["_embedded"]["city:search-results"][0]["_embedded"]["city:item"]["_embedded"]["city:urban_area"]);
      // Visualizzazione dati Scores
      let nameAndState = await info["_embedded"]["city:search-results"][0]["_embedded"]["city:item"]["_embedded"]["city:urban_area"]["full_name"];
      let continent = await info["_embedded"]["city:search-results"][0]["_embedded"]["city:item"]["_embedded"]["city:urban_area"]["continent"];
      console.log(nameAndState);
      let table = document.createElement('table');

      // table.style.fontSize = "20px";

      let header = document.createElement('h2');
      header.textContent = `${await nameAndState}, ${ await continent}`;
      document.querySelector('#resultsContainer').append(header);
      let tbody = document.createElement('tbody');
      for (let elem of infoScores["categories"]) {
        // console.log(elem);
        let tr = document.createElement('tr');
        tbody.append(tr);
        let th = document.createElement('th');
        th.textContent = infoScores["categories"][infoScores["categories"].indexOf(elem)]["name"];
        tr.append(th);
        let td = document.createElement('td');
        td.textContent = `${(infoScores["categories"][infoScores["categories"].indexOf(elem)]["score_out_of_10"]).toFixed(1)} / 10`;
        tr.append(td);
      }
      table.append(tbody);
      document.querySelector('#resultsContainer').append(table);
      console.log(table);
      // Visualizzazione dati Scores
      // Scores


      // Images
      // const urlImages = await info["_embedded"]["city:search-results"][0]["_embedded"]["city:item"]["_embedded"]["city:urban_area"]["_links"]["ua:images"]["href"];
      // console.log(urlImages);
      // const dataImages = await fetch(urlImages);
      // const infoImages = await dataImages.json();
      // console.log(infoImages["photos"]);

      const cityname = await (info["_embedded"]["city:search-results"][0]["_embedded"]["city:item"]["_embedded"]["city:urban_area"]["full_name"]).split(',')[0];

      console.log(cityname.split(','));
      // const data = {
      //   cityName: cityname,
      // };
      // console.log(data);
      // const options = {
      //   method: 'POST',
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify(data),
      // }
      // const response = await fetch('/api', options);
      // const responseData = await response.json();
      // console.log(responseData);

      const wikiUrl = `wiki/${cityname}`;
      // const wikiUrl = `/wiki`;
      const wikiResponse = await fetch(wikiUrl);
      const wikiJson = await wikiResponse.json();
      console.log((wikiJson["query"]["pages"])[Object.keys(wikiJson["query"]["pages"])]["thumbnail"]["source"]);
      // const objWiki = wikiJson["query"]["pages"];
      // console.log(objWiki[Object.keys(objWiki)[0]]["images"][0]["title"]);
      // const titleWikiPhoto = objWiki[Object.keys(objWiki)[0]]["images"][3]["title"];
      // console.log("https://en.wikipedia.org/wiki/" + titleWikiPhoto);
      // const title = titleWikiPhoto.split(' ').join('_')
      // console.log(title);
      // console.log(`https://en.wikipedia.org/wiki/${title}`);

      // Visualizzazione Images
      let image = document.createElement('img');
      image.setAttribute('id', 'imgCity');
      // image.src = await infoImages["photos"][0]["image"]["mobile"];
      let blobUrl = await fetch((wikiJson["query"]["pages"])[Object.keys(wikiJson["query"]["pages"])]["thumbnail"]["source"]);
      let blob = await blobUrl.blob();
      console.log(blob);
      // let imageFile = new File(blob, 'public/cityImage');
      // console.log(imageFile);


      image.src = await (wikiJson["query"]["pages"])[Object.keys(wikiJson["query"]["pages"])]["thumbnail"]["source"];
      image.style.width = "600px";
      image.style.height = "100%";
      image.style.position = "relative";
      image.style.left = "-50%";
      document.querySelector('#imgContainer').append(image);
      console.log(image);
      // Visualizzazione Images






      // Images


    } catch (err) {
      // console.log('extArray: ' + buttons);

      let data = await getRegionsList(countryCode);
      let firstCityArray = [];
      // console.log(data);
      for (let elem of UrbanAreasCompleteList) {
        // console.log(elem);
        for (let city of data) {
          if (city === elem) {
            firstCityArray.push(elem);
          }
        }
      }
      // console.log(firstCityArray);
      for (let elem of firstCityArray) {
        let result = await filterCityList(elem, countryCode);
        if (elem && !secondCityArray.includes(elem)) {
          secondCityArray.push(result);
        }
      }
      // console.log(secondCityArray);

      secondCityArray = secondCityArray.filter((elem) => {
        return elem !== undefined;
      });

      // console.log(secondCityArray);

      // Creazione e visualizzazione Buttons città disponibili da variabile esterna ----- #
      buttons = [...secondCityArray];
      for (let i = 0; i < secondCityArray.length; i++) {
        let btn = document.createElement('button');
        btn.textContent = secondCityArray[i];
        // btn.classList.add('invibleButtons');
        document.querySelector('#resultsContainer').append(btn);

      }
      // Creazione e visualizzazione Buttons città disponibili da variabile esterna ----- #


      // Calcolo Lista città disponibili per Country -------------------------- **



      // console.log(err);
      // Caricamento e visualizzazione su sfondo immagine da Wikipedia ------------ ***

      // Testing Wikipedia API
      // const urlWiki = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${inputField.value}`;
      // const dataWiki = await fetch(urlWiki, {
      //   method: 'GET',
      //   mode: 'cors',
      //   credentials: 'include',
      //   referrer: "http://127.0.0.1:8080/",
      //   referrerPolicy: "unsafe-url",
      //   headers: {
      //     'Content-Type': 'application/json'
      //     // 'Content-Type': 'application/x-www-form-urlencoded',
      //   },
      //   referrerPolicy: 'no-referrer',
      // });
      // const infoWiki = await dataWiki.json();
      // // console.log(infoWiki);
      // // loadJSON(urlWiki, gotData, 'jsonp');

      // function gotData(dataPHP) {
      //   console.log(dataPHP);
      // }
      // Testing Wikipedia API



      // Caricamento e visualizzazione su sfondo immagine da Wikipedia ------------ ***

      // Creazione e visualizzazione Buttons città disponibili da variabile esterna ----- #



      // Creazione e visualizzazione Buttons città disponibili da variabile esterna ----- #

      // Click Buttons Città - Svuotamento lista -> inputField.textContent = nome button

      // Click Buttons Città - Svuotamento lista -> inputField.textContent = nome button

    }
  } catch (error) {
    console.log(error);


    // Gestione Città Inesistente - Nome della città non trovato
  }





  // ---- Det Complete List **

});