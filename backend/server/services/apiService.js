import axios from 'axios';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';
dotenv.config();

class APIService {
    constructor() {
        this.cache = new NodeCache({ stdTTL: 1800 }); // 30 minutes TTL
        
        // Load environment variables
        this.weatherApiKey = process.env.WEATHER_API_KEY;
        this.openTripMapApiKey = process.env.OPENTRIPMAP_API_KEY;
        
        // API endpoints
        this.countryApiUrl = 'https://restcountries.com/v3.1';
        this.weatherApiUrl = 'https://api.openweathermap.org/data/2.5';
        this.openTripMapApiUrl = 'https://api.opentripmap.org/0.1/en/places';
        
    }

    // Enhanced decision method for when to use external data vs LLM knowledge
    shouldUseExternalData(userMessage, conversationContext = []) {
        const externalDataKeywords = {
            weather: ['weather', 'temperature', 'climate', 'rain', 'sunny', 'cold', 'hot', 'season', 'forecast', 'humidity', 'wind'],
            country: ['country', 'currency', 'language', 'population', 'capital', 'timezone', 'culture', 'customs', 'traditions'],
            attractions: ['attractions', 'sights', 'landmarks', 'museums', 'restaurants', 'hotels', 'places', 'visit', 'things to do', 'tourist']
        };

        const message = userMessage.toLowerCase();
        const contextText = conversationContext.map(msg => msg.content).join(' ').toLowerCase();
        const fullText = `${message} ${contextText}`;
        
        const needsExternalData = {};
        let confidenceScore = 0;

        Object.entries(externalDataKeywords).forEach(([type, keywords]) => {
            const keywordMatches = keywords.filter(keyword => 
                fullText.includes(keyword)
            ).length;
            
            needsExternalData[type] = keywordMatches > 0;
            confidenceScore += keywordMatches;
        });

        // Additional context-based decisions
        const hasDestination = this.extractDestination(userMessage) || conversationContext.some(msg => this.extractDestination(msg.content));
        
        if (hasDestination) {
            confidenceScore += 2; // Boost confidence when destination is mentioned
        }

        // Time-based decisions (weather queries are more relevant for current/future dates)
        const timeKeywords = ['today', 'tomorrow', 'next week', 'this month', 'current', 'now'];
        const isTimeSpecific = timeKeywords.some(keyword => fullText.includes(keyword));
        
        if (isTimeSpecific && needsExternalData.weather) {
            confidenceScore += 1;
        }

        return {
            needsExternalData,
            confidenceScore,
            shouldFetch: confidenceScore >= 1,
            priority: this.calculatePriority(needsExternalData)
        };
    }

    calculatePriority(needsExternalData) {
        const priorities = {
            high: ['weather'], // Critical for travel planning
            medium: ['country'], // Important but not urgent
            low: ['attractions'] // Nice to have
        };

        const highPriority = priorities.high.filter(type => needsExternalData[type]).length;
        const mediumPriority = priorities.medium.filter(type => needsExternalData[type]).length;
        const lowPriority = priorities.low.filter(type => needsExternalData[type]).length;

        if (highPriority > 0) return 'high';
        if (mediumPriority > 0) return 'medium';
        if (lowPriority > 0) return 'low';
        return 'none';
    }

