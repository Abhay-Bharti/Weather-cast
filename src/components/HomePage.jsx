import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [city, setCity] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (city.trim()) {
            navigate(`/weather/${city}`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-8">
                <h1 className="text-4xl font-bold text-white text-center mb-8">Weather Cast</h1>
                <form onSubmit={handleSearch} className="flex flex-col items-center gap-4">
                    <div className="relative w-full max-w-xl">
                        <input
                            type="text"
                            placeholder="Search by city name"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:outline-none focus:border-white/50"
                        />
                        <button
                            type="submit"
                            className="absolute right-1 top-1/2 -translate-y-1/2 btn-primary"
                        >
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </button>
                    </div>
                    <button
                        type="button"
                        className="flex items-center gap-2 text-white hover:text-white/80 btn-icon"
                        onClick={() => {
                            // Handle location access here
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition((position) => {
                                    navigate(`/weather/current?lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
                                });
                            }
                        }}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        Use Current Location
                    </button>
                </form>
            </div>
        </div>
    );
};

export default HomePage; 