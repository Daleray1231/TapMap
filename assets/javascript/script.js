// Selecting HTML elements
const resultContentEl = document.querySelector('.brewery_list ul');
const searchFormEl = document.querySelector('#search-form');

// Initialize the map
const map = L.map('mapid').setView([37.8, -96.9], 4); // Initialize centered on the US

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

// Define the custom beer icon image
const beerIcon = L.icon({
  iconUrl: 'assets/images/beermug2.png', // Replace with the actual URL or file path to your beer icon image
  iconSize: [54, 54], // Set the size of the icon
});

// Create a card element for a brewery
function createCard(brewery) {
  const card = document.createElement('div');
  card.className = 'card bg-light text-dark mb-3 p-3';

  const cardBody = document.createElement('div');
  cardBody.className = 'card-body';

  const title = document.createElement('h3');
  title.textContent = brewery.name;

  const street = document.createElement('p');
  street.textContent = brewery.street || "Street info not available";

  const cityState = document.createElement('p');
  cityState.textContent = `${brewery.city || "City not available"}, ${brewery.state || "State not available"}`;

  const type = document.createElement('p');
  type.textContent = `Type: ${brewery.brewery_type}`;

  // to put a marker on the map for each brewery
  if (brewery.latitude && brewery.longitude) {
    L.marker([brewery.latitude, brewery.longitude], { icon: beerIcon }).addTo(map)
      .bindPopup(`<b>${brewery.name}</b><br>Type: ${brewery.brewery_type}`)
      .openPopup();
  }

  cardBody.append(title, type, street, cityState);
  card.append(cardBody);

  if (brewery.website_url) {
    const website = document.createElement('a'); // create an anchor element
    website.href = brewery.website_url; // set the href attribute
    website.textContent = 'Visit Website'; // set the link text
    website.target = '_blank'; // open in new tab
    cardBody.append(website); // append the website link to card body
  }

  resultContentEl.append(card);
}

// Fetch brewery data based on search parameters
async function searchApi(query, type, queryType) {
  const baseUrl = 'https://api.openbrewerydb.org/breweries';
  const queryParam = queryType === 'postalCode' ? 'by_postal' : 'by_city';
  const apiUrl = `${baseUrl}?${queryParam}=${query}&by_type=${type}`;
  
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Something went wrong');

    const breweryList = await response.json();

    // Center the map to the first brewery's location
    if (breweryList.length > 0 && breweryList[0].latitude && breweryList[0].longitude) {
      map.setView([breweryList[0].latitude, breweryList[0].longitude], 10);
    }

    if (!breweryList.length) {
      alert('No breweries found.  Try searching for a different type of brewery or a different ZIP or city');
    } else {
      resultContentEl.innerHTML = '';
      breweryList.forEach(createCard);
    }
  } catch (error) {
    console.error(error);
  }
}

// Handle the search form submission
function handleSearchFormSubmit(event) {
  event.preventDefault();

  const searchInputVal = document.querySelector('#search-input').value;
  const formatInputVal = document.querySelector('#format-input').value;

  if (!searchInputVal) {
    console.error('You need a search input value!');
    return;
  }

  const isPostalCode = /^\d+$/.test(searchInputVal); 
  const queryType = isPostalCode ? 'postalCode' : 'city';

  searchApi(searchInputVal, formatInputVal, queryType);
}

searchFormEl.addEventListener('submit', handleSearchFormSubmit);
