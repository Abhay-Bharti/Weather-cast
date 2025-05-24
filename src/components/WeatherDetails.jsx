import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const WeatherDetails = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDay, setIsDay] = useState(true);
    const { city } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const checkIfDay = (sunrise, sunset) => {
        const now = new Date().getTime();
        const sunriseTime = new Date(sunrise).getTime();
        const sunsetTime = new Date(sunset).getTime();
        return now >= sunriseTime && now < sunsetTime;
    };

    // Function to get background class based on weather
    const getBackgroundClass = (weatherCode) => {
        // Clear sky
        if (weatherCode === 0) {
            return isDay ? 'bg-clear-day' : 'bg-clear-night';
        }
        // Partly cloudy or cloudy
        if (weatherCode >= 1 && weatherCode <= 3) {
            return isDay ? 'bg-cloudy-day' : 'bg-cloudy-night';
        }
        // Rain (including drizzle)
        if ((weatherCode >= 51 && weatherCode <= 65) || (weatherCode >= 80 && weatherCode <= 82)) {
            return 'bg-rainy';
        }
        // Snow
        if (weatherCode >= 71 && weatherCode <= 77) {
            return 'bg-snow';
        }
        // Thunderstorm
        if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) {
            return 'bg-storm';
        }
        // Default
        return isDay ? 'bg-clear-day' : 'bg-clear-night';
    };

    useEffect(() => {
        const fetchWeatherData = async () => {
            try {
                setLoading(true);
                let lat, lon;

                if (city === 'current') {
                    lat = searchParams.get('lat');
                    lon = searchParams.get('lon');
                } else {
                    // Geocode the city name to get coordinates
                    const geoResponse = await axios.get(
                        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`
                    );
                    if (!geoResponse.data.results?.[0]) {
                        throw new Error('City not found');
                    }
                    lat = geoResponse.data.results[0].latitude;
                    lon = geoResponse.data.results[0].longitude;
                }

                // Fetch current weather and forecast
                const [weatherResponse, forecastResponse] = await Promise.all([
                    axios.get(
                        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
                    ),
                    axios.get(
                        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi&timezone=auto`
                    )
                ]);

                const weatherData = {
                    current: weatherResponse.data.current,
                    hourly: weatherResponse.data.hourly,
                    daily: weatherResponse.data.daily,
                    aqi: forecastResponse.data.current.us_aqi,
                    location: city === 'current' ? 'Current Location' : city
                };

                setWeather(weatherData);
                setIsDay(checkIfDay(weatherData.daily.sunrise[0], weatherData.daily.sunset[0]));
                setError(null);
            } catch (err) {
                setError('Failed to fetch weather data. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchWeatherData();
    }, [city, searchParams]);

    // Weather code to description mapping
    const getWeatherDescription = (code) => {
        const weatherCodes = {
            0: 'Sunny',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Cloudy',
            45: 'Foggy',
            48: 'Foggy',
            51: 'Light rain',
            53: 'Rainy',
            55: 'Heavy rain',
            61: 'Light rain',
            63: 'Rainy',
            65: 'Heavy rain',
            71: 'Light snow',
            73: 'Snowy',
            75: 'Heavy snow',
            95: 'Storm',
        };
        return weatherCodes[code] || 'Clear';
    };

    // Get weather icon based on code and is_day
    const getWeatherIcon = (code) => {
        const iconMap = {
            0: '☀️',
            1: '🌤️',
            2: '⛅',
            3: '☁️',
            45: '🌫️',
            48: '🌫️',
            51: '🌧️',
            53: '🌧️',
            55: '🌧️',
            61: '🌧️',
            63: '🌧️',
            65: '🌧️',
            71: '🌨️',
            73: '🌨️',
            75: '🌨️',
            95: '⛈️',
        };
        return iconMap[code] || '☀️';
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/weather/${searchQuery.trim()}`);
            setSearchQuery('');
        }
    };

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    navigate(`/weather/current?lat=${latitude}&lon=${longitude}`);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setError('Unable to get your location. Please allow location access or search by city name.');
                }
            );
        } else {
            setError('Geolocation is not supported by your browser');
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
    if (error) return <div className="flex items-center justify-center h-screen text-white">{error}</div>;

    return (
        <>
            <div className={getBackgroundClass(weather.current.weather_code)} />
            <div className="bg-overlay" />
            <div className="app-container">
                {/* Navbar */}
                <div className="bg-black/20 backdrop-blur-md p-4 rounded-lg mb-4">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-white">Weather Cast</h1>
                        <form onSubmit={handleSearch} className="flex items-center gap-4">
                            <input
                                type="search"
                                placeholder="search by city name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            <button
                                type="submit"
                                className="btn-icon"
                            >
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={handleCurrentLocation}
                                className="btn-icon"
                            >
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>

                <div className="weather-content max-w-6xl mx-auto p-6">
                    <div className="grid grid-cols-3 gap-6">
                        {/* Left section with main temp and forecasts */}
                        <div className="col-span-2 space-y-6">
                            {/* Main temperature display */}
                            <div className="bg-black/30 backdrop-blur-md rounded-xl p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-3xl font-bold">{weather.location}</h2>
                                        <p className="text-gray-200 text-sm">Chance of rain: {weather.current.relative_humidity_2m}%</p>
                                        <div className="mt-4">
                                            <span className="text-7xl font-bold">{Math.round(weather.current.temperature_2m)}°</span>
                                        </div>
                                    </div>
                                    <div className="text-6xl">{getWeatherIcon(weather.current.weather_code)}</div>
                                </div>
                            </div>

                            {/* Today's Forecast */}
                            <div className="bg-black/30 backdrop-blur-md rounded-xl p-6">
                                <h3 className="text-sm text-gray-200 mb-4">TODAY'S FORECAST</h3>
                                <div className="grid grid-cols-6 divide-x divide-gray-500/30">
                                    {weather.hourly.temperature_2m.slice(0, 6).map((temp, index) => {
                                        const hour = new Date(weather.hourly.time[index]).getHours();
                                        const timeLabel = `${hour}:00`;
                                        return (
                                            <div key={index} className="text-center px-2">
                                                <div className="text-sm text-gray-200">{timeLabel}</div>
                                                <div className="text-2xl my-2">{getWeatherIcon(weather.hourly.weather_code[index])}</div>
                                                <div className="text-lg font-semibold">{Math.round(temp)}°</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Air Conditions */}
                            <div className="bg-black/30 backdrop-blur-md rounded-xl p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm text-gray-200">AIR CONDITIONS</h3>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div className="text-center">
                                        <p className="text-gray-200 text-sm">Real Feel</p>
                                        <p className="text-2xl font-semibold mt-1">{Math.round(weather.current.apparent_temperature)}°</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-200 text-sm">Wind</p>
                                        <p className="text-2xl font-semibold mt-1">{weather.current.wind_speed_10m} km/h</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-200 text-sm">Chance of rain</p>
                                        <p className="text-2xl font-semibold mt-1">{weather.current.relative_humidity_2m}%</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-200 text-sm">UV Index</p>
                                        <p className="text-2xl font-semibold mt-1">3</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 7-Day Forecast */}
                        <div className="bg-black/30 backdrop-blur-md rounded-xl p-9 h-fit">
                            <h3 className="text-xl text-gray-200 mb-5">7-DAY FORECAST</h3>
                            <div className="space-y-3">
                                {weather.daily.time.map((date, index) => (
                                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-500/30 last:border-0">
                                        <div className="w-16 text-sm">
                                            {index === 0 ? 'Today' : new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{getWeatherIcon(weather.daily.weather_code[index])}</span>
                                            <span className="text-sm">{getWeatherDescription(weather.daily.weather_code[index])}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-semibold">{Math.round(weather.daily.temperature_2m_max[index])}°</span>
                                            <span className="text-gray-300">/{Math.round(weather.daily.temperature_2m_min[index])}°</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WeatherDetails; 