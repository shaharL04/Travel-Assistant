import apiService from './apiService.js';
import promptManager from './promptManager.js';

class FunctionCallingService {
    constructor() {
        // Define available functions with Gemini-compatible schemas
        this.availableFunctions = [
            {
                name: "getWeatherData",
                description: "Get current weather information for a specific location",
                parameters: {
                    type: "object",
                    properties: {
                        location: {
                            type: "string",
                            description: "The city(e.g., 'Paris')"
                        }
                    },
                    required: ["location"]
                }
            },
            {
                name: "getCountryData",
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
            const results = {};
            
            for (const functionCall of functionCalls) {
                const { name, args } = functionCall;
                console.log(`[FUNCTION EXECUTION] Executing ${name} with args:`, args);
                
                try {
                    let result = null;
                    
                    switch (name) {
                        case 'getWeatherData':
                            result = await apiService.getWeatherData(args.location);
                            if (result) results.weather = result;
                            break;
                            
                        case 'getCountryData':
                            result = await apiService.getCountryData(args.countryName);
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

    // Build function calling prompt for LLM
    async buildFunctionCallPrompt(userMessage, messageCategory, city, country, context) {
        try {
            const functionCallTemplate = await promptManager.getFunctionCallPrompt();
            
            const variables = {
                USER_MESSAGE: userMessage,
                EXTRACTED_INTENT: messageCategory,
                EXTRACTED_PARAMETERS: JSON.stringify({ city: city, country: country }),
                CONVERSATION_CONTEXT: context.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
                AVAILABLE_FUNCTIONS: this.availableFunctions.map(func => {
                    return `- ${func.name}: ${func.description}
                    Parameters: ${JSON.stringify(func.parameters, null, 2)}`;
                    }).join('\n')
            };

            return promptManager.replaceTemplateVariables(functionCallTemplate, variables);
        } catch (error) {
            console.error('[FUNCTION CALLING] Error building function call prompt:', error);

        }
    }

    // Parse LLM function calling response
    parseFunctionCallResponse(response) {
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
    }
}

export default new FunctionCallingService();
