import axios from 'axios';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';
dotenv.config();

class FunctionCallingService {
    constructor() {
        this.cache = new NodeCache({ stdTTL: 1800 }); // 30 minutes TTL
        
        // Load environment variables
        this.weatherApiKey = process.env.WEATHER_API_KEY;
        
        // API endpoints
        this.countryApiUrl = 'https://restcountries.com/v3.1';
        this.weatherApiUrl = 'https://api.openweathermap.org/data/2.5';
        
        // Define available functions
        this.availableFunctions = {
            getWeatherData: {
                description: "Get current weather information for a specific location",
                parameters: {
                    type: "object",
                    properties: {
                        location: {
                            type: "string",
                            description: "The city and country (e.g., 'Paris, France')"
                        }
                    },
                    required: ["location"]
                }
            },
            getCountryData: {
                description: "Get country information including currency, language, population, etc.",
                parameters: {
                    type: "object",
                    properties: {
                        countryName: {
                            type: "string",
                            description: "The name of the country"
                        }
                    },
                    required: ["countryName"]
                }
            }
        };
    }

    // Main function calling method
    async callFunctions(userMessage, destination, conversationContext = []) {
        try {
            console.log(`[FUNCTION CALLING] Starting function calling for message: "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"`);
            console.log(`[FUNCTION CALLING] Destination: ${destination || 'none'}`);
            
            // Determine which functions to call based on message content and context
            const functionDecisions = this.analyzeFunctionNeeds(userMessage, destination, conversationContext);
            console.log(`[FUNCTION CALLING] Function decisions:`, functionDecisions);
            
            const results = {};
            
            // Call weather function if needed
            if (functionDecisions.needsWeather && destination) {
                console.log(`[FUNCTION CALLING] Calling getWeatherData for ${destination}`);
                try {
                    const weatherData = await this.getWeatherData(destination);
                    if (weatherData) {
                        results.weather = weatherData;
                    }
                } catch (error) {
                    console.error(`[FUNCTION CALLING] Weather function error:`, error);
                }
            }
            
            // Call country function if needed
            if (functionDecisions.needsCountry && destination) {
                console.log(`[FUNCTION CALLING] Calling getCountryData for ${destination}`);
                try {
                    const countryData = await this.getCountryData(destination);
                    if (countryData) {
                        results.country = countryData;
                    }
                } catch (error) {
                    console.error(`[FUNCTION CALLING] Country function error:`, error);
                }
            }
            
            console.log(`[FUNCTION CALLING] Function calling completed. Results:`, Object.keys(results));
            return {
                decisions: functionDecisions,
                data: results
            };
            
        } catch (error) {
            console.error('[FUNCTION CALLING] Error in function calling:', error);
            return {
                decisions: { needsWeather: false, needsCountry: false },
                data: {}
            };
        }
    }

    // Analyze what functions are needed based on message content
    analyzeFunctionNeeds(userMessage, destination, conversationContext = []) {
        const message = userMessage.toLowerCase();
        const contextText = conversationContext.map(msg => msg.content).join(' ').toLowerCase();
        const fullText = `${message} ${contextText}`;
        
        const needs = {
            weather: false,
            country: false
        };
        
        // Weather-related keywords
        const weatherKeywords = ['weather', 'temperature', 'climate', 'rain', 'sunny', 'cold', 'hot', 'season', 'forecast', 'humidity', 'wind'];
        needs.weather = weatherKeywords.some(keyword => fullText.includes(keyword));
        
        // Country-related keywords
        const countryKeywords = ['country', 'currency', 'language', 'population', 'capital', 'timezone', 'culture', 'customs', 'traditions'];
        needs.country = countryKeywords.some(keyword => fullText.includes(keyword));
        
        return needs;
    }

    // Function implementations
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
            return null;
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

export default new FunctionCallingService();
