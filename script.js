// Add event listener to execute `updateTask()` function when the document is loaded
document.addEventListener("load", () => {
  updateTask();
});

// Get references to DOM elements
const toggleButton = document.getElementById("toggle-sidebar");
const sidebar = document.getElementById("sidebar");
const flexBox = document.getElementById("flex-box");
const searchbar = document.getElementById("search-bar");

// Check if the favorites list exists in local storage, if not, initialize it with an empty array
const dbObjectFavList = "favouritesList";
if (localStorage.getItem(dbObjectFavList) === null) {
  localStorage.setItem(dbObjectFavList, JSON.stringify([]));
}

// Update the favorite counter by retrieving the list of favorite items from local storage
function updateTask() {
  const favCounter = document.getElementById("total-counter");
  const db = JSON.parse(localStorage.getItem(dbObjectFavList)) || [];
  favCounter.innerText = db.length;
}

// Check if an item is in the list of favorites
function isFav(list, id) {
  return list.includes(id);
}

// Truncate a string to a specified length and add an ellipsis if it exceeds that length
function truncate(str, n) {
  return str?.length > n ? str.substr(0, n - 1) + "..." : str;
}

// Generate a random one-character string from the alphabet
function generateOneCharString() {
  var possible = "abcdefghijklmnopqrstuvwxyz";
  return possible.charAt(Math.floor(Math.random() * possible.length));
}

// Add event listener to the toggle button to toggle the visibility of the sidebar and flex box
toggleButton.addEventListener("click", function () {
  showFavMealList();
  sidebar.classList.toggle("show");
  flexBox.classList.toggle("shrink");
});

// Add scroll event listener to flex box to add/remove fixed class to search bar based on scroll position
flexBox.onscroll = function () {
  if (flexBox.scrollTop > searchbar.offsetTop) {
      searchbar.classList.add("fixed");
  } else {
      searchbar.classList.remove("fixed");
  }
};

// Asynchronous function to fetch meals from an API
const fetchMealsFromApi = async (url, value) => {
  const response = await fetch(`${url + value}`);
  const meals = await response.json();
  return meals;
};

// Asynchronous function to display the list of meals based on the search input
async function showMealList() {
  const list = JSON.parse(localStorage.getItem(dbObjectFavList)) || [];
  const inputValue = document.getElementById("search-input").value;
  const url = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
  const mealsData = await fetchMealsFromApi(url, inputValue);
  let html = "";
  if (mealsData.meals) {
      html = mealsData.meals
          .map((element) => {
              return `
                  <div class="card">
                      <div class="card-top"  onclick="showMealDetails(${
                          element.idMeal
                      }, '${inputValue}')">
                          <div class="dish-photo" >
                              <img src="${element.strMealThumb}" alt="">
                          </div>
                          <div class="dish-name">
                              ${element.strMeal}
                          </div>
                          <div class="dish-details">
                              ${truncate(element.strInstructions, 50)}
                              <br>
                              <span class="button" onclick="showMealDetails(${
                                  element.idMeal
                              }, '${inputValue}')">Discover More</span>
                          </div>
                      </div>
                      <div class="card-bottom">
                          <div class="like">
                              <i class="fa-solid fa-heart ${
                                  isFav(list, element.idMeal) ? "active" : ""
                              } " onclick="addRemoveToFavList(${element.idMeal})"></i>
                          </div>
                          <div class="play">
                              <a href="${element.strYoutube}">
                                  <i class="fa-brands fa-youtube"></i>
                              </a>
                          </div>
                      </div>
                  </div>
              `;
          })
          .join("");
      document.getElementById("cards-holder").innerHTML = html;
  }
}

// Function to add or remove a meal from the favorites list
function addRemoveToFavList(id) {
  const detailsPageLikeBtn = document.getElementById("like-button");
  let db = JSON.parse(localStorage.getItem(dbObjectFavList)) || [];
  const index = db.indexOf(id);
  if (index !== -1) {
      db.splice(index, 1);
  } else {
      db.push(id);
  }
  localStorage.setItem(dbObjectFavList, JSON.stringify(db));
  if (detailsPageLikeBtn != null) {
      detailsPageLikeBtn.innerHTML = isFav(db, id)
          ? "Remove From Favourite"
          : "Add To Favourite";
  }
  showMealList();
  showFavMealList();
  updateTask();
}

