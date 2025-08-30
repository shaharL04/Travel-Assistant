import apiService from './apiService.js';

class FunctionCallingService {
    constructor() {
        // Define available functions with Gemini-compatible schemas
        this.availableFunctions = [
            {
                name: "analyze_travel_request",
                description: "Classify the user's travel question, extract entities, and decide which external data to fetch if needed. If external data is needed, provide only the city name as the function argument. Use null for unknown optional fields. If category is missing, fallback to 'destination'.",
                parameters: {
                    type: "object",
                    properties: {
                        category: {
                            type: "string",
                            enum: ["destination", "planning", "itinerary", "packing", "general"]
                        },
                        city: {
                            type: "string"
                        },
                        country: {
                            type: "string"
                        },
                        function_to_call: {
                            type: "string",
                            enum: ["get_weather", "get_country_info", "none"]
                        },
                        function_args: {
                            type: "object",
                            properties: {
                                city: {
                                    type: "string",
                                    description: "City name for weather API calls. Use empty string if unknown."
                                },
                                country: {
                                    type: "string", 
                                    description: "Country name for country info API calls. Use empty string if unknown."
                                }
                            }
                        }
                    },
                    required: ["category"]
                }
            }
        ];
    }

    // Get function declarations for Gemini API
    getFunctionDeclarations() {
        return this.availableFunctions;
    }

    // Execute function calls and return results
    async executeFunctionCalls(functionCalls) {
        try {
            console.log('[FUNCTION EXECUTION] Starting function execution...');
            
            for (const functionCall of functionCalls) {
                const { name, args } = functionCall;
                console.log(`[FUNCTION EXECUTION] Executing ${name} with args:`, args);
                
                if (name === 'analyze_travel_request') {
                    console.log('[FUNCTION EXECUTION] analyze_travel_request called - returning analysis directly');
                    return {
                        analysis: {
                            category: args.category,
                            city: args.city,
                            country: args.country,
                            function_to_call: args.function_to_call,
                            function_args: args.function_args
                        }
                    };
                }
                
                // If we reach here, it's an unknown function
                console.warn(`[FUNCTION EXECUTION] Unknown function: ${name}`);
            }
            
            console.log('[FUNCTION EXECUTION] No valid functions found');
            return {};
        } catch (error) {
            console.error('[FUNCTION EXECUTION] Error in executeFunctionCalls:', error);
            return {};
        }
    }
    

        async executeExternalAPIs(analysis) {
        try {
            console.log('[EXTERNAL API] Executing external APIs based on analysis:', analysis);
            const results = {};
            
            if (analysis.function_to_call === 'get_weather' && analysis.function_args?.city && analysis.function_args.city.trim() !== '') {
                console.log('[EXTERNAL API] Fetching weather data for city:', analysis.function_args.city);
                const weatherData = await apiService.getWeatherData(analysis.function_args.city);
                if (weatherData) results.weather = weatherData;
            }
            
            if (analysis.function_to_call === 'get_country_info' && analysis.function_args?.country && analysis.function_args.country.trim() !== '') {
                console.log('[EXTERNAL API] Fetching country data for country:', analysis.function_args.country);
                const countryData = await apiService.getCountryData(analysis.function_args.country);
                if (countryData) results.country = countryData;
            }
            
            console.log('[EXTERNAL API] External API results:', results);
            return results;
        } catch (error) {
            console.error('[EXTERNAL API] Error executing external APIs:', error);
            return {};
        }
    }


}

export default new FunctionCallingService();
