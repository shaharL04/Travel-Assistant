import axios from 'axios';
import NodeCache from 'node-cache';
import promptManager from './promptManager.js';
import apiService from './apiService.js';
import functionCallingService from './functionCallingService.js';
import dotenv from 'dotenv';
dotenv.config();

class LLMService {
    constructor() {
        this.conversationCache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL
        this.apiUrl = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
        this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
        this.apiKey = process.env.GEMINI_API_KEY;
    }

    // Combined analysis: classification, extraction, and function decision in one LLM call
    async analyzeAndClassify(userMessage, context = []) {
        try {
            console.log(`[ANALYSIS] Starting combined analysis for message: "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"`);
            console.log(`[ANALYSIS] Context has ${context.length} previous messages`);
            
            // Build classification prompt using the template
            const classificationPrompt = await this.buildClassificationPrompt(userMessage);
            
            // Call 1: Combined classification, extraction, and function decision
            const response = await this.callGeminiAPI(classificationPrompt, true);
            
            if (response.type === 'function_call') {
                console.log('[ANALYSIS] SUCCESS: Function call received from Gemini!');
                console.log('[ANALYSIS] Function call details:', response.functionCall);
                
                // Execute the analysis function to get classification and function decision
                const analysis = await functionCallingService.executeFunctionCalls([{
                    name: response.functionCall.name,
                    args: response.functionCall.args
                }]);
                
                if (analysis.analysis) {
                    console.log('[ANALYSIS] Analysis completed successfully:', analysis.analysis);
                    return analysis.analysis;
                } else {
                    console.error('[ANALYSIS] Function execution failed - no analysis result');
                    throw new Error('Function execution returned no analysis result');
                }
            } else if (response.type === 'text') {
                // Gemini returned text instead of using function calling - this should not happen
                console.error('[ANALYSIS] INFO: Gemini returned text instead of using function calling!');
                console.error('[ANALYSIS] response.type:', response.type);
                console.error('[ANALYSIS] Text received:', response.text);
                console.error('[ANALYSIS] This indicates the prompt was not followed correctly.');
                
                // Since function calling failed, fall back to text parsing as emergency backup
                console.log('[ANALYSIS] Falling back to emergency text parsing...');
                return {
                    category: "general",
                    city: "",
                    country: "",
                    function_to_call: "none",
                    function_args: {
                        city: "",
                        country: ""
                    }
                };
            }
        } catch (error) {
            console.error('[ANALYSIS] Error in analysis:', error);
            console.log('[ANALYSIS] Function calling failed, falling back to emergency text parsing');
            
        }
    }


