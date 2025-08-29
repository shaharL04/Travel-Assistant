import axios from 'axios';
import NodeCache from 'node-cache';
import promptManager from './promptManager.js';
import dotenv from 'dotenv';
dotenv.config();

class LLMService {
    constructor() {
        this.conversationCache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL
        this.apiUrl = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
        this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
        this.apiKey = process.env.GEMINI_API_KEY;
    }

    // LLM-based message classification and destination extraction
    async classifyUserMessage(userMessage, context = []) {
        try {
            console.log(`[CLASSIFICATION] Starting LLM-based classification for message: "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"`);
            console.log(`[CLASSIFICATION] Context has ${context.length} previous messages`);
            
            const classificationPrompt = await promptManager.buildClassificationPrompt(userMessage, context);
            console.log(`[CLASSIFICATION] Classification prompt length: ${classificationPrompt.length} characters`);
            
            const response = await this.callLLM(classificationPrompt);
            const responseText = response.trim();
            
            console.log(`[CLASSIFICATION] LLM raw response: "${responseText}"`);
            
            // Parse the response format: "category|destination"
            const parts = responseText.split('|');
            if (parts.length === 2) {
                const category = parts[0].trim().toLowerCase();
                const destination = parts[1].trim();
                
                console.log(`[CLASSIFICATION] Extracted category: "${category}"`);
                console.log(`[CLASSIFICATION] Extracted destination: "${destination}"`);
                
                // Validate the classification
                const validCategories = ['destination', 'planning', 'itinerary', 'packing', 'general'];
                if (validCategories.includes(category)) {
                    console.log(`[CLASSIFICATION] Valid classification: "${category}" with destination: "${destination}"`);
                    return { category, destination: destination === 'none' ? null : destination };
                } else {
                    console.log(`[CLASSIFICATION] Invalid classification "${category}", defaulting to general`);
                    return { category: 'general', destination: null };
                }
            } else {
                console.log(`[CLASSIFICATION] Invalid response format, defaulting to general`);
                return { category: 'general', destination: null };
            }
        } catch (error) {
            console.error('[CLASSIFICATION] Error in LLM-based classification:', error);
            console.log('[CLASSIFICATION] Falling back to keyword-based classification');
            const fallbackCategory = this.fallbackClassification(userMessage);
            console.log(`[CLASSIFICATION] Fallback classification result: "${fallbackCategory}"`);
            return { category: fallbackCategory, destination: null };
        }
    }

    // Fallback classification using keywords (for error recovery)
    fallbackClassification(message) {
        const lowerMessage = message.toLowerCase();
        console.log(`[FALLBACK] Analyzing message for keywords: "${message}"`);
        
        // Check for itinerary-specific keywords
        if (lowerMessage.includes('itinerary') || lowerMessage.includes('day-by-day') || 
            lowerMessage.includes('daily') || lowerMessage.includes('schedule') ||
            /\d+\s*(day|week)/i.test(message)) {
            console.log(`[FALLBACK] Detected itinerary keywords - returning "itinerary"`);
            return 'itinerary';
        }
        
        // Check for planning keywords
        if (lowerMessage.includes('plan') || lowerMessage.includes('organize') || 
            lowerMessage.includes('coordinate') || lowerMessage.includes('logistics')) {
            console.log(`[FALLBACK] Detected planning keywords - returning "planning"`);
            return 'planning';
        }
        
        // Check for destination keywords
        if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || 
            lowerMessage.includes('where') || lowerMessage.includes('destination')) {
            console.log(`[FALLBACK] Detected destination keywords - returning "destination"`);
            return 'destination';
        }
        
        // Check for packing keywords
        if (lowerMessage.includes('pack') || lowerMessage.includes('bring') || 
            lowerMessage.includes('luggage') || lowerMessage.includes('clothing')) {
            console.log(`[FALLBACK] Detected packing keywords - returning "packing"`);
            return 'packing';
        }
        
