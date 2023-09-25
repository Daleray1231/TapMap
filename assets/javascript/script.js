// Selecting elements from the DOM
const resultContentEl = document.querySelector(".brewery_list ul"); // Selects the result content element
const searchFormEl = document.querySelector("#search-form"); // Selects the search form element
const errorMessage = document.createElement("h4"); // Creates an error message element
const maxSavedSearches = 5; // Maximum number of saved searches
const lastSearches = []; // Array to store the last searches
let markers = []; // Array to store map markers

// Creating a Leaflet map
const map = L.map("mapid").setView([37.8, -96.9], 4); // Creates a Leaflet map with initial coordinates and zoom level
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map); // Adds a tile layer to the map using OpenStreetMap tiles

// Creating a custom icon for the map markers
const beerIcon = L.icon({
  iconUrl: "https://img.icons8.com/stickers/100/beer.png", // URL to the beer icon image
  iconSize: [54, 54], // Icon size
});

// Function to scroll to the search history section smoothly
function scrollToSearchHistory() {
  const searchHistorySection = document.querySelector(".search-history");
  const heroBody = searchHistorySection?.closest(".hero-body");
  if (heroBody) {
    heroBody.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Function to clear map markers
function clearMarkers() {
  markers.forEach((marker) => marker.remove()); // Removes all map markers
  markers = []; // Clears the markers array
}

// Function to create a card for a brewery
function createCard(brewery) {
  const cardId = `brewery-${brewery.name.replace(/\s+/g, "-").toLowerCase()}`;
  const card = document.createElement("li"); // Creates a list item for the brewery

  // Configuring the card element
  card.className = "card bg-light text-dark mb-3 p-3";
  card.setAttribute("data-aos", "flip-down");
  card.id = cardId;

  // Helper function to create a paragraph element with text or a default value
  function createParagraph(text, defaultValue) {
    const p = document.createElement("p");
    p.textContent = text || defaultValue;
    return p;
  }

  const cardBody = document.createElement("div");
  cardBody.className = "card-body"; // Creates the card body

  const title = document.createElement("h3");
  title.textContent = brewery.name; // Sets the brewery name as the card title

  const street = createParagraph(brewery.street, "Street info not available");
  const cityState = createParagraph(
    `${brewery.city || "City not available"}, ${brewery.state || "State not available"}`
  );

  const type = createParagraph(`Type: ${brewery.brewery_type}`);

  // If latitude and longitude are available, create a map marker and bind a popup
  if (brewery.latitude && brewery.longitude) {
    const marker = L.marker([brewery.latitude, brewery.longitude], {
      icon: beerIcon,
    }).addTo(map).bindPopup(
      `<a href="#${cardId}"><b>${brewery.name}</b></a><br>Type: ${brewery.brewery_type}`
    );
    markers.push(marker);

    marker.on("click", () => marker.openPopup());
  }

  // Adding elements to the card body
  cardBody.append(title, type, street, cityState);

  // If a website URL is available, create a link to the website
  if (brewery.website_url) {
    const website = document.createElement("a");
    website.href = brewery.website_url;
    website.textContent = "Visit Website";
    website.target = "_blank";
    website.style.color = "blue";
    cardBody.append(website);
  }

  card.append(cardBody); // Appends the card body to the card
  resultContentEl.append(card); // Appends the card to the result content element
}

// Function to display the last searched queries
function displayLastSearches() {
  const lastSearchContainer = document.querySelector(".search-history");
  lastSearchContainer.innerHTML = "";

  // Get unique search queries and store them in local storage
  const uniqueSearches = [...new Set(lastSearches)];
  localStorage.setItem("recentSearches", JSON.stringify(uniqueSearches.slice(-maxSavedSearches)));

  // Display unique search queries in the search history container
  for (const search of uniqueSearches.slice(-maxSavedSearches)) {
    const searchItem = document.createElement("div");
    searchItem.textContent = search || "";
    lastSearchContainer.appendChild(searchItem);
  }
}


// Function to clear the result content
function clearResultContent() {
  resultContentEl.innerHTML = "";
}


async function searchApi(query, type, queryType, searchInputVal) {
  clearResultContent(); // Clear brewery result cards
  clearMarkers(); // Clear map results
  clearErrorMessage(); // Clear any previous error messages

  // Define the base URL for the OpenBreweryDB API.
const baseUrl = "https://api.openbrewerydb.org/breweries";

// Determine the query parameter based on the queryType (postalCode or city).
const queryParam = queryType === "postalCode" ? "by_postal" : "by_city";

// Construct the complete API URL with query parameters, including type.
const apiUrl = `${baseUrl}?${queryParam}=${query}&by_type=${type}`;

try {
  // Try to fetch data from the API using the constructed URL.
  const response = await fetch(apiUrl);

  // Check if the response is not okay (e.g., status code other than 200).
  if (!response.ok) {
    // Display an error message and exit the function.
    displayErrorMessage("Something went wrong. Please try again.");
    return;
  }

    // Parse the response data as JSON.
  const breweryList = await response.json();

    // Check if the brewery list is empty.
  if (!breweryList.length) {
    // Display a message for no results and exit the function.
    displayErrorMessage(
      "No breweries found. Try searching for a different type of brewery or a different ZIP or city"
    );
    return;
  } else {
    // Scroll to the search history section.
    scrollToSearchHistory();

    // Create cards for each brewery in the list.
    breweryList.forEach(createCard);

    // Add the current search to the recent searches list.
    addSearchToRecent(searchInputVal);

    // Fit the map to display markers for the breweries.
    fitMapToMarkers();
  }
} catch (error) {
  // Handle any errors that occur during the try block.
  displayErrorMessage("Something went wrong. Please try again.");
  console.error(error);
}
}

function displayErrorMessage(message) {
  errorMessage.textContent = message;
  errorMessage.style.color = "darkred";
  searchFormEl.after(errorMessage);
}

// This function clears any displayed error message on the page, if it exists.
function clearErrorMessage() {
  if (errorMessage.parentNode) {
    errorMessage.remove();
  }
}

// This function adjusts the map's view to fit all the markers in the 'markers' array.
function fitMapToMarkers() {
  const group = new L.featureGroup(markers);
  map.fitBounds(group.getBounds());
}

// This asynchronous function handles the submission of the search form.
async function handleSearchFormSubmit(event) {
  event.preventDefault();

  // Get values from the search form inputs
  const searchInputBox = document.querySelector("#search-input");
  const searchInputVal = searchInputBox.value;
  const formatInputVal = document.querySelector("#format-input").value;

  // Check if a search input value is provided, display an error if not.
  if (!searchInputVal) {
    displayErrorMessage("You need a search input value!");
    return;
  }

  // Add an event listener to display recent searches when the page loads.
  window.addEventListener("load", displayRecentSearches);
  displayRecentSearches(); // Initialize the display and the lastSearches array when the page loads


  // Pass searchInputVal as a parameter to the searchApi function.
  searchApi(
    searchInputVal,
    formatInputVal,
    isPostalCode(searchInputVal) ? "postalCode" : "city",
    searchInputVal
  );
}

// This function adds the latest search query to the list of recent searches.
function addSearchToRecent(query) {
  lastSearches.push(query);

  // Ensure that the list of recent searches doesn't exceed a maximum limit.
  if (lastSearches.length > maxSavedSearches) {
    lastSearches.shift();
  }

  // Display the updated list of recent searches.
  displayLastSearches();
}

// This function displays an error message on the page with a given message.
function displayErrorMessage(message) {
  errorMessage.textContent = message;
  errorMessage.style.color = "darkred";
  searchFormEl.after(errorMessage);
}

// This function clears the result content on the page.
function clearResultContent() {
  resultContentEl.innerHTML = "";
}

// Add an event listener to display recent searches when the page loads.
window.addEventListener("load", displayRecentSearches);

// Add an event listener to the search form for form submission.
searchFormEl.addEventListener("submit", handleSearchFormSubmit);

// This function displays a list of recent searches retrieved from localStorage.
function displayRecentSearches() {
  const recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
  lastSearches.length = 0;
  lastSearches.push(...recentSearches); // Initialize the lastSearches array with data from local storage

  const lastSearchContainer = document.querySelector(".search-history");
  lastSearchContainer.innerHTML = "";

  for (const search of recentSearches) {
    const searchItem = document.createElement("div");
    searchItem.textContent = search; // Access the 'query' property
    searchItem.classList.add("search-item");
    lastSearchContainer.appendChild(searchItem);
  }
  
}

// This function checks if a given query is a postal code (consists of digits).
function isPostalCode(query) {
  return /^\d+$/.test(query);
}
