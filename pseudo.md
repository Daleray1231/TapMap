# PROJECT PROPOSAL:

# Project Name: TapMap

# Project Description: Search Local Breweries based on city/postal code, filter by bar/brewery type, produce a map with brewery locations

# User Story: I am often travelling to other locations for work, I would like an application to find local bars/breweries and filter them by type

# Wireframe: 
---------------------------------
|   [App Name]                  |
| ----------------------------- |
| [Search Bar(City/Postal Code)]|
| ----------------------------- |
|                               |
|  [Map View with Bar Markers]  |
|                               |
| ----------------------------- |
| [Type Filter]                 |
| ----------------------------- |
|                               |
| [List of Bars]                |
| [Bar Details (Name, Website)] |
|                               |
| ----------------------------- |


# APIS to be used: 
-https://www.openbrewerydb.org/documentation

Get by_city:
<!-- GET https://api.openbrewerydb.org/v1/breweries?by_city=san_diego&per_page=3 --> 

Get by_postal: 
<!-- GET https://api.openbrewerydb.org/v1/breweries?by_postal=44107&per_page=3 -->

-https://developers.google.com/maps/documentation/maps-static/start

# Rough breakdown of tasks
1. HTML (reference Library of Congress Exersize):
search-area "placeholder: city/postal code"

2. CSS: 
Style using Tailwind Play CDN
<script src="https://cdn.tailwindcss.com"></script>

3. Javascript:
-search input will retreive a location and produce a map with breweries/bars in that location
-Filter dropdown, filter the list based on bar types
<!-- GET https://api.openbrewerydb.org/v1/breweries?by_type=micro&per_page=3  -->

<!-- search history in Local Storage (last 5 searches)-->