    async buildClassificationPrompt(userMessage) {
        try {
            const classificationPrompt = await promptManager.getClassificationPrompt();
            return promptManager.extractPromptContent(classificationPrompt).replace('{{userMessage}}', userMessage);
        } catch (error) {
            console.error('[ANALYSIS] Error building classification prompt:', error);
            // Fallback to simple prompt if template loading fails
            return `Analyze this travel request and return JSON: ${userMessage}`;
        }
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




    async generateResponse(userMessage, sessionId, externalData = null) {
        try {
            // get conversation context
            const context = this.getConversationContext(sessionId);
            
            // STEP 1: Combined analysis (classification, extraction, and function decision)
            console.log('[STEP 1] Starting combined analysis...');
            const analysisResult = await this.analyzeAndClassify(userMessage, context);

            // for debugging purposes
            const messageCategory = analysisResult.category;
            const city = analysisResult.city;
            const country = analysisResult.country;
            console.log(`[STEP 1] Message classified as: "${messageCategory}"`);
            console.log(`[STEP 1] Extracted city: "${city || 'empty'}", country: "${country || 'empty'}"`);
            
            // execute external apis if needed
            let finalExternalData = externalData || {};
            if (analysisResult.function_to_call && analysisResult.function_to_call !== 'none') {
                console.log('[STEP 1] Executing external APIs based on analysis...');
                const apiResults = await functionCallingService.executeExternalAPIs(analysisResult);
                console.log(`[STEP 1] API results:`, apiResults);
                finalExternalData = { ...finalExternalData, ...apiResults };
            } else {
                console.log('[STEP 1] No external APIs needed');
            }
            
            // STEP 2: Generate final response with external data
            console.log('[STEP 2] Generating final response...');
            const hasSignificantExternalData = finalExternalData && Object.keys(finalExternalData).length > 0;
            console.log(`[STEP 2] External data available: ${hasSignificantExternalData}`);
            console.log(`[STEP 2] External data: ${JSON.stringify(finalExternalData)}`);
            
            // Select prompt based on classification and external data availability
            let prompt;
            let promptType = '';
            
            // use category specific prompts
            switch (messageCategory) {
                case 'itinerary':
                    console.log('[STEP 2] Using ITINERARY prompt with external data integration');
                    prompt = await this.getItineraryPrompt(userMessage, context, finalExternalData);
                    promptType = 'itinerary';
                    break;
                case 'planning':
                    console.log('[STEP 2] Using PLANNING prompt with external data integration');
                    prompt = await this.getPlanningPrompt(userMessage, context, finalExternalData);
                    promptType = 'planning';
                    break;
                case 'packing':
                    console.log('[STEP 2] Using PACKING prompt with external data integration');
                    prompt = await this.getPackingPrompt(userMessage, context, finalExternalData);
                    promptType = 'packing';
                    break;
                case 'destination':
                    console.log('[STEP 2] Using DESTINATION prompt with external data integration');
                    prompt = await this.getDestinationPrompt(userMessage, context, finalExternalData);
                    promptType = 'destination';
                    break;
                case 'general':
                default:
                    console.log('[STEP 2] Using DESTINATION prompt as GENERAL fallback with external data integration');
                    prompt = await this.getDestinationPrompt(userMessage, context, finalExternalData);
                    promptType = 'destination_fallback';
                    break;
            }
            
            console.log(`[STEP 2] Final prompt type: "${promptType}"`);
            console.log(`[STEP 2] Prompt length: ${prompt.length} characters`);

            // Call LLM API for final response
            const response = await this.callLLM(prompt);
            
            // Update conversation context
            this.updateConversationContext(sessionId, userMessage, response);
            
            console.log(`[STEP 2] Response generated successfully with prompt type: "${promptType}"`);
            
            return {
                response,
                context: context.length,
                usedExternalData: !!finalExternalData && Object.keys(finalExternalData).length > 0,
                messageCategory: messageCategory,
                promptType: promptType,
                parsedDestination: { city, country },
                externalData: finalExternalData
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
            const response = await this.callGeminiAPI(prompt);
            
            // Return just the text content for final response generation
            if (response.type === 'text') {
                return response.text;
            } else {
                throw new Error('Expected text response for final generation, got function call');
            }
        } catch (error) {
            console.error('LLM API Error:', error);
            throw new Error('Failed to communicate with LLM service');
        }
    }

    async callGeminiAPI(prompt, useFunctionCalling = false) {
        try {
            if (!this.apiKey) {
                throw new Error('Gemini API key is required. Please set GEMINI_API_KEY in your environment variables.');
            }

            const requestBody = {
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
                    maxOutputTokens: 700,
                    topP: 0.9,
                    topK: 40
                }
            };

            // add function calling tools if requested
            if (useFunctionCalling) {
                requestBody.tools = [
                    {
                        functionDeclarations: functionCallingService.getFunctionDeclarations()
                    }
                ];
            }

            const response = await axios.post(`${this.apiUrl}?key=${this.apiKey}`, requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('[GEMINI API] Full response data:', JSON.stringify(response.data, null, 2));

            const candidate = response.data.candidates?.[0];
            if (!candidate) {
                console.error('[GEMINI API] No candidates in response');
                throw new Error('No response candidate received from Gemini API');
            }

            const part = candidate.content?.parts?.[0];
            if (!part) {
                throw new Error('No content parts received from Gemini API');
            }

            if (part.functionCall) {
                console.log('[GEMINI API] Function call detected:', part.functionCall);
                return {
                    type: 'function_call',
                    functionCall: part.functionCall
                };
            }

            const generatedText = part.text;
            if (generatedText) {
                
                const cleanText = generatedText
                    .replace(/^```text\s*/, '')  
                    .replace(/```\s*$/, '')
                    .replace(/^["']+text\s*/, '')
                    .trim();

                console.log('[GEMINI API] Text preview (first 200 chars):', cleanText.substring(0, 200));

                return {
                    type: 'text',
                    text: cleanText
                };
            }

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
