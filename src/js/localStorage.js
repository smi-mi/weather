'use strict';

const API_URL = 'https://api.openweathermap.org/data/2.5/weather'; // ?q={city}&appid={api-key}
const API_KEY_PARAM_NAME = 'appid';
const CITY_PARAM_NAME = 'q';
const API_KEY = 'b837cfa721addad4d37a808828acf5df';
const WEATHER_URL = new URL(API_URL);
WEATHER_URL.searchParams.set(API_KEY_PARAM_NAME, API_KEY);

const HERE_CITY = "here-city";
const HERE_CITY_COORDS = "here-city-coords";

// asking for geoposition ot default city
if (localStorage.getItem(HERE_CITY) == null && localStorage.getItem(HERE_CITY_COORDS) == null) {
    navigator.geolocation.getCurrentPosition(
    (position) => {
        localStorage.setItem(HERE_CITY_COORDS, JSON.stringify({
            lat: position.coords.latitude,
            lon: position.coords.longitude
        }));
    },
    () => {
        const CITY = prompt("Введите город по умолчанию");
        localStorage.setItem(HERE_CITY, CITY);
    });
}



// TODO waiting loading info
let update_info = document.getElementById("here-city-update-info").cloneNode(true);
update_info.
update_info.classList.add();

// TODO getting weather for here-city and favorites

// TODO buttons to add / delete favorite


// getting info example
let xhr = new XMLHttpRequest();
xhr.open('GET', API_URL + '?q=London&appid=' + API_KEY);
xhr.send();
xhr.responseType = 'json';
let x;
xhr.onload = function () {
    x = xhr.response; // already object from json!
};
