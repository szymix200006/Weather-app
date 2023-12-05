const apiKey = '30bee0a5d85e04219348a2038792e25a';
const cityInput = document.querySelector('.city-input');
const cityButton = document.querySelector('.search-city-button');
const cityAddButton = document.querySelector('.add-city-button');
const cityList = document.querySelector('.city-list');
const todayWeatherCity = document.querySelector('.today-weather-city');
const todayWeatherTemperature = document.querySelector('.today-weather-temperature');
const todayWeatherHumidity = document.querySelector('.today-weather-humidity');
const todayWeatherWindSpeed = document.querySelector('.today-weather-windspeed');
const todayWeatherSunrise = document.querySelector('.today-weather-sunrise');
const todayWeatherSunset = document.querySelector('.today-weather-sunset');
const todayWeatherImage = document.querySelector('.today-weather-image');
const forecastDateList = document.querySelectorAll('.forecast-date');
const forecastImageList = document.querySelectorAll('.forecast-image');
const forecastTemperatureList = document.querySelectorAll('.forecast-temperature');
const appContainer = document.querySelector('.container');
const map = L.map('map');
var addedCities = []; 
var myWeatherURL;
var myForecastURL;
var weatherChart;

function getPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    myWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    myForecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
    setWeather();
}

function loadInfo() {
    addedCities = localStorage.getItem('cities').split(',').filter(element => element != '');
    addedCities.forEach(city => {
        addCity(city, true);
    });
    console.log(addedCities)
}

function search(city) {
    cityInput.value = '';
    myWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    myForecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    setWeather();
}

function addFunctions() {
    cityButton.addEventListener('click', () => {
        search(cityInput.value);
    });
    cityAddButton.addEventListener('click', () => {
        addCity(cityInput.value.toUpperCase());
    });
}

async function getWeather(urlToFetch){
    return new Promise((resolve, reject) => {
        fetch(urlToFetch)
            .then(response => response.json())
            .then(data => {
                if(data.cod == '404'){
                    reject('There is no such a city');
                }else{
                    resolve(data);
                }
            });
    });
}

