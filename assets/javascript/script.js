// These lines link HTML elements and stores them a variable.
var resultTextEl = document.querySelector('#result-text');
var resultContentEl = document.querySelector('#result-content');
var searchFormEl = document.querySelector('#search-form');

// This function gets info from the URL.
function getParams() {
  var searchParamsArr = document.location.search.split('&');

  if (searchParamsArr[0] && searchParamsArr[1]) {
    var query = searchParamsArr[0].split('=').pop();
    var format = searchParamsArr[1].split('=').pop();
    searchApi(query, format);
  }
}

function printResults(brewery) {
  // Make a new box to put the brewery info in
  var resultCard = document.createElement('div');
  resultCard.classList.add('card', 'bg-light', 'text-dark', 'mb-3', 'p-3');

  // Make another box inside the first one
  var resultBody = document.createElement('div');
  resultBody.classList.add('card-body');
  resultCard.append(resultBody);

  // Show the brewery's name as the title
  var titleEl = document.createElement('h3');
  titleEl.textContent = brewery.name;
  resultBody.append(titleEl);

  // Show the brewery's type
  var typeEl = document.createElement('p');
  typeEl.textContent = 'Type: ' + brewery.brewery_type;
  resultBody.append(typeEl);

  // Add the whole box to the results area on the webpage
  resultContentEl.append(resultCard);
}


async function searchApi(postalCode, type) {
  // Log the parameters for debug purposes
  console.log("Search Params:", { postalCode, type });

  var apiUrl = 'https://api.openbrewerydb.org/breweries';
  apiUrl += '?by_postal=' + postalCode + '&by_type=' + type;
  
  console.log(apiUrl);

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Something went wrong');
    }

    const breweryList = await response.json();
    // Check if the search returned any results
    if (breweryList.length === 0) {
      // Option 1: Show an alert
      alert("No breweries of that type found in that ZIP. Please try a different postal code or type.");

    } else {
      resultContentEl.innerHTML = '';
      for (var i = 0; i < breweryList.length; i++) {
        printResults(breweryList[i]);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

// This function is called when someone presses the "Search" button.
function handleSearchFormSubmit(event) {
  // It makes sure the page doesn't refresh.
  event.preventDefault();

  // It gets the search word and format someone typed into the boxes.
  var searchInputVal = document.querySelector('#search-input').value;
  var formatInputVal = document.querySelector('#format-input').value;

  // If there's no search word, it shows an error.
  if (!searchInputVal) {
    console.error('You need a search input value!');
    return;
  }

  // It does the search using the search word and format.
  searchApi(searchInputVal, formatInputVal);
}

// When someone presses "Search," it calls the function to handle it.
searchFormEl.addEventListener('submit', handleSearchFormSubmit);

// This starts the first function to get info from the web address.
getParams();