'use strict';

// api data
const API_URL = 'https://api.openweathermap.org/data/2.5/weather'; // ?q={city}&appid={api-key}
const API_KEY_PARAM_NAME = 'appid';
const API_KEY = 'b837cfa721addad4d37a808828acf5df';
const UNITS_NAME = 'units';
const UNITS_VALUE = 'metric';

function getUrlByCity(city) {
    let weatherUrl = new URL(API_URL);
    weatherUrl.searchParams.set(API_KEY_PARAM_NAME, API_KEY);
    weatherUrl.searchParams.set(UNITS_NAME, UNITS_VALUE);
    weatherUrl.searchParams.set('q', city);
    return weatherUrl;
}

function getUrlByCoords(coords) {
    let weatherUrl = new URL(API_URL);
    weatherUrl.searchParams.set(API_KEY_PARAM_NAME, API_KEY);
    weatherUrl.searchParams.set(UNITS_NAME, UNITS_VALUE);
    weatherUrl.searchParams.set('lat', coords.lat);
    weatherUrl.searchParams.set('lon', coords.lon);
    return weatherUrl;
}

function checkCity(city) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', getUrlByCity(city), false);
    xhr.send();
    return xhr.status === 200;
}

// local storage keys
const HERE_CITY = 'here-city';
const HERE_CITY_COORDS = 'here-city-coords';
const FAVORITE_LIST = 'favorites';

// asking for geo position or default city
if (localStorage.getItem(HERE_CITY) === null && localStorage.getItem(HERE_CITY_COORDS) === null) {
    navigator.geolocation.getCurrentPosition(
    (position) => {
        localStorage.setItem(HERE_CITY_COORDS, JSON.stringify({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
        }));
        location.reload();
        },
    () => {
        let city;
        do {
            city = prompt('Введите город по умолчанию');
        } while (!checkCity(city));
        localStorage.setItem(HERE_CITY, city);
        location.reload();
    });
    localStorage.setItem(FAVORITE_LIST, JSON.stringify([]));
}

// DOM IDs and classes
const FAVORITE_LIST_ID = 'favorite-list';
const FAVORITES = JSON.parse(localStorage.getItem(FAVORITE_LIST));
const FAVORITE_EXAMPLE_ID = 'example';
const UPDATE_INFO_ID = 'here-city-update-info';
const UPDATE_INFO_FAVORITE_CLASS = 'update-favorite';
const HERE_CITY_MAIN_ID = 'weather-here-main-info';
const HERE_CITY_CHARACTERISTICS_ID = 'weather-here-characteristics';
const ADD_FAVORITE_FORM_ID = 'add-new-city';
const NEW_CITY_ID = 'new-city';
const UPDATE_BUTTON_CLASS = 'update-button';

// remove favorite button
function removeFavorite() {
    let favorite = this.parentElement.parentElement;
    let index = 0;
    while ((favorite = favorite.previousElementSibling) != null) {
        ++index;
    }
    let favorites = JSON.parse(localStorage.getItem(FAVORITE_LIST));
    favorites.splice(index - 1, 1); // -1 because of mock first favorite
    localStorage.setItem(FAVORITE_LIST, JSON.stringify(favorites));
    this.parentElement.parentElement.remove();
}
let favoriteExample = document.getElementById(FAVORITE_EXAMPLE_ID);
favoriteExample.firstElementChild.lastElementChild.onclick = removeFavorite;

// add favorite button with checking city validness
document.getElementById(ADD_FAVORITE_FORM_ID).onsubmit = function () {
    let city = document.getElementById(NEW_CITY_ID).value;
    if (!checkCity(city)) {
        alert('Несуществующий город: ' + city);
        return;
    }
    let favorites = JSON.parse(localStorage.getItem(FAVORITE_LIST));
    favorites.push(city);
    localStorage.setItem(FAVORITE_LIST, JSON.stringify(favorites));
    const url = getUrlByCity(city);
    fetch(url)
        .then(response => response.json())
        .then(json => fillFavorite(json, favorites.length - 1));
};

// update button
function update() {
    location.reload();
}
for (let b of document.getElementsByClassName(UPDATE_BUTTON_CLASS)) {
    b.onclick = update;
}

// hiding here-city info
let updateInfo = document.getElementById(UPDATE_INFO_ID);
updateInfo.style.visibility = 'visible';
let mainInfo = document.getElementsByClassName(HERE_CITY_MAIN_ID)[0];
let characteristics = document.getElementsByClassName(HERE_CITY_CHARACTERISTICS_ID)[0];
mainInfo.style.visibility = 'hidden';
characteristics.style.visibility = 'hidden';

