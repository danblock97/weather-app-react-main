import React, { useState } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

const WeatherApp = () => {
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
      axios.get(forecastUrl).then((response) => {
        setForecastData(response.data.list);

        const currentDate = new Date();
        const next16Hours = response.data.list.filter((item) => {
          const forecastDate = new Date(item.dt_txt);
          const timeDifference = forecastDate.getTime() - currentDate.getTime();
          const hoursDifference = Math.ceil(timeDifference / (1000 * 60 * 60));
          return hoursDifference >= 1 && hoursDifference <= 16;
        });
        setHourlyForecastData(next16Hours);
      });
      setLocation("");
    }
  };

  const searchLocation = (event) => {
    if (event.key === "Enter") {
      axios.get(url).then((response) => {
        setData(response.data);
        setShowResults(true);
      });
      setLocation("");
    }
  };

  const clearResults = () => {
    setData({});
    setForecastData([]);
    setShowResults(false);
  };

  const getDay = (date) => {
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return weekdays[new Date(date).getDay()];
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

            axios
              .get(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
              )
              .then((forecastResponse) => {
                setForecastData(forecastResponse.data.list);

                const currentDate = new Date();
                const next16Hours = forecastResponse.data.list.filter((item) => {
                  const forecastDate = new Date(item.dt_txt);
                  const timeDifference = forecastDate.getTime() - currentDate.getTime();
                  const hoursDifference = Math.ceil(timeDifference / (1000 * 60 * 60));
                  return hoursDifference >= 1 && hoursDifference <= 12;
                });
                setHourlyForecastData(next16Hours);
              });
            setShowResults(true);
          });
        setLocation("");
      });
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white">
      <div className="flex items-center mb-4">
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
          className="px-4 py-2 border rounded-md mr-2 focus:outline-none bg-gray-800 text-white"
        />
        <Icon
          className="cursor-pointer"
          onClick={handleLocationClick}
          icon="pepicons-pop:pinpoint"
        />
      </div>
      {showResults && (
        <div>
          <div className="flex items-center mb-4">
            <div>
              <p className="text-2xl font-bold">{data.name}</p>
              {data.main && (
                <p className="text-6xl font-bold">{data.main.temp.toFixed()}°C</p>
              )}
              {data.weather && <p className="text-lg">{data.weather[0].main}</p>}
            </div>
          </div>
          {data.name !== undefined && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                {data.main && (
                  <p className="text-xl">{data.main.feels_like.toFixed()}°C</p>
                )}
                <p className="text-sm">Feels Like</p>
              </div>
              <div className="text-center">
                {data.main && (
                  <p className="text-xl">{data.main.humidity}%</p>
                )}
                <p className="text-sm">Humidity</p>
              </div>
              <div className="text-center">
                {data.wind && (
                  <p className="text-xl">{data.wind.speed.toFixed()} MPH</p>
                )}
                <p className="text-sm">Wind Speed</p>
              </div>
            </div>
          )}
          <div className="flex justify-center mb-4">
            <button
              className={`text-lg px-4 py-2 rounded-md ${
                activeTab === "daily" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
              } mr-2`}
              onClick={() => handleTabClick("daily")}
            >
              Daily Forecast
            </button>
            <button
              className={`text-lg px-4 py-2 rounded-md ${
                activeTab === "hourly" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => handleTabClick("hourly")}
            >
              Hourly Forecast
            </button>
          </div>
          {activeTab === "daily" && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Daily Forecast</h2>
              <div className="grid grid-cols-2 gap-4">
                {uniqueDates.map((date, index) => {
                  const forecast = forecastData.filter((item) =>
                    item.dt_txt.includes(date)
                  );
                  return (
                    <div className="border rounded-md p-4" key={index}>
                      <div className="mb-2">
                        <p className="text-lg font-bold">{getDay(date)}</p>
                      </div>
                      <div className="flex items-center">
                        <Icon
                          className="text-3xl mr-2"
                          icon={`wi:owm-${forecast[0].weather[0].id}`}
                        />
                        <div>
                          <p>{forecast[0].weather[0].main}</p>
                          <p className="text-lg font-bold">
                            {forecast[0].main.temp_max.toFixed()}°C
                          </p>
                          <p className="text-sm">
                            {forecast[0].main.temp_min.toFixed()}°C
                          </p>
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
              <h2 className="text-2xl font-bold mb-2">Hourly Forecast</h2>
              <div className="grid grid-cols-4 gap-4">
                {hourlyForecastData.map((item, index) => {
                  return (
                    <div className="border rounded-md p-4" key={index}>
                      <p className="text-lg">{item.dt_txt.split(" ")[1]}</p>
                      <Icon
                        className="text-3xl mt-2"
                        icon={`wi:owm-${item.weather[0].id}`}
                      />
                      <p>{item.weather[0].main}</p>
                      <p className="text-lg font-bold">
                        {item.main.temp.toFixed()}°C
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WeatherApp;