    async getRelevantExternalData(userMessage, destination = null, conversationContext = []) {
        try {
            const decision = this.shouldUseExternalData(userMessage, conversationContext);
            console.log(`[EXTERNAL DATA] Decision:`, decision);
            
            if (!decision.shouldFetch) {
                console.log(`[EXTERNAL DATA] No external data needed based on decision logic`);
                return { decision, data: {} };
            }

            const externalData = {};
            const dataNeeds = decision.needsExternalData;

            // Get weather data if needed
            if (dataNeeds.weather && destination) {
                console.log(`[EXTERNAL DATA] Fetching weather data for ${destination}`);
                const weatherData = await this.getWeatherData(destination);
                if (weatherData) {
                    externalData.weather = weatherData;
                }
            }

            // Get country information if needed
            if (dataNeeds.country && destination) {
                console.log(`[EXTERNAL DATA] Fetching country data for ${destination}`);
                const countryData = await this.getCountryData(destination);
                if (countryData) {
                    externalData.country = countryData;
                }
            }



            // Get attractions if needed
            if (dataNeeds.attractions && destination) {
                console.log(`[EXTERNAL DATA] Fetching attractions data for ${destination}`);
                const attractionsData = await this.getAttractionsData(destination);
                if (attractionsData) {
                    externalData.attractions = attractionsData;
                }
            }

            console.log(`[EXTERNAL DATA] Retrieved data:`, Object.keys(externalData));
            return { decision, data: externalData };
        } catch (error) {
            console.error('Error fetching external data:', error);
            return { decision: { shouldFetch: false }, data: {} };
        }
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



    async getAttractionsData(destination) {
        try {
            const cacheKey = `attractions_${destination.toLowerCase()}`;
            const cached = this.cache.get(cacheKey);
            if (cached) return cached;

            // Use OpenTripMap API for attractions
            try {
                const apiKey = this.openTripMapApiKey ? `&apikey=${this.openTripMapApiKey}` : '';
                
                // Get attractions (landmarks, museums, etc.)
                const attractionsResponse = await axios.get(
                    `${this.openTripMapApiUrl}/autosuggest?name=${encodeURIComponent(destination)}&radius=5000&limit=10&kinds=cultural,historic,architecture${apiKey}`
                );

                // Get restaurants
                const restaurantsResponse = await axios.get(
                    `${this.openTripMapApiUrl}/autosuggest?name=${encodeURIComponent(destination)}&radius=5000&limit=5&kinds=restaurants${apiKey}`
                );

                // Get hotels
                const hotelsResponse = await axios.get(
                    `${this.openTripMapApiUrl}/autosuggest?name=${encodeURIComponent(destination)}&radius=5000&limit=5&kinds=hotels${apiKey}`
                );

                const attractionsData = {
                    destination: destination,
                    topAttractions: this.processAttractions(attractionsResponse.data?.features || []),
                    restaurants: this.processRestaurants(restaurantsResponse.data?.features || []),
                    hotels: this.processHotels(hotelsResponse.data?.features || [])
                };

                this.cache.set(cacheKey, attractionsData);
                return attractionsData;
            } catch (openTripMapError) {
                console.warn('OpenTripMap API failed, using fallback data:', openTripMapError.message);
            }
        } catch (error) {
            console.error('Attractions API Error:', error);
        }
    }

    // Processing methods for OpenTripMap data
    processAttractions(features) {
        return features.map(feature => ({
            name: feature.properties?.name || 'Unknown',
            type: feature.properties?.kinds?.split(',')[0] || 'Attraction',
            rating: 4.0 + Math.random() * 0.5, // Mock rating
            address: feature.properties?.address?.city || feature.properties?.address?.state || 'Unknown',
            coordinates: feature.geometry?.coordinates || []
        })).slice(0, 5);
    }

    processRestaurants(features) {
        return features.map(feature => ({
            name: feature.properties?.name || 'Unknown Restaurant',
            cuisine: this.inferCuisine(feature.properties?.kinds || ''),
            price: this.getRandomPrice(),
            address: feature.properties?.address?.city || feature.properties?.address?.state || 'Unknown'
        })).slice(0, 3);
    }

    processHotels(features) {
        return features.map(feature => ({
            name: feature.properties?.name || 'Unknown Hotel',
            rating: 3 + Math.floor(Math.random() * 3), // 3-5 stars
            price: this.getRandomPrice(),
            address: feature.properties?.address?.city || feature.properties?.address?.state || 'Unknown'
        })).slice(0, 3);
    }

    inferCuisine(kinds) {
        if (kinds.includes('french')) return 'French';
        if (kinds.includes('italian')) return 'Italian';
        if (kinds.includes('chinese')) return 'Chinese';
        if (kinds.includes('japanese')) return 'Japanese';
        if (kinds.includes('indian')) return 'Indian';
        return 'International';
    }

    getRandomPrice() {
        const prices = ['$', '$$', '$$$', '$$$$'];
        return prices[Math.floor(Math.random() * prices.length)];
    }






    // Extract destination from user message
    extractDestination(userMessage) {
        const commonDestinations = [
            'paris', 'tokyo', 'new york', 'london', 'sydney', 'rome', 'barcelona',
            'amsterdam', 'berlin', 'prague', 'vienna', 'budapest', 'dubai',
            'singapore', 'bangkok', 'seoul', 'beijing', 'shanghai', 'mumbai',
            'cairo', 'cape town', 'rio de janeiro', 'buenos aires', 'mexico city'
        ];

        const message = userMessage.toLowerCase();
        const foundDestination = commonDestinations.find(dest => 
            message.includes(dest)
        );

        return foundDestination || null;
    }


    
}

export default new APIService();