// creating node for every favorite city with update info
const FAVORITE_LIST_NODE = document.getElementById(FAVORITE_LIST_ID);
for (const f of FAVORITES) {
    let favorite = document.getElementById(FAVORITE_EXAMPLE_ID).cloneNode(true);
    favorite.setAttribute('id', '');
    favorite.style.visibility = 'hidden';
    favorite.firstElementChild.lastElementChild.onclick = removeFavorite;
    let update_info = updateInfo.cloneNode(true);
    update_info.setAttribute('id', '');
    update_info.classList.add(UPDATE_INFO_FAVORITE_CLASS);
    favorite.prepend(update_info);
    FAVORITE_LIST_NODE.append(favorite);
}

// weather constants
const TEMP_METRIC = '\u00B0C';
const ICONS_DIR = '../res/weather-icons/';
const ICONS_EXT = '.svg';
const WIND_DIRECTIONS = ['North', 'North-northeast', 'Northeast', 'East-northeast',
    'East', 'East-southeast', 'Southeast', 'South-southeast',
    'South', 'South-southwest', 'Southwest', 'West-southwest',
    'West', 'West-northwest', 'Northwest', 'North-northwest',
];
const WIND_METRIC = 'm/s';
function getCloudsFromPercents(percents) {
    const CLOUDS = ['Clear sky', 'Few clouds', 'Scattered clouds',
        'Broken clouds', 'Overcast clouds',
    ];
    if (percents < 11) {
        return CLOUDS[0];
    } else if (percents < 25) {
        return CLOUDS[1];
    } else if (percents < 50) {
        return CLOUDS[2];
    } else if (percents < 85) {
        return CLOUDS[3];
    }
    return CLOUDS[4];
}
const PRESSURE_METRIC = 'hpa';
const HUMIDITY_METRIC = '%';

// filling weather info
function fillCharacteristics(characteristics, json) {
    characteristics[0].children[0].textContent = json.wind.speed.toFixed(1)
        + ' ' + WIND_METRIC + ', ' + WIND_DIRECTIONS[Math.round(json.wind.deg / 22.5)];
    characteristics[1].children[0].textContent = getCloudsFromPercents(json.clouds.all);
    characteristics[2].children[0].textContent = json.main.pressure + ' ' + PRESSURE_METRIC;
    characteristics[3].children[0].textContent = json.main.humidity + ' ' + HUMIDITY_METRIC;
    characteristics[4].children[0].textContent = '[' + json.coord.lat.toFixed(2)
        + ', ' + json.coord.lon.toFixed(2) + ']';
}
function fillHereCity(json) {
    document.getElementById(UPDATE_INFO_ID).style.visibility = 'hidden';
    let mainInfo = document.getElementsByClassName(HERE_CITY_MAIN_ID)[0];
    let mainInfoElems = mainInfo.children;
    mainInfoElems[0].textContent = json.name;
    mainInfoElems[1].setAttribute('src', ICONS_DIR + json.weather[0].icon + ICONS_EXT);
    mainInfoElems[2].textContent = Math.round(json.main.temp) + TEMP_METRIC;
    mainInfo.style.visibility = 'visible';
    let characteristics = document.getElementsByClassName(HERE_CITY_CHARACTERISTICS_ID)[0];
    fillCharacteristics(characteristics.children, json);
    characteristics.style.visibility = 'visible';
}
function fillFavorite(json, i) {
    let favorite = FAVORITE_LIST_NODE.children[i + 1]; // +1 because of mock first elem
    favorite.firstElementChild.remove();
    let header = favorite.firstElementChild.children;
    header[0].textContent = json.name;
    header[1].textContent = Math.round(json.main.temp) + TEMP_METRIC;
    header[2].setAttribute('src', ICONS_DIR + json.weather[0].icon + ICONS_EXT);
    fillCharacteristics(favorite.lastElementChild.children, json);
    favorite.style.visibility = "visible";
}

// getting weather for here-city
let hereCityUrl;
if (localStorage.getItem(HERE_CITY) !== null) {
    hereCityUrl = getUrlByCity(localStorage.getItem(HERE_CITY));
} else if (localStorage.getItem(HERE_CITY_COORDS) !== null) {
    hereCityUrl = getUrlByCoords(JSON.parse(localStorage.getItem(HERE_CITY_COORDS)));
}
fetch(hereCityUrl)
    .then(response => response.json())
    .then(json => fillHereCity(json));

// getting weather for favorite cities
for (let i = 0; i < FAVORITES.length; ++i) {
    const url = getUrlByCity(FAVORITES[i]);
    fetch(url)
        .then(response => response.json())
        .then(json => fillFavorite(json, i));
}