// Asynchronous function to display detailed information about a meal
async function showMealDetails(itemId, searchInput) {
  const list = JSON.parse(localStorage.getItem(dbObjectFavList)) || [];
  flexBox.scrollTo({ top: 0, behavior: "smooth" });
  const url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
  const searchUrl = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
  const mealList = await fetchMealsFromApi(searchUrl, searchInput);
  let html = "";
  const mealDetails = await fetchMealsFromApi(url, itemId);
  if (mealDetails.meals) {
      html = `
          <div class="container remove-top-margin">
              <div class="header hide">
                  <div class="title">
                      Let's Eat Something New
                  </div>
              </div>
              <div class="fixed" id="search-bar">
                  <div class="icon">
                      <i class="fa-solid fa-search "></i>
                  </div>
                  <div class="new-search-input">
                      <form onkeyup="showMealList()">
                          <input id="search-input" type="text" placeholder="Find your delight" />
                      </form>
                  </div>
              </div>
          </div>
          <div class="item-details">
              <div class="item-details-left">
                  <img src="${mealDetails.meals[0].strMealThumb}" alt="">
              </div>
              <div class="item-details-right">
                  <div class="item-name">
                      <strong>Name: </strong>
                      <span class="item-text">
                          ${mealDetails.meals[0].strMeal}
                      </span>
                  </div>
                  <div class="item-category">
                      <strong>Category: </strong>
                      <span class="item-text">
                          ${mealDetails.meals[0].strCategory}
                      </span>
                  </div>
                  <div class="item-ingrident">
                      <strong>Ingrident: </strong>
                      <span class="item-text">
                          ${mealDetails.meals[0].strIngredient1},
                          ${mealDetails.meals[0].strIngredient2},
                          ${mealDetails.meals[0].strIngredient3},
                          ${mealDetails.meals[0].strIngredient4}
                      </span>
                  </div>
                  <div class="item-instruction">
                      <strong>Instructions: </strong>
                      <span class="item-text">
                          ${mealDetails.meals[0].strInstructions}
                      </span>
                  </div>
                  <div class="item-video">
                      <strong>Video Link:</strong>
                      <span class="item-text">
                          <a href="${mealDetails.meals[0].strYoutube}">Watch Here</a>
                      </span>
                      <div id="like-button" onclick="addRemoveToFavList(${
                          mealDetails.meals[0].idMeal
                      })"> 
                          ${isFav(list, mealDetails.meals[0].idMeal)
                              ? "Remove From Favourite"
                              : "Add To Favourite"}
                      </div>
                  </div>
              </div>
          </div> 
          <div class="card-name">
              Related Items
          </div>
          <div id="cards-holder" class=" remove-top-margin ">
      `;
  }
  if (mealList.meals != null) {
      html += mealList.meals
          .map((element) => {
              return `       
                  <div class="card">
                      <div class="card-top"  onclick="showMealDetails(${
                          element.idMeal
                      }, '${searchInput}')">
                          <div class="dish-photo" >
                              <img src="${element.strMealThumb}" alt="">
                          </div>
                          <div class="dish-name">
                              ${element.strMeal}
                          </div>
                          <div class="dish-details">
                              ${truncate(element.strInstructions, 50)}<br>
                              <span class="button" onclick="showMealDetails(${
                                  element.idMeal
                              }, '${searchInput}')">Discover More</span>
                          </div>
                      </div>
                      <div class="card-bottom">
                          <div class="like">
                              <i class="fa-solid fa-heart ${
                                  isFav(list, element.idMeal) ? "active" : ""
                              } " 
                              onclick="addRemoveToFavList(${element.idMeal})"></i>
                          </div>
                          <div class="play">
                              <a href="${element.strYoutube}">
                                  <i class="fa-brands fa-youtube"></i>
                              </a>
                          </div>
                      </div>
                  </div>
              `;
          })
          .join("");
  }
  html += "</div>";
  document.getElementById("flex-box").innerHTML = html;
}

// Asynchronous function to display the list of favorite meals
async function showFavMealList() {
  let favList = JSON.parse(localStorage.getItem(dbObjectFavList)) || [];
  let url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
  let html = "";

  if (favList.length === 0) {
      html = `<div class="fav-item nothing"> <h1> 
          Nothing To Show.....</h1> </div>`;
  } else {
      for (let i = 0; i < favList.length; i++) {
          const favMealList = await fetchMealsFromApi(url, favList[i]);
          if (favMealList.meals[0]) {
              let element = favMealList.meals[0];
              html += `
                  <div class="fav-item" onclick="showMealDetails(${
                      element.idMeal
                  },'${generateOneCharString()}')">
                      <div class="fav-item-photo">
                          <img src="${element.strMealThumb}" alt="">
                      </div>
                      <div class="fav-item-details">
                          <div class="fav-item-name">
                              <strong>Name: </strong>
                              <span class="fav-item-text">
                                  ${element.strMeal}
                              </span>
                          </div>
                          <div id="fav-like-button" onclick="addRemoveToFavList(${
                              element.idMeal
                          })">
                              Remove
                          </div>
                      </div>
                  </div>               
              `;
          }
      }
  }
  document.getElementById("fav").innerHTML = html;
}

// Initialize the application by calling the updateTask function
updateTask();
