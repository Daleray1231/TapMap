// Selecting HTML elements
const resultContentEl = document.querySelector('.brewery_list ul');
const searchFormEl = document.querySelector('#search-form');
const lastSearches = [];
const maxSavedSearches = 5; //Maximum number of saved searches
const errorMessage = document.createElement("h4");

// Initialize the map
const map = L.map("mapid").setView([37.8, -96.9], 4); // Initialize centered on the US

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

// Define the custom beer icon image
const beerIcon = L.icon({
  iconUrl: 'https://img.icons8.com/stickers/100/beer.png', // Replace with the actual URL or file path to your beer icon image
  iconSize: [54, 54], // Set the size of the icon
});

// Define a variable to keep track of markers
let markers = [];

// Function to clear all markers from the map
function clearMarkers() {
  markers.forEach(marker => marker.remove());
  markers = [];
}

// Create a card element for a brewery
function createCard(brewery) {
  // Create an ID based on the brewery name
  const cardId = `brewery-${brewery.name.replace(/\s+/g, "-").toLowerCase()}`;

  const card = document.createElement("li");
  card.className = "card bg-light text-dark mb-3 p-3";
  card.setAttribute('data-aos', 'flip-down'); 
  card.id = cardId; // Set the card's ID

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const title = document.createElement("h3");
  title.textContent = brewery.name;

  const street = document.createElement("p");
  street.textContent = brewery.street || "Street info not available";

  const cityState = document.createElement("p");
  cityState.textContent = `${brewery.city || "City not available"}, ${brewery.state || "State not available"
    }`;

  const type = document.createElement("p");
  type.textContent = `Type: ${brewery.brewery_type}`;


  // to put a marker on the map for each brewery
  if (brewery.latitude && brewery.longitude) {
    const marker = L.marker([brewery.latitude, brewery.longitude], { icon: beerIcon }).addTo(map)
      .bindPopup(`<a href="#${cardId}"><b>${brewery.name}</b></a><br>Type: ${brewery.brewery_type}`);
    markers.push(marker); // Add the marker to the markers array

    // Add a click event listener to open the popup when the marker is clicked
    marker.on('click', function () {
      this.openPopup();
    });
  }

  cardBody.append(title, type, street, cityState);
  card.append(cardBody);

  if (brewery.website_url) {
    const website = document.createElement("a"); // create an anchor element
    website.href = brewery.website_url; // set the href attribute
    website.textContent = "Visit Website"; // set the link text
    website.target = "_blank"; // open in new tab
    cardBody.append(website); // append the website link to card body
  }

  resultContentEl.append(card);
}

// Function to display the last 5 searches
function displayLastSearches() {
  const lastSearchContainer = document.querySelector('.search-history');
  lastSearchContainer.innerHTML = '';

  const uniqueSearches = Array.from(new Set(lastSearches.map(function(search){
    return search.query;
  }))); // Remove duplicates
  const recentSearches = uniqueSearches.slice(-maxSavedSearches);


  localStorage.setItem('recentSearches', JSON.stringify(recentSearches));

  for (let i = Math.max(0, uniqueSearches.length - maxSavedSearches); i < uniqueSearches.length; i++) {
    const search = uniqueSearches[i];

    if (search !== undefined){
    const searchItem = document.createElement('div');
    searchItem.textContent = `${search}`;
    lastSearchContainer.appendChild(searchItem);
  }
  }
}

function fitMapToMarkers() {
  const group = new L.featureGroup(markers);
  map.fitBounds(group.getBounds());
}

// Fetch brewery data based on search parameters
async function searchApi(query, type, queryType) {
  clearMarkers();
  const baseUrl = "https://api.openbrewerydb.org/breweries";
  const queryParam = queryType === "postalCode" ? "by_postal" : "by_city";
  const apiUrl = `${baseUrl}?${queryParam}=${query}&by_type=${type}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Something went wrong");

    const breweryList = await response.json();

      // Save the last search
      lastSearches.push(query);

      // Display the last 5 searches
      displayLastSearches();

       // Add markers to the map
    breweryList.forEach(createCard);
    
    // Fit the map to show all markers
    fitMapToMarkers();
    
    // Center the map to the first brewery's location
    // if (
    //   breweryList.length > 0 &&
    //   breweryList[0].latitude &&
    //   breweryList[0].longitude
    // ) {
    //   map.setView([breweryList[0].latitude, breweryList[0].longitude], 12);
    // }

    // Error handling, invalid search
    if (!breweryList.length) {
      errorMessage.textContent =
        "No breweries found. Try searching for a different type of brewery or a different ZIP or city";
      errorMessage.style.color = "darkred";
      searchFormEl.after(errorMessage);
    } else {
      resultContentEl.innerHTML = "";
      breweryList.forEach(createCard);
    }
  } catch (error) {
    console.error(error);
  }
}

// Handle the search form submission
function handleSearchFormSubmit(event) {
  event.preventDefault();

  const searchInputBox = document.querySelector("#search-input");
  const searchInputVal = searchInputBox.value;
  const formatInputVal = document.querySelector("#format-input").value;

  if (!searchInputVal) {
    errorMessage.textContent = "You need a search input value!";
    errorMessage.style.color = "darkred";
    searchFormEl.after(errorMessage);
    // console.error("You need a search input value!");
    return;
  }

    // save the search input (city or zip code)
    
    lastSearches.push({query: searchInputVal});

    // Keep only the last 5 searches
    if (lastSearches.length > maxSavedSearches){
      lastSearches.shift();
    }

    //Display the last 5 searches
    displayLastSearches();
  


  if (searchInputVal) {
    searchInputBox.onfocus = function () {
      this.value = "";
      errorMessage.remove()
    };

  }

  // Check if the same search query already exists
  let existingQuery = lastSearches.find(function(query){
    return query.query === searchInputVal;
  });
  if (!existingQuery) {
    lastSearches.push({query: searchInputVal});
    if (lastSearches.length > maxSavedSearches){
      lastSearches.shift();
    }
    displayLastSearches();
  }


  const isPostalCode = /^\d+$/.test(searchInputVal);
  const queryType = isPostalCode ? "postalCode" : "city";

  searchApi(searchInputVal, formatInputVal, queryType);
}

// Load and display recent searches from local storage
window.addEventListener('load', function(){
  displayRecentSearches();
});

function displayRecentSearches() {
  const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
  const lastSearchContainer = document.querySelector('.search-history');
  lastSearchContainer.innerHTML = '';

  // Determine how many searches to display (maximum 5)
  const numberToShow = Math.min(recentSearches.length, 5);

  // Show the last 5 searches or all if there are fewer than 5
  for (let i = recentSearches.length - numberToShow; i < recentSearches.length; i++){
    const search = recentSearches[i];
    const searchItem = document.createElement('div');
    searchItem.textContent = search;
    searchItem.classList.add('search-item');
  }

  for (const search of recentSearches) {
    const searchItem = document.createElement('div');
    searchItem.textContent = search;
    lastSearchContainer.appendChild(searchItem);
  }
}

searchFormEl.addEventListener("submit", handleSearchFormSubmit);