        console.log(`[FALLBACK] No specific keywords detected - returning "general"`);
        return 'general';
    }

    // Get system prompt from markdown file
    async getSystemPrompt() {
        try {
            const systemPrompt = await promptManager.getSystemPrompt();
            return promptManager.extractPromptContent(systemPrompt);
        } catch (error) {
            console.error('Error loading system prompt from markdown file:', error);
            throw new Error('Failed to load system prompt from markdown file');
        }
    }

    // Get destination prompt from markdown file
    async getDestinationPrompt(userMessage, context, externalData = null) {
        try {
            return await promptManager.buildDestinationPrompt(userMessage, context, externalData);
        } catch (error) {
            console.error('Error building destination prompt from markdown file:', error);
            throw new Error('Failed to load destination prompt from markdown file');
        }
    }

    // Get planning prompt from markdown file
    async getPlanningPrompt(userMessage, context, externalData = null) {
        try {
            return await promptManager.buildPlanningPrompt(userMessage, context, externalData);
        } catch (error) {
            console.error('Error building planning prompt from markdown file:', error);
            throw new Error('Failed to load planning prompt from markdown file');
        }
    }

    // Get itinerary prompt from markdown file
    async getItineraryPrompt(userMessage, context, externalData = null) {
        try {
            return await promptManager.buildItineraryPrompt(userMessage, context, externalData);
        } catch (error) {
            console.error('Error building itinerary prompt from markdown file:', error);
            throw new Error('Failed to load itinerary prompt from markdown file');
        }
    }

    // Get packing prompt from markdown file
    async getPackingPrompt(userMessage, context, externalData = null) {
        try {
            return await promptManager.buildPackingPrompt(userMessage, context, externalData);
        } catch (error) {
            console.error('Error building packing prompt from markdown file:', error);
            throw new Error('Failed to load packing prompt from markdown file');
        }
    }



    // STEP 2: Determine which functions to call based on user request
    async determineFunctionCalls(userMessage, messageCategory, city, country, context) {
        try {
            console.log('[FUNCTION CALLING] Building function calling prompt...');
            const functionCallPrompt = await promptManager.buildFunctionCallPrompt(userMessage, messageCategory, city, country, context);
            
            console.log('[FUNCTION CALLING] Calling LLM for function decisions...');
            const response = await this.callLLM(functionCallPrompt);
            
            console.log('[FUNCTION CALLING] LLM response:', response);
            
            // Parse the JSON response - handle markdown code blocks
            try {
                let jsonString = response.trim();
                
                // Remove markdown code blocks if present
                if (jsonString.startsWith('```json')) {
                    jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (jsonString.startsWith('```')) {
                    jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }
                
                const functionCalls = JSON.parse(jsonString);
                console.log('[FUNCTION CALLING] Parsed function calls:', functionCalls);
                return functionCalls;
            } catch (parseError) {
                console.error('[FUNCTION CALLING] Error parsing function calls JSON:', parseError);
                console.log('[FUNCTION CALLING] Raw response:', response);
                return { function_calls: [] };
            }
        } catch (error) {
            console.error('[FUNCTION CALLING] Error in determineFunctionCalls:', error);
            return { function_calls: [] };
        }
    }

    // Execute the function calls and return results
    async executeFunctionCalls(functionCalls) {
        try {
            console.log('[FUNCTION EXECUTION] Starting function execution...');
            const results = {};
            
            for (const functionCall of functionCalls) {
                const { name, args } = functionCall;
                console.log(`[FUNCTION EXECUTION] Executing ${name} with args:`, args);
                
                try {
                    let result = null;
                    
                    switch (name) {
                        case 'getWeatherData':
                            result = await this.callWeatherAPI(args.location);
                            if (result) results.weather = result;
                            break;
                            
                        case 'getCountryData':
                            result = await this.callCountryAPI(args.countryName);
                            if (result) results.country = result;
                            break;
                            

                            
                        default:
                            console.warn(`[FUNCTION EXECUTION] Unknown function: ${name}`);
                    }
                    
                    console.log(`[FUNCTION EXECUTION] ${name} result:`, result ? 'success' : 'failed');
                } catch (functionError) {
                    console.error(`[FUNCTION EXECUTION] Error executing ${name}:`, functionError);
                }
            }
            
            console.log('[FUNCTION EXECUTION] All functions completed');
            return results;
        } catch (error) {
            console.error('[FUNCTION EXECUTION] Error in executeFunctionCalls:', error);
            return {};
        }
    }

    // API call methods
    async callWeatherAPI(location) {
        try {
            console.log(`[WEATHER API] Calling weather API for location: "${location}"`);
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${process.env.WEATHER_API_KEY}&units=metric`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`[WEATHER API] Raw API response:`, JSON.stringify(data, null, 2));
                
                const weatherData = {
                    location: location,
                    temperature: data.main.temp,
                    description: data.weather[0].description,
                    humidity: data.main.humidity,
                    windSpeed: data.wind.speed,
                    icon: data.weather[0].icon
                };
                
                console.log(`[WEATHER API] Processed weather data:`, JSON.stringify(weatherData, null, 2));
                return weatherData;
            } else {
                console.error(`[WEATHER API] API returned error status: ${response.status}`);
            }
        } catch (error) {
            console.error('[WEATHER API] Error:', error);
        }
        return null;
    }

    async callCountryAPI(countryName) {
        try {
            console.log(`[COUNTRY API] Calling country API for country: "${countryName}"`);
            const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`[COUNTRY API] Raw API response:`, JSON.stringify(data, null, 2));
                
                if (data && data.length > 0) {
                    const country = data[0];
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
                    
                    console.log(`[COUNTRY API] Processed country data:`, JSON.stringify(countryData, null, 2));
                    return countryData;
                } else {
                    console.log(`[COUNTRY API] No country data found for: "${countryName}"`);
                }
            } else {
                console.error(`[COUNTRY API] API returned error status: ${response.status}`);
            }
        } catch (error) {
            console.error('[COUNTRY API] Error:', error);
        }
        return null;
    }





    async generateResponse(userMessage, sessionId, externalData = null) {
        try {
            // Get conversation context
            const context = this.getConversationContext(sessionId);
            
            // STEP 1: LLM-based classification to determine the appropriate prompt
            console.log('[STEP 1] Starting message classification...');
            const classificationResult = await this.classifyUserMessage(userMessage, context);
            const messageCategory = classificationResult.category;
            const extractedDestination = classificationResult.destination;
            
            console.log(`[STEP 1] Message classified as: "${messageCategory}"`);
            console.log(`[STEP 1] Extracted destination: "${extractedDestination || 'none'}"`);
            
            // Split destination into city and country
            let city = null;
            let country = null;
            if (extractedDestination) {
                const destinationParts = extractedDestination.split(',').map(part => part.trim());
                if (destinationParts.length >= 2) {
                    city = destinationParts[0];
                    country = destinationParts[1];
                } else if (destinationParts.length === 1) {
                    city = destinationParts[0];
                    country = destinationParts[0]; // Use city as country if only one part
                }
                console.log(`[STEP 1] Split destination - City: "${city}", Country: "${country}"`);
            }
            
            // STEP 2: Function calling to determine which APIs to call
            let finalExternalData = externalData || {};
            if (extractedDestination) {
                console.log('[STEP 2] Starting function calling...');
                const functionCallResult = await this.determineFunctionCalls(userMessage, messageCategory, city, country, context);
                console.log(`[STEP 2] Function calls determined:`, functionCallResult);
                
                // Execute the function calls and get external data
                if (functionCallResult.function_calls && functionCallResult.function_calls.length > 0) {
                    console.log('[STEP 2] Executing function calls...');
                    const apiResults = await this.executeFunctionCalls(functionCallResult.function_calls);
                    console.log(`[STEP 2] API results keys:`, Object.keys(apiResults));
                    console.log(`[STEP 2] Full API results:`, JSON.stringify(apiResults, null, 2));
                    finalExternalData = { ...finalExternalData, ...apiResults };
                } else {
                    console.log('[STEP 2] No function calls needed');
                }
            } else {
                console.log('[STEP 2] No destination extracted, skipping function calling');
            }
            
            // STEP 3: Generate final response with external data
            console.log('[STEP 3] Generating final response...');
            const hasSignificantExternalData = finalExternalData && Object.keys(finalExternalData).length > 0;
            console.log(`[STEP 3] External data available: ${hasSignificantExternalData}`);
            console.log(`[STEP 3] External data: ${JSON.stringify(finalExternalData)}`);
            
            // Select prompt based on classification and external data availability
            let prompt;
            let promptType = '';
            
            // Always use category-specific prompts - they all handle external data
            switch (messageCategory) {
                case 'itinerary':
                    console.log('[STEP 3] Using ITINERARY prompt with external data integration');
                    prompt = await this.getItineraryPrompt(userMessage, context, finalExternalData);
                    promptType = 'itinerary';
                    break;
                case 'planning':
                    console.log('[STEP 3] Using PLANNING prompt with external data integration');
                    prompt = await this.getPlanningPrompt(userMessage, context, finalExternalData);
                    promptType = 'planning';
                    break;
                case 'packing':
                    console.log('[STEP 3] Using PACKING prompt with external data integration');
                    prompt = await this.getPackingPrompt(userMessage, context, finalExternalData);
                    promptType = 'packing';
                    break;
                case 'destination':
                    console.log('[STEP 3] Using DESTINATION prompt with external data integration');
                    prompt = await this.getDestinationPrompt(userMessage, context, finalExternalData);
                    promptType = 'destination';
                    break;
                case 'general':
                default:
                    console.log('[STEP 3] Using DESTINATION prompt as GENERAL fallback with external data integration');
                    prompt = await this.getDestinationPrompt(userMessage, context, finalExternalData);
                    promptType = 'destination_fallback';
                    break;
            }
            
            console.log(`[STEP 3] Final prompt type: "${promptType}"`);
            console.log(`[STEP 3] Prompt length: ${prompt.length} characters`);

            // Call LLM API for final response
            const response = await this.callLLM(prompt);
            
            // Update conversation context
            this.updateConversationContext(sessionId, userMessage, response);
            
            console.log(`[STEP 3] Response generated successfully with prompt type: "${promptType}"`);
            
            return {
                response,
                context: context.length,
                usedExternalData: !!finalExternalData && Object.keys(finalExternalData).length > 0,
                messageCategory: messageCategory,
                promptType: promptType,
                extractedDestination: extractedDestination
            };
        } catch (error) {
            console.error('LLM Service Error:', error);
            return {
                response: "I apologize, but I'm having trouble processing your request right now. Could you please try rephrasing your question?",
                error: true
            };
        }
    }

    async callLLM(prompt) {
        try {
            return await this.callGeminiAPI(prompt);
        } catch (error) {
            console.error('LLM API Error:', error);
            throw new Error('Failed to communicate with LLM service');
        }
    }

    async callGeminiAPI(prompt) {
        try {
            if (!this.apiKey) {
                throw new Error('Gemini API key is required. Please set GEMINI_API_KEY in your environment variables.');
            }

            const response = await axios.post(`${this.apiUrl}?key=${this.apiKey}`, {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                    topP: 0.9,
                    topK: 40
                }
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
            return generatedText || "I'm sorry, I couldn't generate a response at the moment.";
        } catch (error) {
            console.error('Gemini API Error:', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            throw new Error('Failed to communicate with Gemini API');
        }
    }

    getConversationContext(sessionId) {
        return this.conversationCache.get(sessionId) || [];
    }

    updateConversationContext(sessionId, userMessage, assistantResponse) {
        const context = this.getConversationContext(sessionId);
        context.push(
            { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
            { role: 'assistant', content: assistantResponse, timestamp: new Date().toISOString() }
        );
        
        // Keep only last 50 messages to manage context length
        if (context.length > 50) {
            context.splice(0, context.length - 50);
        }
        
        this.conversationCache.set(sessionId, context);
    }



}

export default new LLMService();