function setCharts(data) {
    const chartContainer = document.getElementById('myChart').getContext('2d');
    const temperatures = getForecastTemperatures(data);
    const days = getForecastDays(data);
    if(!weatherChart){
            weatherChart = new Chart(chartContainer, {
            type: 'bar',
            data: {
            labels: days.map(element => `${new Date(element).getDate()}.${new Date(element).getMonth().toString().padStart(2,'0')}`),
            datasets: [{
                label: 'Temperature: ',
                data: temperatures,
                borderWidth: 1,
                backgroundColor: [
                    'rgba(75, 107, 60, 0.2)',
                    'rgba(58, 73, 40, 0.2)',
                    'rgba(212, 191, 136, 0.2)'
                ],
                borderColor: [
                    'rgba(75, 107, 60, 1)',
                    'rgba(58, 73, 40, 1)',
                    'rgba(212, 191, 136, 1)'
                ],
            }]
            },
            options: {
                scales: {
                    y: {
                    beginAtZero: true
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    } else {
        weatherChart.data.datasets[0].data = temperatures;
        weatherChart.update();
    }
    
}

function setWeatherValues(data) {
    const city = data.name;
    const temperature = `${data.main.temp}°`;
    const windSpeed = `${data.wind.speed} km/h`;
    const humidity = `${data.main.humidity}%`;
    const sunset = `${new Date(data.sys.sunset * 1000).getHours()}:${new Date(data.sys.sunset * 1000).getMinutes().toString().padStart(2,"0")}`;
    const sunrise = `${new Date(data.sys.sunrise * 1000).getHours()}:${new Date(data.sys.sunrise * 1000).getMinutes().toString().padStart(2,"0")}`;
    const imageSrc = ` https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`; 

    todayWeatherCity.innerHTML = city;
    todayWeatherTemperature.innerHTML = temperature;
    todayWeatherHumidity.innerHTML = humidity;
    todayWeatherWindSpeed.innerHTML = windSpeed;
    todayWeatherSunrise.innerHTML = sunrise;
    todayWeatherSunset.innerHTML = sunset;
    todayWeatherImage.src = imageSrc;
}

function setForecastValues(data) {
    const daysList = getForecastDays(data);
    const temperaturesList = getForecastTemperatures(data);
    const imagesList = getForecastImages(data);

    for(index = 0; index < 5; index++){
        forecastDateList[index].innerHTML = `${new Date(daysList[index]).getDate()}.${new Date(daysList[index]).getMonth().toString().padStart(2, "0")}`;
        forecastImageList[index].src = imagesList[index];
        forecastTemperatureList[index].innerHTML = `${temperaturesList[index]}°`;
    }
}

function getForecastDays(data) {
    const currentDay = new Date().getDate();
    const daysToGet = [];
    for(const day of data.list) {
        const newDay = new Date(day.dt_txt);
        if(newDay.getDate() !== currentDay && newDay.getHours() === 15) {
            daysToGet.push(newDay.toString());
        }
        else if(daysToGet.length < 5 && newDay.getDate() - currentDay === 5) {
            daysToGet.push(newDay.toString());
        }
        else if(daysToGet.length == 5 && newDay.getHours() === 15) {
            daysToGet.pop();
            daysToGet.push(newDay.toString());
        }
    }
    
    return daysToGet;
}

function getForecastTemperatures(data) {
    const daysList = getForecastDays(data);
    const temperaturesToGet = [];
    for(const day of data.list){
        const newDay = new Date(day.dt_txt);
        if(daysList.includes(newDay.toString())){
            temperaturesToGet.push(Math.trunc(day.main.temp));
        }
    }

    return temperaturesToGet;
}

function getForecastImages(data) {
    const daysList = getForecastDays(data);
    const imagesToGet = [];
    for(const day of data.list){
        const newDay = new Date(day.dt_txt);
        if(daysList.includes(newDay.toString())){
            imagesToGet.push(` https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`);
        }
    }

    return imagesToGet;
}

function onError(error) {
    const errorContainer = document.createElement('div');
    const closeButton = createDeleteButton('delete-city-button', '❌');
    errorContainer.classList.add('error-container');
    errorContainer.innerHTML = `<span>${error}</span>`;
    errorContainer.append(closeButton);
    appContainer.append(errorContainer);

    closeButton.addEventListener('click', () => {
        errorContainer.remove();
    })
}

async function setWeather() {
    try {
        const weather = await getWeather(myWeatherURL);
        const forecast = await getWeather(myForecastURL);
        setWeatherValues(weather);
        setForecastValues(forecast);
        setMap(weather.coord.lat, weather.coord.lon);
        setCharts(forecast);
    } catch(error) {
        onError(error);
    }
}

function setMap(xCoordinate, yCoordinate) {
    map.setView([xCoordinate, yCoordinate], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const marker = L.marker([xCoordinate, yCoordinate]).addTo(map);
    marker.bindPopup('You are here!').openPopup();
}

function deleteCity(city) {
    const cityIndex = addedCities.indexOf(city);
    addedCities.splice(cityIndex, 1);
    localStorage.setItem('cities', addedCities);
    cityList.children[cityIndex].remove();
}

async function checkCity(place) {
    myWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${place}&appid=${apiKey}&units=metric`;
    const data = await fetch(myWeatherURL);
    if(data.status == 200) return true;
    else return false;
}

async function addCity(city, loadingPhase) {
    if(!addedCities.includes(city) || loadingPhase == true){
        if(city != "" && await checkCity(city)){
            const newCity = createCityButton('city', `<span>${city}</span>`);
            const deleteButton = createDeleteButton('delete-city-button', '❌');
            deleteButton.addEventListener('click',() => {
                deleteCity(newCity.children[0].innerHTML);
            });
            newCity.children[0].addEventListener('click', () => {
                search(newCity.children[0].innerHTML);
            });
            newCity.append(deleteButton);
            cityList.append(newCity);
            cityInput.value = '';

            if(!loadingPhase){
                addedCities.push(city);
                localStorage.setItem('cities', addedCities);
            }
        } else {
            onError('Type in an existing city.')
        }
    } else {
        onError('City already added');
    }
}

function createDeleteButton(className, inner) {
    const deleteButton = document.createElement('button');
    deleteButton.classList.add(className.toString());
    deleteButton.innerHTML = inner;

    return deleteButton;
}

function createCityButton(className, inner) {
    const newCity = document.createElement('div');
    newCity.innerHTML = inner;
    newCity.classList.add(className.toString());

    return newCity;
}

function startApp() {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(getPosition);   
    }
    addFunctions();
    loadInfo();
}

window.onload = () => {
    startApp();
}