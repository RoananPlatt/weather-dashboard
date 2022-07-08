var city = "";
var citySearch = $("#city-search");
var searchForButton = $("#search-for-button");
var clearHistoryButton = $("#clear-history-button");
var currentLocationOrCity = $("#current-location");
var currentTemperature = $("#current-temperature");
var currentHumidityMeasurement = $("#current-humidity");
var currentWindSpeed = $("#current-wind-speed");
var uvIndex = $("current-uv-index");
var searchCity = [];


function find(c) {
    for (var i = 0; i < sCity.length; i++) {
        if (c.toUpperCase() === sCity[i]) {
            return -1;
        }
    }
    return 1;
}

//this is the key for the api

var APIKey = "993e66d0b0d5090af76f55db0856f1ab";

function displayWeather(event) {
    event.preventDefault();
    if (citySearch.val().trim() !== "") {
        city = citySearch.val().trim();
        currentWeather(city);
    }
}

function currentWeather(city) {
    //server side data
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function (response) {
        console.log(response);

        var weathericon = response.weather[0].icon;
        var iconurl = "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";
        var date = new Date(response.dt * 1000).toLocaleDateString();

        $(currentLocationOrCity).html(response.name + "(" + date + ")" + "<img src=" + iconurl + ">");

        var tempFahrenheit  = (response.main.temp - 273.15) * 1.80 + 32;

        $(currentTemperature).html((tempFahrenheit ).toFixed(2) + "&#8457");
        $(currentHumidityMeasurement).html(response.main.humidity + "%");

        var ws = response.wind.speed;
        var currentWindSpeed = (ws * 2.237).toFixed(1);

        $(currentWSpeed).html(currentWindSpeed + "MPH");

        UVIndex(response.coord.lon, response.coord.lat);
        forecast(response.id);
        if (response.cod == 200) {
            sCity = JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity == null) {
                sCity = [];
                sCity.push(city.toUpperCase());
                localStorage.setItem("cityname", JSON.stringify(sCity));
                addToList(city);
            } else {
                if (find(city) > 0) {
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname", JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}


function UVIndex(ln, lt) {
    var uvqURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;
    $.ajax({
        url: uvqURL,
        method: "GET"
    }).then(function (response) {
        $(currentUvindex).html(response.value);
    });
}
//WHEN I view future weather conditions for that city
// THEN I am presented with a 5 - day forecast that displays the date, an icon representation
//  of weather conditions, the temperature, the wind speed, and the humidity
//see the project requirements file
// Display the 5 days forecast for the current city
function forecast(cityid) {
    var dayover = false;
    var queryforcastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + APIKey;
    $.ajax({
        url: queryforcastURL,
        method: "GET"
    }).then(function (response) {

        for (i = 0; i < 5; i++) {
            var date = new Date((response.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
            var iconcode = response.list[((i + 1) * 8) - 1].weather[0].icon;
            var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
            var tempK = response.list[((i + 1) * 8) - 1].main.temp;
            var tempFahrenheit  = (((tempK - 273.5) * 1.80) + 32).toFixed(2);
            var humidity = response.list[((i + 1) * 8) - 1].main.humidity;

            $("#futureDate" + i).html(date);
            $("#futureWeatherImage" + i).html("<img src=" + iconurl + ">");
            $("#futureWeatherTemp" + i).html(tempFahrenheit  + "&#8457");
            $("#futureHumidity" + i).html(humidity + "%");
        }

    });
}


// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions
// for that city
//see the project requirements file for more information
function addToList(c) {
    var listEl = $("<li>" + c.toUpperCase() + "</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", c.toUpperCase());
    $(".list-group").append(listEl);
}
// display past search again when list group item clicked in search history
function invokePastSearch(event) {
    var liEl = event.target;
    if (event.target.matches("li")) {
        city = liEl.textContent.trim();
        currentWeather(city);
    }
}

function loadLastCity() {
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if (sCity !== null) {
        sCity = JSON.parse(localStorage.getItem("cityname"));
        for (i = 0; i < sCity.length; i++) {
            addToList(sCity[i]);
        }
        city = sCity[i - 1];
        currentWeather(city);
    }
}



function clearHistory(event) {
    event.preventDefault();
    sCity = [];
    localStorage.removeItem("cityname");
    document.location.reload();
}



$("#search-for-button").on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadLastCity);
$("#clear-history").on("click", clearHistory);