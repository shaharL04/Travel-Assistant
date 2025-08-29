import axios from 'axios';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';
dotenv.config();

class APIService {
    constructor() {
        this.cache = new NodeCache({ stdTTL: 1800 }); // 30 minutes TTL
        
        // Load environment variables
        this.weatherApiKey = process.env.WEATHER_API_KEY;
        
        // API endpoints
        this.countryApiUrl = 'https://restcountries.com/v3.1';
        this.weatherApiUrl = 'https://api.openweathermap.org/data/2.5';
        
    }

    async getWeatherData(location) {
        try {
            const cacheKey = `weather_${location.toLowerCase()}`;
            const cached = this.cache.get(cacheKey);
            if (cached) return cached;

            const response = await axios.get(
                `${this.weatherApiUrl}/weather?q=${encodeURIComponent(location)}&appid=${this.weatherApiKey}&units=metric`
            );

            const weatherData = {
                location: location,
                temperature: response.data.main.temp,
                description: response.data.weather[0].description,
                humidity: response.data.main.humidity,
                windSpeed: response.data.wind.speed,
                icon: response.data.weather[0].icon
            };

            this.cache.set(cacheKey, weatherData);
            return weatherData;
        } catch (error) {
            console.error('Weather API Error:', error);
        }
    }

    async getCountryData(countryName) {
        try {
            const cacheKey = `country_${countryName.toLowerCase()}`;
            const cached = this.cache.get(cacheKey);
            if (cached) return cached;

            const response = await axios.get(`${this.countryApiUrl}/name/${encodeURIComponent(countryName)}`);
            
            if (response.data && response.data.length > 0) {
                const country = response.data[0];
                const countryData = {
                    name: country.name.common,
                    capital: country.capital?.[0],
                    population: country.population,
                    currencies: country.currencies ? Object.keys(country.currencies) : [],
                    languages: country.languages ? Object.values(country.languages) : [],
                    region: country.region,
                    subregion: country.subregion,
                    timezones: country.timezones,
                    flag: country.flags.svg
                };

                this.cache.set(cacheKey, countryData);
                return countryData;
            }

            return null;
        } catch (error) {
            console.error('Country API Error:', error);
            return null;
        }
    }
}

export default new APIService();
