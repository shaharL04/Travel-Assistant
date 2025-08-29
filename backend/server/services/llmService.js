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

    // LLM-based message classification
    async classifyUserMessage(userMessage, context = []) {
        try {
            console.log(`[CLASSIFICATION] Starting LLM-based classification for message: "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"`);
            console.log(`[CLASSIFICATION] Context has ${context.length} previous messages`);
            
            const classificationPrompt = await promptManager.buildClassificationPrompt(userMessage, context);
            console.log(`[CLASSIFICATION] Classification prompt length: ${classificationPrompt.length} characters`);
            
            const response = await this.callLLM(classificationPrompt);
            const category = response.trim().toLowerCase();
            
            console.log(`[CLASSIFICATION] LLM raw response: "${response.trim()}"`);
            console.log(`[CLASSIFICATION] Extracted category: "${category}"`);
            
            // Validate the classification
            const validCategories = ['destination', 'planning', 'itinerary', 'packing', 'general'];
            if (validCategories.includes(category)) {
                console.log(`[CLASSIFICATION] Valid classification: "${category}"`);
                return category;
            } else {
                console.log(`[CLASSIFICATION] Invalid classification "${category}", defaulting to general`);
                return 'general';
            }
        } catch (error) {
            console.error('[CLASSIFICATION] Error in LLM-based classification:', error);
            console.log('[CLASSIFICATION] Falling back to keyword-based classification');
            const fallbackCategory = this.fallbackClassification(userMessage);
            console.log(`[CLASSIFICATION] Fallback classification result: "${fallbackCategory}"`);
            return fallbackCategory;
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

    // Get direct itinerary prompt from markdown file
    async getDirectItineraryPrompt(userMessage, context, externalData = null) {
        try {
            return await promptManager.buildItineraryPrompt(userMessage, context, externalData);
        } catch (error) {
            console.error('Error building direct itinerary prompt from markdown file:', error);
            throw new Error('Failed to load direct itinerary prompt from markdown file');
        }
    }



    async generateResponse(userMessage, sessionId, externalData = null) {
        try {
            // Get conversation context
            const context = this.getConversationContext(sessionId);
            
            // Check if external data is available and significant
            const hasSignificantExternalData = externalData && Object.keys(externalData).length > 0;
            console.log(`[PROMPT SELECTION] External data available: ${hasSignificantExternalData}`);
            console.log(`[PROMPT SELECTION] External data: ${JSON.stringify(externalData)}`);
            
            // Use LLM-based classification to determine the appropriate prompt
            console.log('[PROMPT SELECTION] Starting message classification...');
            const messageCategory = await this.classifyUserMessage(userMessage, context);
            console.log(`[PROMPT SELECTION] Message classified as: "${messageCategory}"`);
            
            // Select prompt based on classification and external data availability
            let prompt;
            let promptType = '';
            
            // Always use category-specific prompts - they all handle external data
            switch (messageCategory) {
                case 'itinerary':
                    console.log('[PROMPT SELECTION] Using ITINERARY prompt with external data integration');
                    prompt = await this.getItineraryPrompt(userMessage, context, externalData);
                    promptType = 'itinerary';
                    break;
                case 'planning':
                    console.log('[PROMPT SELECTION] Using PLANNING prompt with external data integration');
                    prompt = await this.getPlanningPrompt(userMessage, context, externalData);
                    promptType = 'planning';
                    break;
                case 'packing':
                    console.log('[PROMPT SELECTION] Using PACKING prompt with external data integration');
                    prompt = await this.getPackingPrompt(userMessage, context, externalData);
                    promptType = 'packing';
                    break;
                case 'destination':
                    console.log('[PROMPT SELECTION] Using DESTINATION prompt with external data integration');
                    prompt = await this.getDestinationPrompt(userMessage, context, externalData);
                    promptType = 'destination';
                    break;
                case 'general':
                default:
                    console.log('[PROMPT SELECTION] Using DESTINATION prompt as GENERAL fallback with external data integration');
                    prompt = await this.getDestinationPrompt(userMessage, context, externalData);
                    promptType = 'destination_fallback';
                    break;
            }
            
            console.log(`[PROMPT SELECTION] Final prompt type: "${promptType}"`);
            console.log(`[PROMPT SELECTION] Prompt length: ${prompt.length} characters`);

            // Call LLM API
            const response = await this.callLLM(prompt);
            
            // Update conversation context
            this.updateConversationContext(sessionId, userMessage, response);
            
            console.log(`[PROMPT SELECTION] Response generated successfully with prompt type: "${promptType}"`);
            
            return {
                response,
                context: context.length,
                usedExternalData: !!externalData,
                messageCategory: messageCategory,
                promptType: promptType
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
        
        // Keep only last 10 messages to manage context length
        if (context.length > 10) {
            context.splice(0, context.length - 10);
        }
        
        this.conversationCache.set(sessionId, context);
    }


    analyzeContext(userMessage, context) {
        const lastUserMessage = context.find(msg => msg.role === 'user');
        if (!lastUserMessage) {
            return 'No previous user message to analyze.';
        }

        const lastAssistantMessage = context.find(msg => msg.role === 'assistant');
        if (!lastAssistantMessage) {
            return 'No previous assistant message to analyze.';
        }

        const lastUserContent = lastUserMessage.content;
        const lastAssistantContent = lastAssistantMessage.content;

        if (lastUserContent.toLowerCase().includes('yes') || lastUserContent.toLowerCase().includes('no') || lastUserContent.toLowerCase().includes('budget')) {
            return `Last user message was a short response ("${lastUserContent}"). Understanding it as a response to the previous question.`;
        }

        if (lastUserContent.toLowerCase().includes('new topic')) {
            return `Last user message was "new topic". Adapting to the new context while maintaining previous preferences.`;
        }

        if (lastUserContent.toLowerCase().includes('previous preferences')) {
            return `Last user message was "previous preferences". Considering these preferences in the current context.`;
        }

        if (lastUserContent.toLowerCase().includes('external data')) {
            return `Last user message was "external data". Incorporating available external data into the response.`;
        }

        if (lastUserContent.toLowerCase().includes('follow-up question')) {
            return `Last user message was "follow-up question". Will provide ONE follow-up question if needed.`;
        }

        return 'No specific context analysis needed.';
    }
}

export default new LLMService();
