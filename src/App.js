import React, { useState } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

function WeatherApp() {
  const [data, setData] = useState({});
  const [forecastData, setForecastData] = useState([]);
  const [hourlyForecastData, setHourlyForecastData] = useState([]);
  const [location, setLocation] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");

  const API_KEY = process.env.REACT_APP_API_KEY;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${API_KEY}`;

  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${API_KEY}`;

  const uniqueDates = forecastData.reduce((acc, item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!acc.includes(date)) {
      acc.push(date);
    }
    return acc;
  }, []);

  const getForecast = (event) => {
    if (event.key === "Enter") {
      axios
        .get(forecastUrl)
        .then((response) => {
          setForecastData(response.data.list);
          console.log(response.data.list);

          const currentDate = new Date();
          const next16Hours = response.data.list.filter((item) => {
            const forecastDate = new Date(item.dt_txt);
            const timeDifference =
              forecastDate.getTime() - currentDate.getTime();
            const hoursDifference = Math.ceil(
              timeDifference / (1000 * 60 * 60)
            );
            return hoursDifference >= 1 && hoursDifference <= 16;
          });
          setHourlyForecastData(next16Hours);
        })
      setLocation("");
    }
  };

  const searchLocation = (event) => {
    if (event.key === "Enter") {
      axios
        .get(url)
        .then((response) => {
          setData(response.data);
          console.log(response.data);
          setShowResults(true);
        })
      setLocation("");
    }
  };

  const clearResults = () => {
    setData({});
    setForecastData([]);
    setShowResults(false);
  };

  const getDay = (date) => {
    let weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    return weekday[new Date(date).getDay()];
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        axios
          .get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
          )
          .then((response) => {
            setData(response.data);
            console.log(response.data);

            axios
              .get(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
              )
              .then((forecastResponse) => {
                setForecastData(forecastResponse.data.list);
                console.log(forecastResponse.data.list);

                const currentDate = new Date();
                const next16Hours = forecastResponse.data.list.filter(
                  (item) => {
                    const forecastDate = new Date(item.dt_txt);
                    const timeDifference =
                      forecastDate.getTime() - currentDate.getTime();
                    const hoursDifference = Math.ceil(
                      timeDifference / (1000 * 60 * 60)
                    );
                    return hoursDifference >= 1 && hoursDifference <= 16;
                  }
                );
                setHourlyForecastData(next16Hours);
              })
            setShowResults(true);
          })
        setLocation("");
      });
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="app">
      <div className="search">
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              searchLocation(event);
              getForecast(event);
            } else if (event.key === "Backspace") {
              clearResults();
            }
          }}
          placeholder="Enter Location"
          type="text"
        />
        <Icon
          className="pinpoint"
          onClick={handleLocationClick}
          icon="pepicons-pop:pinpoint"
        />
      </div>
      {showResults && (
        <div className="container">
          <div className="top">
            <div className="location">
              <p>{data.name}</p>
            </div>
            <div className="temp">
              {data.main ? <h1>{data.main.temp.toFixed()}°C</h1> : null}
            </div>
            <div className="description">
              {data.weather ? <p>{data.weather[0].main}</p> : null}
            </div>
          </div>
          {data.name !== undefined && (
            <div className="bottom">
              <div className="feels">
                {data.main ? (
                  <p className="bold">{data.main.feels_like.toFixed()}°C</p>
                ) : null}
                <p>Feels Like</p>
              </div>
              <div className="humidity">
                {data.main ? (
                  <p className="bold">{data.main.humidity}%</p>
                ) : null}
                <p>Humidity</p>
              </div>
              <div className="wind">
                {data.wind ? (
                  <p className="bold">{data.wind.speed.toFixed()} MPH</p>
                ) : null}
                <p>Wind Speed</p>
              </div>
            </div>
            
          )}
          <div className="tabs">
            <button
              className={activeTab === "daily" ? "active" : ""}
              onClick={() => handleTabClick("daily")}
            >
              Daily Forecast
            </button>
            <button
              className={activeTab === "hourly" ? "active" : ""}
              onClick={() => handleTabClick("hourly")}
            >
              Hourly Forecast
            </button>
          </div>
          {activeTab === "daily" && (
            <div>
              <h2 className="forecast-title">Daily Forecast</h2>
          <div className="forecast-container">
            {uniqueDates.map((date, index) => {
              const forecast = forecastData.filter((item) =>
                item.dt_txt.includes(date)
              );
              return (
                <div className="forecast" key={index}>
                  <div className="forecast-day">
                    <p>{getDay(date)}</p>
                  </div>
                  <div className="forecast-info">
                    <div className="forecast-temp">
                      <p>Temp: {forecast[0].main.temp.toFixed()}°C</p>
                      <p>
                        Feels Like: {forecast[0].main.feels_like.toFixed()}°C
                      </p>
                    </div>
                    <div className="forecast-description">
                      <p>{forecast[0].weather[0].main}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
            </div>
          )}
          {activeTab === "hourly" && (
            <div>
              <h2 className="forecast-title">3 Hour Forecast</h2>
          {hourlyForecastData.length > 0 && (
            <div className="forecast-container">
              {hourlyForecastData.map((item, index) => (
                <div className="forecast" key={index}>
                  <div className="forecast-day">
                    <p>
                      {new Date(item.dt_txt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="forecast-temp">
                    <p>Temp: {item.main.temp.toFixed()}°C</p>
                    <p>Feels Like: {item.main.feels_like.toFixed()}°C</p>
                    <p>{item.weather[0].main}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
            </div>
          )}
          <button onClick={clearResults}>Clear Results</button>
        </div>
      )}
    </div>
  );
}

export default WeatherApp;
